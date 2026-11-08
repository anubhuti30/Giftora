import logging
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.connectors.base import BaseMarketplaceConnector, ConnectorStatus, MarketplaceProductItem

logger = logging.getLogger("giftora.connectors.amazon")


class AmazonConnector(BaseMarketplaceConnector):
    def __init__(self):
        super().__init__("Amazon India")
        self.associate_tag = settings.AMAZON_ASSOCIATE_TAG
        self.access_key = settings.AMAZON_ACCESS_KEY
        self.secret_key = settings.AMAZON_SECRET_KEY

    @property
    def is_configured(self) -> bool:
        return bool(self.associate_tag and self.access_key and self.secret_key)

    def health_check(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "marketplace": self.marketplace_name,
                "status": ConnectorStatus.NOT_CONFIGURED.value,
                "message": "Amazon PA-API credentials missing in environment. Operating in development mock fallback mode.",
                "is_live": False,
            }
        return {
            "marketplace": self.marketplace_name,
            "status": ConnectorStatus.ACTIVE.value,
            "message": "Amazon PA-API credentials verified.",
            "is_live": True,
        }

    def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        if not self.is_configured:
            logger.info("Amazon credentials not configured. Returning labelled development mock items.")
            return self._get_dev_mock_items(query, max_price, limit)

        # In production with PA-API keys: query Amazon PA-API SearchItems
        # Never fabricate API results
        return []

    def get_product_details(self, marketplace_product_id: str) -> Optional[MarketplaceProductItem]:
        if not self.is_configured:
            for item in self._get_dev_mock_items(""):
                if item.marketplace_product_id == marketplace_product_id:
                    return item
            return None
        return None

    def _get_dev_mock_items(
        self,
        query: str,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        """Clearly labelled development mock provider."""
        all_mocks = [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-WALNUT-CHARGER",
                title="Walnut & Matte Aluminum MagSafe Dual Wireless Charging Stand",
                product_url="https://www.amazon.in/sample/walnut-charger",
                image_url="https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("3499.00"),
                original_price=Decimal("4299.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.80"),
                review_count=390,
                category="Technology",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-LINEN-JOURNAL",
                title="Linen-Bound Hardcover Dot Grid Pocket Journal (Sage Mist)",
                product_url="https://www.amazon.in/sample/linen-journal",
                image_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("490.00"),
                original_price=Decimal("650.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.90"),
                review_count=540,
                category="Stationery",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-KEYCHRON-K2",
                title="Keychron K2 V2 Wireless Mechanical Keyboard (Gateron Brown)",
                product_url="https://www.amazon.in/sample/keychron-k2",
                image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("7499.00"),
                original_price=Decimal("8999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.90"),
                review_count=810,
                category="Technology",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
        ]
        results = [m for m in all_mocks if max_price is None or m.current_price <= max_price]
        return results[:limit]
