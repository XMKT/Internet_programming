from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL базы данных SQLite (файл myapp.db будет создан в той же папке, что и этот файл)
SQLALCHEMY_DATABASE_URL = "sqlite:///./myapp.db"

# Аргумент connect_args={"check_same_thread": False} нужен только для SQLite,
# чтобы разрешить использование одного соединения в нескольких потоках (например, в разных запросах FastAPI)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Создаём фабрику сессий. autocommit=False - отключаем автоматическую фиксацию,
# autoflush=False - отключаем автоматический сброс изменений в БД перед запросом
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс, от которого будут наследоваться все модели SQLAlchemy
Base = declarative_base()