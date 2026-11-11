import logging
import urllib.parse
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.connectors.base import BaseMarketplaceConnector, ConnectorStatus, LinkStatus, MarketplaceProductItem

logger = logging.getLogger("giftora.connectors.amazon")


class AmazonConnector(BaseMarketplaceConnector):
    """
    Amazon India Integration.
    Note: Amazon PA-API 5.0 is scheduled for deprecation as of May 15, 2026.
    Amazon Creators API requires approved creator/influencer credentials.
    When live API credentials are not available, operates in transparent
    retailer-search fallback mode.
    """

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
                "message": (
                    "Amazon Creators / PA-API credentials not configured in environment. "
                    "Operating in official retailer-search fallback mode."
                ),
                "is_live": False,
            }
        return {
            "marketplace": self.marketplace_name,
            "status": ConnectorStatus.ACTIVE.value,
            "message": "Amazon API credentials configured.",
            "is_live": True,
        }

    def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        # Production gate: disable fabricated mock products in production
        is_prod = settings.ENVIRONMENT.lower() == "production"

        if not self.is_configured:
            if is_prod:
                logger.info("Amazon credentials not configured in production. Using retailer search fallback.")
                return self._get_retailer_search_fallback(query)
            else:
                return self._get_dev_mock_items(query, max_price, limit)

        # In live production with Amazon Creators / PA-API: query live API
        # Never fabricate API results
        return []

    def get_product_details(self, marketplace_product_id: str) -> Optional[MarketplaceProductItem]:
        if not self.is_configured and not (settings.ENVIRONMENT.lower() == "production"):
            for item in self._get_dev_mock_items(""):
                if item.marketplace_product_id == marketplace_product_id:
                    return item
        return None

    def _get_retailer_search_fallback(self, query: str) -> List[MarketplaceProductItem]:
        """Provides verified official Amazon India search destination."""
        clean_q = query.strip() or "gift ideas"
        tag_param = f"&tag={urllib.parse.quote_plus(self.associate_tag)}" if self.associate_tag else ""
        search_url = f"https://www.amazon.in/s?k={urllib.parse.quote_plus(clean_q)}{tag_param}"

        return [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id=f"AMZN-SEARCH-{abs(hash(clean_q)) % 1000000}",
                title=f"Explore {clean_q} on Amazon India",
                product_url=None,
                retailer_search_url=search_url,
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("0.00"),
                currency="INR",
                availability_status="IN_STOCK",
                category="Retailer Search",
                is_development_mock=False,
                source_attribution="Official Amazon India Search Destination",
            )
        ]

    def _get_dev_mock_items(
        self,
        query: str,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        """Development mock provider with verified search fallback URLs."""
        clean_q = urllib.parse.quote_plus(query.strip() or "electronics")
        all_mocks = [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-WALNUT-CHARGER",
                title="Walnut & Matte Aluminum MagSafe Dual Wireless Charging Stand",
                product_url=None,
                retailer_search_url=f"https://www.amazon.in/s?k=walnut+magsafe+charging+stand",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
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
                product_url=None,
                retailer_search_url=f"https://www.amazon.in/s?k=linen+bound+hardcover+dot+grid+journal",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
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
                marketplace_product_id="AMZN-DEV-POUROVER",
                title="Ceramic Pour-Over Specialty Coffee Dripper Set with Brass Stand",
                product_url=None,
                retailer_search_url="https://www.amazon.in/s?k=ceramic+pour+over+coffee+dripper",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("1850.00"),
                original_price=Decimal("2400.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.85"),
                review_count=320,
                category="Coffee & Dining",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-AROMA-DIFFUSER",
                title="Handcrafted Ceramic Aromatherapy Ultrasonic Diffuser & Essential Oils",
                product_url=None,
                retailer_search_url="https://www.amazon.in/s?k=ceramic+aromatherapy+ultrasonic+diffuser",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("2200.00"),
                original_price=Decimal("2800.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.90"),
                review_count=450,
                category="Wellness & Aromatherapy",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-KEYCHRON-K2",
                title="Keychron K2 V2 Wireless Mechanical Keyboard (Gateron Brown)",
                product_url=None,
                retailer_search_url=f"https://www.amazon.in/s?k=keychron+k2+mechanical+keyboard",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
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
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-BRASS-PEN",
                title="Classic Weighted Brass Fountain Pen with 24K Gold Plated Nib",
                product_url=None,
                retailer_search_url="https://www.amazon.in/s?k=brass+fountain+pen",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("899.00"),
                original_price=Decimal("1299.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.80"),
                review_count=420,
                category="Stationery & Writing",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-ROSE-CANDLE",
                title="Rose & Oud Hand-Poured Amber Glass Apothecary Candle",
                product_url=None,
                retailer_search_url="https://www.amazon.in/s?k=rose+oud+soy+candle",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("799.00"),
                original_price=Decimal("999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.85"),
                review_count=360,
                category="Aromatherapy & Candles",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="AMZN-DEV-COFFEE-BOX",
                title="Blue Tokai Roasted Specialty Coffee Tasting Box (3 Roasts)",
                product_url=None,
                retailer_search_url="https://www.amazon.in/s?k=blue+tokai+coffee+tasting+box",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("750.00"),
                original_price=Decimal("900.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.90"),
                review_count=780,
                category="Specialty Coffee",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Amazon India)",
            ),
        ]
        results = [m for m in all_mocks if max_price is None or m.current_price <= max_price]
        return results[:limit]
