from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.recipient import Recipient, RecipientInterest, GiftPreference, Occasion
from app.schemas.recipient import RecipientCreate, RecipientUpdate, OccasionCreate


class RecipientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_user(self, user_id: str) -> List[Recipient]:
        return self.db.query(Recipient).filter(Recipient.user_id == user_id).order_by(Recipient.created_at.desc()).all()

    def get_by_id_and_user(self, recipient_id: str, user_id: str) -> Optional[Recipient]:
        return self.db.query(Recipient).filter(
            Recipient.id == recipient_id,
            Recipient.user_id == user_id
        ).first()

    def create(self, user_id: str, data: RecipientCreate) -> Recipient:
        recipient = Recipient(
            user_id=user_id,
            name=data.name,
            relationship_type=data.relationship,
            date_of_birth=data.date_of_birth,
            notes=data.notes,
        )
        self.db.add(recipient)
        self.db.flush()

        # Add interests if provided
        if data.interests:
            for interest in data.interests:
                item = RecipientInterest(
                    recipient_id=recipient.id,
                    interest_name=interest.strip(),
                )
                self.db.add(item)

        # Add gift preferences if provided
        pref_data = data.gift_preference
        pref = GiftPreference(
            recipient_id=recipient.id,
            minimum_budget=pref_data.minimum_budget if pref_data else 0.00,
            maximum_budget=pref_data.maximum_budget if pref_data else 25000.00,
            currency=pref_data.currency if pref_data else "INR",
            preferred_categories=pref_data.preferred_categories if pref_data else None,
            disliked_categories=pref_data.disliked_categories if pref_data else None,
            preferred_styles=pref_data.preferred_styles if pref_data else None,
            additional_notes=pref_data.additional_notes if pref_data else None,
        )
        self.db.add(pref)

        self.db.commit()
        self.db.refresh(recipient)
        return recipient

    def update(self, recipient: Recipient, data: RecipientUpdate) -> Recipient:
        if data.name is not None:
            recipient.name = data.name
        if data.relationship is not None:
            recipient.relationship_type = data.relationship
        if data.date_of_birth is not None:
            recipient.date_of_birth = data.date_of_birth
        if data.notes is not None:
            recipient.notes = data.notes

        if data.interests is not None:
            # Replace interests
            self.db.query(RecipientInterest).filter(RecipientInterest.recipient_id == recipient.id).delete()
            for interest in data.interests:
                item = RecipientInterest(
                    recipient_id=recipient.id,
                    interest_name=interest.strip(),
                )
                self.db.add(item)

        self.db.commit()
        self.db.refresh(recipient)
        return recipient

    def delete(self, recipient: Recipient) -> None:
        self.db.delete(recipient)
        self.db.commit()

    def get_occasions_by_user(self, user_id: str) -> List[Occasion]:
        return self.db.query(Occasion).filter(Occasion.user_id == user_id).order_by(Occasion.occasion_date.asc()).all()

    def create_occasion(self, user_id: str, data: OccasionCreate) -> Occasion:
        occasion = Occasion(
            user_id=user_id,
            recipient_id=data.recipient_id,
            occasion_name=data.occasion_name,
            occasion_date=data.occasion_date,
            reminder_enabled=data.reminder_enabled,
        )
        self.db.add(occasion)
        self.db.commit()
        self.db.refresh(occasion)
        return occasion
