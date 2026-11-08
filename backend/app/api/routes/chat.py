import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import ChatRequest, ChatResponse, MessageResponse, ConversationResponse
from app.services.ai_service import ai_service

router = APIRouter(tags=["AI Chat Assistant"])


@router.post("/chat", response_model=ChatResponse)
def handle_chat_message(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Conversational AI gifting concierge.
    Understands nuanced gifting needs, extracts intent, and provides thoughtful guidance.
    """
    user_id = current_user.id if current_user else None
    conv_id = request.conversation_id or str(uuid.uuid4())

    # If user is authenticated and DB is available, get or create conversation
    db_conv = None
    if current_user:
        try:
            if request.conversation_id:
                db_conv = db.query(Conversation).filter(
                    Conversation.id == request.conversation_id,
                    Conversation.user_id == current_user.id,
                ).first()

            if not db_conv:
                db_conv = Conversation(
                    id=conv_id,
                    user_id=current_user.id,
                    recipient_id=request.recipient_id,
                    title=request.message[:40] + ("..." if len(request.message) > 40 else ""),
                )
                db.add(db_conv)
                db.flush()

            # Record user message
            user_msg = Message(
                conversation_id=db_conv.id,
                sender_type="user",
                message_content=request.message,
            )
            db.add(user_msg)
            db.commit()
        except Exception:
            db.rollback()

    # Extract requirements via AI service
    extracted = ai_service.extract_gift_requirements(request.message)

    # Formulate assistant reply
    rel = extracted.relationship or "them"
    occ = extracted.occasion or "the occasion"
    interests_str = ", ".join(extracted.interests) if extracted.interests else "their passions"

    if extracted.clarifying_question:
        reply_text = extracted.clarifying_question
    elif extracted.interests:
        reply_text = (
            f"I love this idea! For {rel}'s {occ}, focusing on {interests_str} creates "
            f"a truly memorable and personal touch. Would you like me to curate verified "
            f"options across top marketplaces within your budget?"
        )
    else:
        reply_text = (
            f"I'm here to help you find an unforgettable gift! Tell me a bit about what "
            f"{rel} enjoys doing in their spare time, or if there's a specific budget you have in mind."
        )

    # Record assistant message in DB if authenticated
    assistant_msg_id = str(uuid.uuid4())
    if current_user and db_conv:
        try:
            asst_msg = Message(
                id=assistant_msg_id,
                conversation_id=db_conv.id,
                sender_type="assistant",
                message_content=reply_text,
            )
            db.add(asst_msg)
            db.commit()
        except Exception:
            db.rollback()

    quick_replies = [
        "Find gifts under ₹3,000",
        "Show premium aesthetic options",
        "Focus on practical everyday luxury",
    ]

    return ChatResponse(
        conversation_id=conv_id,
        reply_message=MessageResponse(
            id=assistant_msg_id,
            conversation_id=conv_id,
            sender_type="assistant",
            message_content=reply_text,
            created_at=datetime.utcnow(),
        ),
        extracted_needs=extracted.model_dump(),
        suggested_quick_replies=quick_replies,
        recommended_search_id=None,
    )


@router.get("/conversations", response_model=List[Dict[str, Any]])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all active and past conversations for the authenticated user."""
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "title": c.title,
            "recipient_id": c.recipient_id,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
            "message_count": len(c.messages),
        }
        for c in convs
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves full conversation transcript with message history."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes conversation and all related messages."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully"}
