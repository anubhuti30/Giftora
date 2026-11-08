import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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
    db_connected = check_database_health()
    if db_connected:
        logger.info(f"Connected to MySQL 8.0 database '{settings.DB_NAME}' on {settings.DB_HOST}:{settings.DB_PORT}")
    else:
        logger.warning(
            f"Could not connect to MySQL database '{settings.DB_NAME}' on {settings.DB_HOST}:{settings.DB_PORT}. "
            f"Please verify MySQL80 service and credentials. Operating in resilient standalone mode."
        )
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

# Configure Cross-Origin Resource Sharing (CORS)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
if settings.CORS_ORIGINS:
    origins.extend(settings.CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
