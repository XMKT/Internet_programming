from fastapi import FastAPI, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal
from sql_request import init_categories, init_products

# Функция-генератор сессий для маршрутов
def GetDB():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
templates.env.filters["currency"] = lambda value: f"{value:,.0f}".replace(",", " ")

# Инициализация при запуске
@app.on_event("startup")
def startup_event():
    start = True
    if start:
        models.Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            init_categories(db)
            init_products(db)
        finally:
            db.close()

# Главная страница с поддержкой поиска и фильтрации
@app.get("/", response_class=HTMLResponse)
async def MainPage(request: Request, db: Session = Depends(GetDB)):
    # Получаем параметры из строки запроса
    q = request.query_params.get('q', '')
    category = request.query_params.get('category', 'all')
    
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
    
    # Все категории для выпадающего списка
    categories = db.query(models.Category).all()
    
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "categories": categories,
            "products": products,
            "q": q,
            "category_selected": category
        }
    )

@app.get("/cart", response_class=HTMLResponse)
async def CartPage(request: Request, db: Session = Depends(GetDB)):
    return templates.TemplateResponse("cart.html", {"request": request})

@app.get("/profile", response_class=HTMLResponse)
async def ProfilePage(request: Request, db: Session = Depends(GetDB)):
    return templates.TemplateResponse("profile.html", {"request": request})