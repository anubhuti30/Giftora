from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserPreference
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def create(self, full_name: str, email: str, password: str) -> User:
        user = User(
            full_name=full_name,
            email=email.lower(),
            password_hash=get_password_hash(password),
            is_active=True,
            is_verified=False,
        )
        self.db.add(user)
        self.db.flush()

        # Initialize default user preferences
        pref = UserPreference(
            user_id=user.id,
            preferred_currency="INR",
            preferred_language="en",
            preferred_gift_style="thoughtful",
        )
        self.db.add(pref)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, full_name: Optional[str] = None) -> User:
        if full_name:
            user.full_name = full_name
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_preferences(self, user_id: str, currency: Optional[str] = None, gift_style: Optional[str] = None) -> UserPreference:
        pref = self.db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        if not pref:
            pref = UserPreference(user_id=user_id)
            self.db.add(pref)
        if currency:
            pref.preferred_currency = currency
        if gift_style:
            pref.preferred_gift_style = gift_style
        self.db.commit()
        self.db.refresh(pref)
        return pref
