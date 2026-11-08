from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_database_health
from app.services.ai_service import ai_service
from app.connectors.amazon import AmazonConnector
from app.connectors.flipkart import FlipkartConnector
from app.connectors.myntra import MyntraConnector

router = APIRouter(tags=["Health & Status"])


@router.get("/health")
def get_service_health():
    """Returns general service health and version."""
    return {
        "status": "HEALTHY",
        "service": "Giftora API",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/health/database")
def get_database_health():
    """Checks MySQL 8.0 connectivity and pool status."""
    is_connected = check_database_health()
    return {
        "database": "MySQL 8.0",
        "database_name": settings.DB_NAME,
        "host": settings.DB_HOST,
        "port": settings.DB_PORT,
        "connected": is_connected,
        "status": "CONNECTED" if is_connected else "DISCONNECTED",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/ai")
def get_ai_health():
    """Checks Google Gemini AI engine configuration."""
    return {
        "engine": "Google Gemini",
        "model": settings.GEMINI_MODEL,
        "configured": ai_service.is_configured,
        "status": "CONFIGURED" if ai_service.is_configured else "NOT_CONFIGURED (Using Deterministic NLP Fallback)",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/connectors")
def get_connectors_health():
    """Verifies status of retail marketplace connectors."""
    amazon = AmazonConnector().health_check()
    flipkart = FlipkartConnector().health_check()
    myntra = MyntraConnector().health_check()

    return {
        "connectors": [amazon, flipkart, myntra],
        "timestamp": datetime.utcnow().isoformat(),
    }
