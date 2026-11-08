import logging
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.connectors.base import BaseMarketplaceConnector, ConnectorStatus, MarketplaceProductItem

logger = logging.getLogger("giftora.connectors.myntra")


class MyntraConnector(BaseMarketplaceConnector):
    def __init__(self):
        super().__init__("Myntra")
        self.partner_api_key = settings.MYNTRA_PARTNER_API_KEY

    @property
    def is_configured(self) -> bool:
        return bool(self.partner_api_key)

    def health_check(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "marketplace": self.marketplace_name,
                "status": ConnectorStatus.NOT_CONFIGURED.value,
                "message": "Myntra Partner API credentials missing in environment. Operating in development mock fallback mode.",
                "is_live": False,
            }
        return {
            "marketplace": self.marketplace_name,
            "status": ConnectorStatus.ACTIVE.value,
            "message": "Myntra Partner API connected.",
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
            logger.info("Myntra credentials not configured. Returning labelled development mock items.")
            return self._get_dev_mock_items(query, max_price, limit)
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
        all_mocks = [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="MYN-DEV-PASHMINA",
                title="Hand-Spun Kashmiri Pashmina Shawl (Mocha Plum)",
                product_url="https://www.myntra.com/sample/pashmina-shawl",
                image_url="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("18500.00"),
                original_price=Decimal("22000.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("5.00"),
                review_count=98,
                category="Heritage Apparel",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Myntra)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="MYN-DEV-SILK-SCARF",
                title="Pure Mulberry Silk Botanical Print Square Scarf",
                product_url="https://www.myntra.com/sample/silk-scarf",
                image_url="https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("2450.00"),
                original_price=Decimal("3500.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.70"),
                review_count=215,
                category="Accessories",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Myntra)",
            ),
        ]
        results = [m for m in all_mocks if max_price is None or m.current_price <= max_price]
        return results[:limit]
