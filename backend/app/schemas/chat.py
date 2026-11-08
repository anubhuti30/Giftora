from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    recipient_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    context_data: Optional[Dict[str, Any]] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_type: str
    message_content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    conversation_id: str
    reply_message: MessageResponse
    extracted_needs: Optional[Dict[str, Any]] = None
    suggested_quick_replies: Optional[List[str]] = None
    recommended_search_id: Optional[str] = None


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    recipient_id: Optional[str] = None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
