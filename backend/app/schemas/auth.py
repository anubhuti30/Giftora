from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserPreferenceSchema(BaseModel):
    preferred_currency: str = "INR"
    preferred_language: str = "en"
    preferred_gift_style: str = "thoughtful"

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    preferences: Optional[UserPreferenceSchema] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    preferred_currency: Optional[str] = None
    preferred_gift_style: Optional[str] = None
