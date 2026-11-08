from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.product import ProductSourceResponse


class WishlistAddRequest(BaseModel):
    product_source_id: str
    wishlist_name: Optional[str] = "My Saved Gifts"


class WishlistItemResponse(BaseModel):
    id: str
    wishlist_id: str
    product_source_id: str
    added_at: datetime
    product_source: ProductSourceResponse

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: datetime
    items: List[WishlistItemResponse] = []

    class Config:
        from_attributes = True


class ComparisonCreateRequest(BaseModel):
    product_source_ids: List[str] = Field(..., min_length=1, max_length=4)
    search_session_id: Optional[str] = None


class ComparisonItemResponse(BaseModel):
    id: str
    comparison_id: str
    product_source_id: str
    product_source: ProductSourceResponse

    class Config:
        from_attributes = True


class ComparisonResponse(BaseModel):
    id: str
    user_id: str
    search_session_id: Optional[str] = None
    created_at: datetime
    items: List[ComparisonItemResponse] = []

    class Config:
        from_attributes = True


class FeedbackCreateRequest(BaseModel):
    recommendation_id: str
    feedback_type: str = Field(..., max_length=50) # 'relevant', 'irrelevant', 'too_expensive', 'saved'
    feedback_text: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    user_id: str
    recommendation_id: str
    feedback_type: str
    feedback_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
