from decimal import Decimal
from app.connectors.amazon import AmazonConnector
from app.connectors.flipkart import FlipkartConnector
from app.connectors.myntra import MyntraConnector
from app.connectors.base import ConnectorStatus


def test_amazon_connector_status_and_search():
    connector = AmazonConnector()
    health = connector.health_check()
    assert health["marketplace"] == "Amazon India"
    assert health["status"] in (ConnectorStatus.NOT_CONFIGURED.value, ConnectorStatus.ACTIVE.value)

    products = connector.search_products(query="smart watch", max_price=Decimal("10000"), limit=5)
    assert len(products) > 0
    first = products[0]
    assert first.marketplace_name == "Amazon India"
    assert first.current_price <= Decimal("10000")
    assert first.is_development_mock is True


def test_flipkart_connector_status_and_search():
    connector = FlipkartConnector()
    health = connector.health_check()
    assert health["marketplace"] == "Flipkart"
    assert health["status"] in (ConnectorStatus.NOT_CONFIGURED.value, ConnectorStatus.ACTIVE.value)

    products = connector.search_products(query="earbuds", max_price=Decimal("5000"), limit=5)
    assert len(products) > 0
    first = products[0]
    assert first.marketplace_name == "Flipkart"
    assert first.current_price <= Decimal("5000")


def test_myntra_connector_status_and_search():
    connector = MyntraConnector()
    health = connector.health_check()
    assert health["marketplace"] == "Myntra"
    assert health["status"] in (ConnectorStatus.NOT_CONFIGURED.value, ConnectorStatus.ACTIVE.value)

    products = connector.search_products(query="silk scarf", max_price=Decimal("4000"), limit=5)
    assert len(products) > 0
    first = products[0]
    assert first.marketplace_name == "Myntra"
    assert first.current_price <= Decimal("4000")
