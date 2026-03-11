from datetime import datetime
from fastapi import FastAPI, Depends, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from models import Base, User, Product, Cart, Category, Order, OrderItem
from database import SessionLocal, engine
from sql_request import init_categories, init_products, init_user
from passlib.context import CryptContext
from pydantic import BaseModel


def init_db(pwd_context):
    """Инициализация базы данных при запуске"""
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine) # Создаем таблицы 
        init_categories(db) # Создаем категории
        init_products(db) # Создаем товары
        init_user(db, pwd_context) # Создаем пользователя
        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации БД: {e}")
    finally:
        db.close()


def get_db():
    """Зависимость для получения сессии БД"""
    db = SessionLocal()  
    try:
        yield db
    finally:
        db.close()

# Pydantic модели для запросов и ответов
class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = 1

class CartUpdateRequest(BaseModel):
    product_id: int
    quantity: int


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
init_db(pwd_context)
TEST_USER_ID = 1
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Адрес React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- API для каталога ----------
@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Возвращает категории"""
    categories = db.query(Category).all()
    return {
        "categories": [
            {
                "id": cat.id,
                "name": cat.name
            } for cat in categories
        ]
    }


@app.get("/api/products")
async def get_products(
    q: Optional[str] = Query(None, description="Поисковый запрос"),
    category: Optional[str] = Query("all", description="ID категории"),
    db: Session = Depends(get_db)
):
    """Возвращает товары с фильтрацией по поиску и категории"""

    query = db.query(Product)
    
    if category and category != 'all':
        try:
            cat_id = int(category)
            query = query.filter(Product.category_id == cat_id)
        except ValueError:
            pass
    
    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    
    products = query.all()
    
    # Преобразуем продукты в JSON-совместимый формат
    products_data = []
    for product in products:
        product_dict = {
            "id": product.id,
            "name": product.name,
            "price": float(product.price) if product.price else 0,  # Decimal в float для JSON
            "description": product.description,
            "image_url": "/images/"+ product.image_url,
            "category_id": product.category_id
        }
        
        # Если есть характеристики, преобразуем их
        if hasattr(product, 'characteristics') and product.characteristics:
            product_dict["characteristics"] = product.characteristics
        else:
            product_dict["characteristics"] = {}
            
        products_data.append(product_dict)
    
    return {
        "products": products_data,
        "total": len(products_data),
        "filters": {
            "q": q,
            "category": category
        }
    }


# ---------- API для корзины ----------
@app.get("/api/cart")
async def get_cart(db: Session = Depends(get_db)):
    """Получение корзины пользователя"""
    cart_items = db.query(Cart).filter(Cart.user_id == TEST_USER_ID).all()
    
    cart_data = []
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            cart_data.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": float(product.price),
                "name": product.name,
                "description": product.description,
                "characteristics": product.characteristics if product.characteristics else {},
                "image_url": product.image_url,
                "category_id": product.category_id
            })
    
    return {"cart": cart_data}


@app.post("/api/cart/add")
async def add_to_cart(request: CartAddRequest, db: Session = Depends(get_db)):
    """Добавление товара в корзину (НЕ МЕНЯТЬ - используется в каталоге)"""
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    cart_item = db.query(Cart).filter(
        Cart.user_id == TEST_USER_ID,
        Cart.product_id == request.product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += request.quantity
    else:
        cart_item = Cart(
            user_id=TEST_USER_ID,
            product_id=request.product_id,
            quantity=request.quantity
        )
        db.add(cart_item)
    
    db.commit()
    return {"status": "success", "message": "Товар добавлен в корзину"}


@app.put("/api/cart/update")
async def update_cart_item(request: CartUpdateRequest, db: Session = Depends(get_db)):
    """Обновление количества товара в корзине"""
    if request.quantity < 0:
        raise HTTPException(status_code=400, detail="Количество не может быть отрицательным")
    
    cart_item = db.query(Cart).filter(
        Cart.user_id == TEST_USER_ID,
        Cart.product_id == request.product_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Товар не найден в корзине")
    
    if request.quantity == 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = request.quantity
    
    db.commit()
    return {"status": "success", "message": "Корзина обновлена"}


@app.delete("/api/cart/item/{product_id}")
async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
    """Удаление товара из корзины"""
    cart_item = db.query(Cart).filter(
        Cart.user_id == TEST_USER_ID,
        Cart.product_id == product_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Товар не найден в корзине")
    
    db.delete(cart_item)
    db.commit()
    
    return {"status": "success", "message": "Товар удален из корзины"}


@app.delete("/api/cart/clear")
async def clear_cart(db: Session = Depends(get_db)):
    """Очистка всей корзины"""
    db.query(Cart).filter(Cart.user_id == TEST_USER_ID).delete()
    db.commit()
    
    return {"status": "success", "message": "Корзина очищена"}


# ---------- API для заказов ----------
@app.post("/api/orders/create")
async def create_order(db: Session = Depends(get_db)):
    """Создание заказа из товаров в корзине"""
    # Получаем корзину
    cart_items = db.query(Cart).filter(Cart.user_id == TEST_USER_ID).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")
    
    # Создаем заказ
    new_order = Order(
        user_id=TEST_USER_ID,
        status="pending",
        order_date=datetime.utcnow()
    )
    db.add(new_order)
    db.flush()
    
    # Добавляем товары в заказ
    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if product:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=float(product.price)
            )
            db.add(order_item)
    
    # Очищаем корзину
    db.query(Cart).filter(Cart.user_id == TEST_USER_ID).delete()
    
    db.commit()
    
    return {
        "status": "success",
        "message": "Заказ успешно создан",
        "order_id": new_order.id
    }


@app.get("/api/orders")
async def get_orders(db: Session = Depends(get_db)):
    """Получение списка заказов"""
    orders = db.query(Order).filter(Order.user_id == TEST_USER_ID).order_by(Order.order_date.desc()).all()
    
    result = []
    for order in orders:
        items = []
        total = 0
        
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            item_total = item.quantity * float(item.price)
            total += item_total
            
            items.append({
                "product_id": item.product_id,
                "name": product.name if product else "Товар удален",
                "quantity": item.quantity,
                "price": float(item.price),
                "total": round(item_total, 2)
            })
        
        result.append({
            "id": order.id,
            "order_date": order.order_date,
            "status": order.status,
            "items": items,
            "total_amount": round(total, 2),
            "items_count": sum(item["quantity"] for item in items)
        })
    
    return {"orders": result}


@app.get("/api/orders/{order_id}")
async def get_order_details(order_id: int, db: Session = Depends(get_db)):
    """Получение деталей заказа"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == TEST_USER_ID
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    items = []
    total = 0
    
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        item_total = item.quantity * float(item.price)
        total += item_total
        
        items.append({
            "product_id": item.product_id,
            "name": product.name if product else "Товар удален",
            "quantity": item.quantity,
            "price": float(item.price),
            "total": round(item_total, 2)
        })
    
    return {
        "id": order.id,
        "order_date": order.order_date,
        "status": order.status,
        "items": items,
        "total_amount": round(total, 2),
        "items_count": sum(item["quantity"] for item in items)
    }


@app.put("/api/orders/{order_id}/cancel")
async def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """Отмена заказа"""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == TEST_USER_ID
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Можно отменить только заказы в статусе 'pending'")
    
    order.status = "cancelled"
    db.commit()
    
    return {"status": "success", "message": "Заказ отменен"}


@app.get("/api/profile")
async def get_profile(db: Session = Depends(get_db)):
    """Получение профиля"""

    user = db.query(User).filter(User.id == TEST_USER_ID).first()
    
    if not user:
        raise HTTPException(
            status_code=404, 
            detail=f"Пользователь с ID {TEST_USER_ID} не найден"
        )
    
    return {
        "profile": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "patronymic": user.patronymic,
            "email": user.email,
            "phone": user.phone,
            "full_name": f"{user.last_name} {user.first_name} {user.patronymic or ''}".strip()
        }
    }