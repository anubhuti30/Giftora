from app.core.database import Base
from app.models.user import User, UserPreference
from app.models.recipient import Recipient, RecipientInterest, GiftPreference, Occasion
from app.models.conversation import Conversation, Message, SearchSession
from app.models.product import Product, ProductSource, PriceSnapshot, Recommendation
from app.models.shopping import Wishlist, WishlistItem, Comparison, ComparisonItem, Feedback

__all__ = [
    "Base",
    "User",
    "UserPreference",
    "Recipient",
    "RecipientInterest",
    "GiftPreference",
    "Occasion",
    "Conversation",
    "Message",
    "SearchSession",
    "Product",
    "ProductSource",
    "PriceSnapshot",
    "Recommendation",
    "Wishlist",
    "WishlistItem",
    "Comparison",
    "ComparisonItem",
    "Feedback",
]
