from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.repositories.recipient_repo import RecipientRepository
from app.schemas.recipient import (
    RecipientCreate,
    RecipientUpdate,
    RecipientResponse,
    OccasionCreate,
    OccasionResponse,
)

router = APIRouter(prefix="/recipients", tags=["Recipient Management"])


@router.get("", response_model=List[RecipientResponse])
def list_recipients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all loved ones and recipient profiles owned by the authenticated user."""
    repo = RecipientRepository(db)
    recipients = repo.get_all_by_user(current_user.id)
    # Map relationship field to relationship_type
    result = []
    for r in recipients:
        resp = RecipientResponse(
            id=r.id,
            user_id=r.user_id,
            name=r.name,
            relationship=r.relationship_type,
            date_of_birth=r.date_of_birth,
            notes=r.notes,
            created_at=r.created_at,
            updated_at=r.updated_at,
            interests=r.interests,
            gift_preference=r.gift_preference,
        )
        result.append(resp)
    return result


@router.post("", response_model=RecipientResponse, status_code=status.HTTP_201_CREATED)
def create_recipient(
    data: RecipientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new recipient profile for the authenticated user."""
    repo = RecipientRepository(db)
    recipient = repo.create(current_user.id, data)
    return RecipientResponse(
        id=recipient.id,
        user_id=recipient.user_id,
        name=recipient.name,
        relationship=recipient.relationship_type,
        date_of_birth=recipient.date_of_birth,
        notes=recipient.notes,
        created_at=recipient.created_at,
        updated_at=recipient.updated_at,
        interests=recipient.interests,
        gift_preference=recipient.gift_preference,
    )


@router.get("/{id}", response_model=RecipientResponse)
def get_recipient(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single recipient profile, strictly enforcing ownership."""
    repo = RecipientRepository(db)
    recipient = repo.get_by_id_and_user(id, current_user.id)
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient profile not found or access denied.",
        )
    return RecipientResponse(
        id=recipient.id,
        user_id=recipient.user_id,
        name=recipient.name,
        relationship=recipient.relationship_type,
        date_of_birth=recipient.date_of_birth,
        notes=recipient.notes,
        created_at=recipient.created_at,
        updated_at=recipient.updated_at,
        interests=recipient.interests,
        gift_preference=recipient.gift_preference,
    )


@router.patch("/{id}", response_model=RecipientResponse)
def update_recipient(
    id: str,
    data: RecipientUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a recipient profile and its associated interests."""
    repo = RecipientRepository(db)
    recipient = repo.get_by_id_and_user(id, current_user.id)
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient profile not found or access denied.",
        )
    updated = repo.update(recipient, data)
    return RecipientResponse(
        id=updated.id,
        user_id=updated.user_id,
        name=updated.name,
        relationship=updated.relationship_type,
        date_of_birth=updated.date_of_birth,
        notes=updated.notes,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        interests=updated.interests,
        gift_preference=updated.gift_preference,
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipient(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a recipient profile and cascade associated preferences."""
    repo = RecipientRepository(db)
    recipient = repo.get_by_id_and_user(id, current_user.id)
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient profile not found or access denied.",
        )
    repo.delete(recipient)
    return None
