import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from app.core.config import settings

logger = logging.getLogger("giftora.database")

# Create SQLAlchemy Engine with dialect-aware connection pooling
db_url = settings.database_url
is_sqlite = db_url.startswith("sqlite")

try:
    if is_sqlite:
        engine = create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )
    else:
        engine = create_engine(
            db_url,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_recycle=settings.DB_POOL_RECYCLE,
            pool_pre_ping=True,
            echo=settings.DEBUG,
        )
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields an independent database session per request
    and guarantees safe closure and rollback upon exception.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction rollback due to exception: {e}")
        raise
    finally:
        db.close()


def check_database_health() -> dict:
    """
    Universal health check function compatible with MySQL, PostgreSQL, and SQLite.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
            return {
                "status": "healthy",
                "connected": True,
                "database_dialect": engine.dialect.name,
            }
    except OperationalError as oe:
        logger.warning(f"Database operational error: {oe}")
        return {
            "status": "unhealthy",
            "connected": False,
            "error": "Cannot connect to database server. Check service status and credentials.",
            "details": str(oe),
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error: {se}")
        return {
            "status": "error",
            "connected": False,
            "error": str(se),
        }
