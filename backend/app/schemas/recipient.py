from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional, Any
from pydantic import BaseModel, Field


class RecipientInterestBase(BaseModel):
    interest_name: str = Field(..., min_length=1, max_length=150)
    interest_category: Optional[str] = None


class RecipientInterestCreate(RecipientInterestBase):
    pass


class RecipientInterestResponse(RecipientInterestBase):
    id: str
    recipient_id: str

    class Config:
        from_attributes = True


class GiftPreferenceBase(BaseModel):
    minimum_budget: Decimal = Field(default=Decimal("0.00"), ge=0)
    maximum_budget: Decimal = Field(default=Decimal("25000.00"), ge=0)
    currency: str = "INR"
    preferred_categories: Optional[List[str]] = None
    disliked_categories: Optional[List[str]] = None
    preferred_styles: Optional[List[str]] = None
    additional_notes: Optional[str] = None


class GiftPreferenceCreate(GiftPreferenceBase):
    pass


class GiftPreferenceUpdate(BaseModel):
    minimum_budget: Optional[Decimal] = None
    maximum_budget: Optional[Decimal] = None
    currency: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
    disliked_categories: Optional[List[str]] = None
    preferred_styles: Optional[List[str]] = None
    additional_notes: Optional[str] = None


class GiftPreferenceResponse(GiftPreferenceBase):
    id: str
    recipient_id: str

    class Config:
        from_attributes = True


class RecipientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    relationship: str = Field(..., min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    notes: Optional[str] = None
    interests: Optional[List[str]] = None
    custom_attributes: Optional[dict] = None
    disliked_gifts: Optional[List[str]] = None
    ai_memory_enabled: bool = True
    gift_preference: Optional[GiftPreferenceCreate] = None


class RecipientUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    date_of_birth: Optional[date] = None
    notes: Optional[str] = None
    interests: Optional[List[str]] = None
    custom_attributes: Optional[dict] = None
    disliked_gifts: Optional[List[str]] = None
    ai_memory_enabled: Optional[bool] = None


class RecipientResponse(BaseModel):
    id: str
    user_id: str
    name: str
    relationship: str = Field(..., serialization_alias="relationship")
    date_of_birth: Optional[date] = None
    notes: Optional[str] = None
    custom_attributes: Optional[dict] = None
    disliked_gifts: Optional[List[str]] = None
    ai_memory_enabled: bool = True
    created_at: datetime
    updated_at: datetime
    interests: List[RecipientInterestResponse] = []
    gift_preference: Optional[GiftPreferenceResponse] = None

    class Config:
        from_attributes = True


class NaturalLanguageRecipientRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=2000)


class NaturalLanguageRecipientResponse(BaseModel):
    name: str
    relationship: str
    age_group: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    disliked_gifts: List[str] = Field(default_factory=list)
    custom_attributes: dict = Field(default_factory=dict)
    suggested_budget: Optional[dict] = None
    notes: Optional[str] = None
    ai_confidence: float = 0.95


class OccasionCreate(BaseModel):
    recipient_id: Optional[str] = None
    occasion_name: str = Field(..., min_length=2, max_length=150)
    occasion_date: date
    reminder_enabled: bool = True


class OccasionResponse(BaseModel):
    id: str
    user_id: str
    recipient_id: Optional[str] = None
    occasion_name: str
    occasion_date: date
    reminder_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True
