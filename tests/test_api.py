import asyncio
import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.schema import CreateSchema, DropSchema
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from backend.app import app
from backend.database import get_session
from backend.models import Base, City, Place, User
from backend.security import get_signing_key


@pytest.fixture
def api(monkeypatch):
    database_url = os.environ.get("TEST_DATABASE_URL")
    if not database_url:
        pytest.skip("Set TEST_DATABASE_URL to a PostgreSQL test database")
    schema = f"travel_test_{uuid4().hex}"
    engine = create_async_engine(
        database_url,
        poolclass=NullPool,
        connect_args={"server_settings": {"search_path": schema}},
    )
    sessions = async_sessionmaker(engine, expire_on_commit=False)

    async def prepare():
        async with engine.begin() as connection:
            await connection.execute(CreateSchema(schema))
            await connection.run_sync(Base.metadata.create_all)
        async with sessions.begin() as session:
            city = City(name="Kazan", country="Russia", lat=55.79, lon=49.12)
            other_city = City(name="Tula", country="Russia", lat=54.19, lon=37.61)
            session.add_all([city, other_city])
            await session.flush()
            place = Place(
                city_id=city.id, name="Kremlin", category="history",
                address="1 Kremlin", lat=55.80, lon=49.11,
            )
            other_place = Place(
                city_id=other_city.id, name="Tula Kremlin", category="history",
                address="2 Kremlin", lat=54.20, lon=37.62,
            )
            session.add_all([place, other_place])
            await session.flush()
            return city.id, place.id, other_place.id

    async def cleanup():
        try:
            async with engine.begin() as connection:
                await connection.execute(DropSchema(schema, if_exists=True, cascade=True))
        finally:
            await engine.dispose()

    async def test_session():
        async with sessions() as session:
            yield session

    monkeypatch.setenv("JWT_SECRET", "test-key-for-this-isolated-postgresql-suite")
    get_signing_key.cache_clear()
    monkeypatch.setitem(app.dependency_overrides, get_session, test_session)
    try:
        ids = asyncio.run(prepare())
        with TestClient(app, base_url="http://testserver/api/v1/") as client:
            yield client, ids, sessions
    finally:
        get_signing_key.cache_clear()
        asyncio.run(cleanup())


def login_as(client, email):
    password = "a_long-test-password"
    created = client.post("auth/register", json={
        "email": email, "name": "Traveler", "password": password,
    })
    assert created.status_code == 201, created.text
    assert set(created.json()) == {"id", "email", "name"}
    login = client.post("auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_register_login_and_validate_password(api):
    client, _, sessions = api
    headers = login_as(client, "traveler@example.com")

    assert client.get("auth/me", headers=headers).json()["email"] == "traveler@example.com"
    assert client.get("auth/me").status_code == 401
    for email in ("traveler@example.com", "unknown@example.com"):
        response = client.post("auth/login", json={"email": email, "password": "incorrect"})
        assert response.status_code == 401

    duplicate = client.post("auth/register", json={
        "email": "TRAVELER@example.com", "name": "Traveler", "password": "a_long-test-password",
    })
    assert duplicate.status_code == 409
    invalid = client.post("auth/register", json={
        "email": "new@example.com", "name": "Traveler", "password": "too-short",
    })
    assert invalid.status_code == 422
    assert "too-short" not in invalid.text

    async def stored_hash():
        async with sessions() as session:
            return await session.scalar(select(User.password_hash))

    assert asyncio.run(stored_hash()).startswith("$argon2id$")


def test_trip_itinerary_visit_and_ownership(api):
    client, (city_id, place_id, other_place_id), _ = api
    owner = login_as(client, "owner@example.com")
    stranger = login_as(client, "stranger@example.com")

    assert client.get("cities").status_code == 200
    assert client.get(f"cities/{city_id}/places").json()[0]["id"] == place_id
    trip_data = {
        "city_id": city_id, "title": "Weekend", "start_date": "2026-12-04", "end_date": "2026-12-06",
    }
    invalid = client.post("trips", headers=owner, json=trip_data | {"end_date": "2026-12-03"})
    assert invalid.status_code == 422
    trip = client.post("trips", headers=owner, json=trip_data)
    assert trip.status_code == 201, trip.text
    url = f"trips/{trip.json()['id']}"

    assert client.get("trips", headers=stranger).json() == []
    assert client.get(url, headers=stranger).status_code == 404
    assert client.get(f"{url}/progress", headers=owner).json() == {
        "total": 0, "visited": 0, "percent": 0.0,
    }

    other_place = client.post(f"{url}/items", headers=owner, json={
        "place_id": other_place_id, "position": 1,
    })
    assert other_place.status_code == 404
    item_data = {"place_id": place_id, "position": 1}
    item = client.post(f"{url}/items", headers=owner, json=item_data)
    assert item.status_code == 201, item.text
    assert client.post(f"{url}/items", headers=owner, json=item_data).status_code == 409
    item_url = f"{url}/items/{item.json()['id']}"
    visit_url = f"{item_url}/visit"
    assert client.put(visit_url, headers=stranger, json={}).status_code == 404
    visit = client.put(visit_url, headers=owner, json={"rating": 5})
    assert visit.status_code == 200, visit.text
    replay = client.put(visit_url, headers=owner, json={})
    assert replay.json() == visit.json()
    assert client.get(visit_url, headers=owner).json() == visit.json()
    assert client.get(f"{url}/items", headers=owner).json()[0]["status"] == "visited"
    assert client.get(f"{url}/progress", headers=owner).json() == {
        "total": 1, "visited": 1, "percent": 100.0,
    }

    assert client.delete(item_url, headers=owner).status_code == 204
    assert client.delete(url, headers=owner).status_code == 204
    assert client.get(url, headers=owner).status_code == 404


def test_trip_updates_and_status_transitions(api):
    client, (city_id, _, _), _ = api
    owner = login_as(client, "trip-editor@example.com")
    other = login_as(client, "other-editor@example.com")
    trip = client.post("trips", headers=owner, json={
        "city_id": city_id, "title": "Original",
        "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    path = f"trips/{trip['id']}"
    assert client.patch(path, headers=other, json={"title": "Stolen"}).status_code == 404
    assert client.patch(path, headers=owner, json={"title": None}).status_code == 422
    assert client.patch(path, headers=owner, json={}).status_code == 422
    assert client.patch(path, headers=owner, json={"end_date": "2026-12-01"}).status_code == 422
    assert client.patch(path, headers=owner, json={"status": "completed"}).status_code == 409
    for status in ("in_progress", "completed", "planned"):
        response = client.patch(path, headers=owner, json={"status": status})
        assert response.status_code == 200, response.text
        assert response.json()["status"] == status
    result = client.patch(path, headers=owner, json={"title": "Updated"})
    assert result.json()["title"] == "Updated"
    assert client.get(path, headers=owner).json()["title"] == "Updated"
