from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel


class ProductSourceResponse(BaseModel):
    id: str
    product_id: str
    marketplace_name: str
    marketplace_product_id: str
    product_title: str
    product_url: str
    image_url: str
    current_price: Decimal
    original_price: Optional[Decimal] = None
    currency: str
    availability_status: str
    source_rating: Optional[Decimal] = None
    source_review_count: Optional[int] = None
    last_verified_at: datetime

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: str
    canonical_name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    image_url: str
    created_at: datetime
    sources: List[ProductSourceResponse] = []

    class Config:
        from_attributes = True


class ProductFilterParams(BaseModel):
    category: Optional[str] = None
    marketplace: Optional[str] = None
    max_price: Optional[Decimal] = None
    search: Optional[str] = None
    limit: int = 50
    offset: int = 0
