import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import check_database_health
from app.api.routes import (
    health,
    auth,
    recipients,
    products,
    search,
    chat,
    wishlist,
    comparison,
    occasions,
    recommendations,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("giftora.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation
    logger.info("Initializing Giftora API Backend...")
    settings.validate_deployment()
    # Ensure database tables exist across MySQL or resilient SQLite fallback
    try:
        from app.models import Base
        from app.core.database import engine
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas verified and created successfully.")
    except Exception as e:
        logger.warning(f"Database schema creation warning: {e}")

    yield
    logger.info("Shutting down Giftora API Backend...")


app = FastAPI(
    title="Giftora API",
    description=(
        "Production backend for Giftora — AI-powered personalized gift discovery and "
        "retail marketplace comparison engine across Amazon, Flipkart, and Myntra."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"error": {"code": "VALIDATION_ERROR", "message": "Request validation failed", "details": exc.errors()}})


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, exc: SQLAlchemyError):
    logger.exception("Database operation failed", extra={"error_type": type(exc).__name__})
    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"error": {"code": "DATABASE_UNAVAILABLE", "message": "The database is temporarily unavailable."}})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled API error", extra={"error_type": type(exc).__name__})
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected server error occurred."}})

# Configure Cross-Origin Resource Sharing (CORS)
origins = list(settings.CORS_ORIGINS)
if settings.ENVIRONMENT.lower() != "production":
    origins.extend(["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
    allow_origin_regex=r"https://.*\.vercel\.app" if settings.ENVIRONMENT.lower() != "production" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Health Check Endpoints at Root & API prefix
app.include_router(health.router)

# Mount Versioned API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(recipients.router, prefix=api_v1_prefix)
app.include_router(products.router, prefix=api_v1_prefix)
app.include_router(search.router, prefix=api_v1_prefix)
app.include_router(chat.router, prefix=api_v1_prefix)
app.include_router(wishlist.router, prefix=api_v1_prefix)
app.include_router(comparison.router, prefix=api_v1_prefix)
app.include_router(occasions.router, prefix=api_v1_prefix)
app.include_router(recommendations.router, prefix=api_v1_prefix)


@app.get("/")
def root_welcome():
    """Service status and interactive OpenAPI documentation link."""
    return JSONResponse({
        "service": "Giftora AI Personalized Gift Discovery API",
        "version": "1.0.0",
        "status": "ONLINE",
        "documentation": "/docs",
        "health_check": "/health",
    })
