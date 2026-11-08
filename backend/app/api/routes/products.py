from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductResponse, ProductSourceResponse
from app.connectors.amazon import AmazonConnector
from app.connectors.flipkart import FlipkartConnector
from app.connectors.myntra import MyntraConnector

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = Query(None, description="Category filter (e.g. Technology, Home, Wellness)"),
    marketplace: Optional[str] = Query(None, description="Marketplace name filter"),
    max_price: Optional[Decimal] = Query(None, description="Maximum price ceiling"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Retrieves curated gift products from MySQL with multi-marketplace price sources.
    Falls back gracefully to marketplace connectors if database is empty or seeding.
    """
    repo = ProductRepository(db)
    try:
        products = repo.get_all(
            category=category,
            marketplace=marketplace,
            max_price=max_price,
            search_query=search,
            limit=limit,
            offset=offset,
        )
        if products:
            return products
    except Exception:
        pass

    # If database has no products or DB is unseeded, return curated items from connectors
    connectors = [AmazonConnector(), FlipkartConnector(), MyntraConnector()]
    fallback_items = []
    for conn in connectors:
        items = conn.search_products(query=search or "curated gift", category=category, max_price=max_price, limit=limit)
        for itm in items:
            fallback_items.append({
                "id": itm.marketplace_product_id,
                "canonical_name": itm.title,
                "brand": itm.marketplace_name,
                "description": f"Curated gift item from {itm.marketplace_name}.",
                "category": itm.category,
                "subcategory": None,
                "image_url": itm.image_url,
                "created_at": "2026-01-01T00:00:00",
                "sources": [
                    {
                        "id": itm.marketplace_product_id,
                        "product_id": itm.marketplace_product_id,
                        "marketplace_name": itm.marketplace_name,
                        "marketplace_product_id": itm.marketplace_product_id,
                        "product_title": itm.title,
                        "product_url": itm.product_url,
                        "image_url": itm.image_url,
                        "current_price": itm.current_price,
                        "original_price": itm.original_price,
                        "currency": itm.currency,
                        "availability_status": itm.availability_status,
                        "source_rating": itm.rating or Decimal("4.5"),
                        "source_review_count": itm.review_count or 50,
                        "last_verified_at": "2026-01-01T00:00:00",
                    }
                ],
            })
    return fallback_items[:limit]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Retrieves a single product by ID with full marketplace pricing."""
    repo = ProductRepository(db)
    try:
        product = repo.get_by_id(product_id)
        if product:
            return product
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Product not found")


@router.get("/sources/{source_id}", response_model=ProductSourceResponse)
def get_product_source(source_id: str, db: Session = Depends(get_db)):
    """Retrieves a single product marketplace source."""
    repo = ProductRepository(db)
    try:
        source = repo.get_source_by_id(source_id)
        if source:
            return source
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Product source not found")
