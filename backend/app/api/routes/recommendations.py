from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.product import Recommendation
from app.repositories.shopping_repo import ShoppingRepository
from app.schemas.shopping import FeedbackCreateRequest, FeedbackResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations & Feedback"])


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
def submit_recommendation_feedback(
    request: FeedbackCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits user feedback on an AI gift recommendation (e.g., 'relevant', 'saved', 'too_expensive').
    Feeds back into preference ranking algorithms.
    """
    repo = ShoppingRepository(db)
    feedback = repo.add_feedback(
        user_id=current_user.id,
        recommendation_id=request.recommendation_id,
        feedback_type=request.feedback_type,
        feedback_text=request.feedback_text,
    )
    return {
        "message": "Feedback recorded successfully",
        "feedback_id": feedback.id,
        "recommendation_id": feedback.recommendation_id,
        "feedback_type": feedback.feedback_type,
    }
