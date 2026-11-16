from typing import Annotated

from fastapi import Depends
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app import create_app
from backend.config import Settings
from backend.database import get_session


def test_health_runs_without_database():
    with TestClient(create_app(Settings(_env_file=None, database_url=None))) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_database_session_executes_query():
    app = create_app(
        Settings(_env_file=None, database_url="sqlite+aiosqlite:///:memory:")
    )

    @app.get("/test-db")
    async def check_database(session: Annotated[AsyncSession, Depends(get_session)]):
        return await session.scalar(text("SELECT 1"))

    with TestClient(app) as client:
        response = client.get("/test-db")

    assert response.status_code == 200
    assert response.json() == 1
