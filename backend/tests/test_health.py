from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "Giftora" in data["service"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["version"] == "1.0.0"


def test_database_health_endpoint():
    response = client.get("/health/database")
    assert response.status_code in (200, 503)
    data = response.json()
    assert data["database"] == "MySQL 8.0"
    assert "connected" in data
    assert data["status"] == ("CONNECTED" if data["connected"] else "DISCONNECTED")


def test_ai_health_endpoint():
    response = client.get("/health/ai")
    assert response.status_code == 200
    data = response.json()
    assert data["engine"] == "Google Gemini"
    assert "status" in data


def test_connectors_health_endpoint():
    response = client.get("/health/connectors")
    assert response.status_code == 200
    data = response.json()
    assert "connectors" in data
    assert len(data["connectors"]) == 3
