from fastapi.testclient import TestClient

from backend.app import app


def test_app_exposes_swagger():
    with TestClient(app) as client:
        response = client.get("/docs")

    assert response.status_code == 200
