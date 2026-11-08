from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.recipient import Occasion

router = APIRouter(prefix="/occasions", tags=["Occasions & Milestones"])


class OccasionCreateRequest(BaseModel):
    recipient_id: Optional[str] = None
    occasion_name: str = Field(..., min_length=2, max_length=150)
    occasion_date: date
    reminder_enabled: bool = True


class OccasionResponse(BaseModel):
    id: str
    recipient_id: Optional[str] = None
    occasion_name: str
    occasion_date: date
    reminder_enabled: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[OccasionResponse])
def list_occasions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all upcoming celebrations and gift milestones."""
    return (
        db.query(Occasion)
        .filter(Occasion.user_id == current_user.id)
        .order_by(Occasion.occasion_date.asc())
        .all()
    )


@router.post("", response_model=OccasionResponse, status_code=status.HTTP_201_CREATED)
def create_occasion(
    request: OccasionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a calendar occasion with automated gift reminders."""
    occasion = Occasion(
        user_id=current_user.id,
        recipient_id=request.recipient_id,
        occasion_name=request.occasion_name,
        occasion_date=request.occasion_date,
        reminder_enabled=request.reminder_enabled,
    )
    db.add(occasion)
    db.commit()
    db.refresh(occasion)
    return occasion


@router.delete("/{occasion_id}")
def delete_occasion(
    occasion_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes an occasion milestone."""
    occ = (
        db.query(Occasion)
        .filter(Occasion.id == occasion_id, Occasion.user_id == current_user.id)
        .first()
    )
    if not occ:
        raise HTTPException(status_code=404, detail="Occasion milestone not found")
    db.delete(occ)
    db.commit()
    return {"message": "Occasion deleted successfully"}
