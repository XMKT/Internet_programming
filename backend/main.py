from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import models
from database import SessionLocal, engine
from sql_request import init_categories, init_products  

# Создаем таблицы (если еще не созданы)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Разрешаем React (порт 5173) стучаться к нам
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Адрес React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Инициализация базы данных при запуске
def init_db():
    db = SessionLocal()
    try:
        # Создаем категории
        init_categories(db)
        # Создаем товары
        init_products(db)
        print("База данных успешно инициализирована!")
    except Exception as e:
        print(f"Ошибка при инициализации БД: {e}")
    finally:
        db.close()

# Вызываем инициализацию при старте
print("sdfsdf")
init_db()

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()  
    try:
        yield db
    finally:
        db.close()

# ---------- API для каталога ----------
@app.get("/api/categories")
async def get_categories(db: Session = Depends(get_db)):
    """Возвращает все категории для выпадающего списка"""
    categories = db.query(models.Category).all()
    
    # Преобразуем в JSON-совместимый формат
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
    # Параметры из строки запроса
    q: Optional[str] = Query(None, description="Поисковый запрос"),
    category: Optional[str] = Query("all", description="ID категории"),
    db: Session = Depends(get_db)
):
    """Возвращает товары с фильтрацией по поиску и категории"""
    
    # Базовый запрос к товарам
    query = db.query(models.Product)
    
    # Фильтрация по категории, если выбрана не «Все категории»
    if category and category != 'all':
        try:
            cat_id = int(category)
            query = query.filter(models.Product.category_id == cat_id)
        except ValueError:
            # Если параметр не является числом, игнорируем его
            pass
    
    # Фильтрация по поисковому запросу (регистронезависимый поиск по названию)
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))
    
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

# ---------- Другие API ручки ----------
@app.get("/api/cart")
async def get_cart(db: Session = Depends(get_db)):
    """Получение корзины"""
    # Твоя логика для корзины
    return {"cart": []}

@app.post("/api/cart/add")
async def add_to_cart(product_id: int, db: Session = Depends(get_db)):
    """Добавление товара в корзину"""
    # Твоя логика добавления
    return {"status": "ok"}

@app.get("/api/profile")
async def get_profile(db: Session = Depends(get_db)):
    """Получение профиля"""
    # Твоя логика для профиля
    return {"profile": {"name": "Тест", "email": "test@test.com"}}

@app.put("/api/profile")
async def update_profile(profile_data: dict, db: Session = Depends(get_db)):
    """Обновление профиля"""
    # Твоя логика обновления
    return {"status": "ok"}