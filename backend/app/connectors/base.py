from abc import ABC, abstractmethod
from decimal import Decimal
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ConnectorStatus(str, Enum):
    ACTIVE = "ACTIVE"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    UNAVAILABLE = "UNAVAILABLE"
    RATE_LIMITED = "RATE_LIMITED"


class LinkStatus(str, Enum):
    VERIFIED = "VERIFIED"
    INCONCLUSIVE = "INCONCLUSIVE"
    INVALID = "INVALID"
    SEARCH_FALLBACK = "SEARCH_FALLBACK"


class MarketplaceProductItem(BaseModel):
    marketplace_name: str
    marketplace_product_id: str
    title: str
    product_url: Optional[str] = None
    retailer_search_url: str = ""
    link_status: LinkStatus = LinkStatus.SEARCH_FALLBACK
    is_search_fallback: bool = True
    image_url: str
    current_price: Decimal
    original_price: Optional[Decimal] = None
    currency: str = "INR"
    availability_status: str = "IN_STOCK"
    rating: Optional[Decimal] = None
    review_count: Optional[int] = None
    category: str = "General"
    is_development_mock: bool = False
    source_attribution: str = ""


class BaseMarketplaceConnector(ABC):
    """
    Abstract interface for marketplace product discovery and verification.
    Subclasses integrate with Amazon Product Advertising API, Flipkart Affiliate API,
    Myntra Partner Feeds, or development mock providers.
    """

    def __init__(self, marketplace_name: str):
        self.marketplace_name = marketplace_name

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Verify API credentials, latency, and status."""
        pass

    @abstractmethod
    def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        """Search products across the marketplace."""
        pass

    @abstractmethod
    def get_product_details(self, marketplace_product_id: str) -> Optional[MarketplaceProductItem]:
        """Retrieve live pricing, availability and specs for a specific product."""
        pass
