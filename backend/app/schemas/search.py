from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator
from app.schemas.product import ProductSourceResponse


class GiftSearchRequest(BaseModel):
    recipient_id: Optional[str] = None
    recipient_name: Optional[str] = None
    relationship: Optional[str] = None
    occasion: Optional[str] = None
    interests: Optional[List[str]] = Field(default_factory=list)
    minimum_budget: Optional[Decimal] = None
    maximum_budget: Optional[Decimal] = None
    query: Optional[str] = None
    conversation_id: Optional[str] = None

    @model_validator(mode="after")
    def validate_budget_range(self):
        if self.minimum_budget is not None and self.maximum_budget is not None and self.minimum_budget > self.maximum_budget:
            raise ValueError("minimum_budget cannot exceed maximum_budget")
        return self


class RecommendationResponse(BaseModel):
    id: str
    search_session_id: str
    product_source_id: str
    relevance_score: Decimal
    match_explanation: str
    ranking_position: int
    created_at: datetime
    product_source: ProductSourceResponse

    class Config:
        from_attributes = True


class SearchSessionResponse(BaseModel):
    id: str
    user_id: str
    recipient_id: Optional[str] = None
    conversation_id: Optional[str] = None
    occasion: Optional[str] = None
    original_query: str
    extracted_preferences: Optional[Dict[str, Any]] = None
    minimum_budget: Optional[Decimal] = None
    maximum_budget: Optional[Decimal] = None
    search_status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    recommendations: List[RecommendationResponse] = []

    class Config:
        from_attributes = True
