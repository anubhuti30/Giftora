import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from app.core.config import settings

logger = logging.getLogger("giftora.database")

# Create SQLAlchemy Engine with connection pooling and pre-ping
try:
    engine = create_engine(
        settings.database_url,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_timeout=settings.DB_POOL_TIMEOUT,
        pool_recycle=settings.DB_POOL_RECYCLE,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    # Create dummy engine object or raise
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
    Health check function to verify live connection to MySQL.
    Returns status, latency/version info, or error description.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT VERSION() as version, DATABASE() as current_db;"))
            row = result.mappings().first()
            return {
                "status": "healthy",
                "connected": True,
                "version": row["version"] if row else "unknown",
                "database": row["current_db"] if row else settings.DB_NAME,
            }
    except OperationalError as oe:
        logger.warning(f"Database operational error: {oe}")
        return {
            "status": "unhealthy",
            "connected": False,
            "error": "Cannot connect to MySQL server. Check service status and credentials.",
            "details": str(oe),
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error: {se}")
        return {
            "status": "error",
            "connected": False,
            "error": str(se),
        }
