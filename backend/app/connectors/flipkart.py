import logging
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.connectors.base import BaseMarketplaceConnector, ConnectorStatus, MarketplaceProductItem

logger = logging.getLogger("giftora.connectors.flipkart")


class FlipkartConnector(BaseMarketplaceConnector):
    def __init__(self):
        super().__init__("Flipkart")
        self.affiliate_id = settings.FLIPKART_AFFILIATE_ID
        self.affiliate_token = settings.FLIPKART_AFFILIATE_TOKEN

    @property
    def is_configured(self) -> bool:
        return bool(self.affiliate_id and self.affiliate_token)

    def health_check(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "marketplace": self.marketplace_name,
                "status": ConnectorStatus.NOT_CONFIGURED.value,
                "message": "Flipkart Affiliate credentials missing in environment. Operating in development mock fallback mode.",
                "is_live": False,
            }
        return {
            "marketplace": self.marketplace_name,
            "status": ConnectorStatus.ACTIVE.value,
            "message": "Flipkart Affiliate API configured.",
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
            logger.info("Flipkart credentials not configured. Returning labelled development mock items.")
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
                marketplace_product_id="FK-DEV-INSTAX-MINI",
                title="FujiFilm Instax Mini 12 Instant Camera (Lilac Purple)",
                product_url="https://www.flipkart.com/sample/instax-mini-12",
                image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("6499.00"),
                original_price=Decimal("7999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.80"),
                review_count=1420,
                category="Photography",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Flipkart)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="FK-DEV-EARBUDS-ANC",
                title="Noise Air Buds Pro 4 with Spatial Audio & ANC",
                product_url="https://www.flipkart.com/sample/noise-air-buds",
                image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("2999.00"),
                original_price=Decimal("4999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.60"),
                review_count=890,
                category="Electronics",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Flipkart)",
            ),
        ]
        results = [m for m in all_mocks if max_price is None or m.current_price <= max_price]
        return results[:limit]
