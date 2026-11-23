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


def test_reorder_planned_times_and_unvisit(api):
    client, (city_id, place_id, _), _ = api
    owner = login_as(client, "planner@example.com")
    other = login_as(client, "planner-other@example.com")
    trip = client.post("trips", headers=owner, json={
        "city_id": city_id, "title": "Stops",
        "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    path = f"trips/{trip['id']}"
    items = [client.post(f"{path}/items", headers=owner, json={
        "place_id": place_id, "position": position,
    }).json() for position in (1, 2, 3)]
    ids = [item["id"] for item in items]
    assert client.put(f"{path}/items/order", headers=other, json={"item_ids": ids}).status_code == 404
    assert client.put(f"{path}/items/order", headers=owner, json={"item_ids": [ids[0]]}).status_code == 409
    assert client.put(f"{path}/items/order", headers=owner, json={"item_ids": [ids[0], ids[0]]}).status_code == 422
    response = client.put(f"{path}/items/order", headers=owner, json={"item_ids": ids[::-1]})
    assert response.status_code == 200, response.text
    assert [item["id"] for item in response.json()] == ids[::-1]
    assert [item["position"] for item in response.json()] == [1, 2, 3]
    item_path = f"{path}/items/{ids[0]}"
    assert client.patch(item_path, headers=owner, json={"planned_time": "2026-12-07T12:00:00Z"}).status_code == 422
    assert client.patch(item_path, headers=owner, json={"planned_time": "2026-12-04T12:00:00Z"}).status_code == 200
    assert client.patch(path, headers=owner, json={"start_date": "2026-12-05"}).status_code == 409
    assert client.patch(item_path, headers=owner, json={"planned_time": None}).status_code == 200
    assert client.put(f"{item_path}/visit", headers=owner, json={"rating": 4}).status_code == 200
    for _ in range(2):
        assert client.delete(f"{item_path}/visit", headers=owner).status_code == 204
    assert client.get(f"{item_path}/visit", headers=owner).status_code == 404
    assert client.get(f"{path}/progress", headers=owner).json()["visited"] == 0


def test_notes_ownership_validation_and_cascade(api):
    client, (city_id, place_id, _), _ = api
    owner = login_as(client, "notes@example.com")
    other = login_as(client, "notes-other@example.com")
    trip = client.post("trips", headers=owner, json={
        "city_id": city_id, "title": "Notes", "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    item = client.post(f"trips/{trip['id']}/items", headers=owner, json={
        "place_id": place_id, "position": 1,
    }).json()
    path = f"trips/{trip['id']}/items/{item['id']}/notes"
    assert client.post(path, headers=owner, json={"text": " "}).status_code == 422
    response = client.post(path, headers=owner, json={"text": "  Great place  "})
    assert response.status_code == 201, response.text
    note = response.json()
    assert note["text"] == "Great place"
    assert client.get(path, headers=other).status_code == 404
    assert client.patch(f"{path}/{note['id']}", headers=other, json={"text": "stolen"}).status_code == 404
    assert client.patch(f"{path}/{note['id']}", headers=owner, json={"text": "Updated"}).json()["text"] == "Updated"
    assert client.get(path, headers=owner).json()[0]["text"] == "Updated"
    assert client.delete(f"{path}/{note['id']}", headers=owner).status_code == 204
    assert client.get(path, headers=owner).json() == []
    client.post(path, headers=owner, json={"text": "Cascade"})
    assert client.delete(f"trips/{trip['id']}", headers=owner).status_code == 204
    assert client.get(path, headers=owner).status_code == 404


def test_admin_catalog_permissions_validation_and_references(api):
    client, (city_id, place_id, _), sessions = api
    from sqlalchemy import update
    admin = login_as(client, "admin@example.com")
    ordinary = login_as(client, "ordinary@example.com")
    body = {"name": "New City", "country": "Russia", "lat": 55.0, "lon": 49.0}
    assert client.post("admin/cities", headers=ordinary, json=body).status_code == 403

    async def promote():
        async with sessions.begin() as session:
            await session.execute(update(User).where(User.email == "admin@example.com").values(is_admin=True))

    asyncio.run(promote())
    invalid = client.post("admin/cities", headers=admin, json=body | {"lat": 91})
    assert invalid.status_code == 422
    city = client.post("admin/cities", headers=admin, json=body)
    assert city.status_code == 201, city.text
    assert client.post("admin/cities", headers=admin, json=body).status_code == 409
    new_id = city.json()["id"]
    path = f"admin/cities/{new_id}"
    assert client.patch(path, headers=admin, json={"name": "Renamed"}).status_code == 200
    place_data = {"name": "Park", "category": "park", "address": "Street", "lat": 55.0, "lon": 49.0}
    place = client.post(f"{path}/places", headers=admin, json=place_data)
    assert place.status_code == 201, place.text
    assert client.delete(path, headers=admin).status_code == 409
    place_path = f"{path}/places/{place.json()['id']}"
    assert client.patch(place_path, headers=admin, json={"address": "New address"}).status_code == 200
    assert client.delete(place_path, headers=admin).status_code == 204
    assert client.delete(path, headers=admin).status_code == 204

    trip = client.post("trips", headers=ordinary, json={
        "city_id": city_id, "title": "Referenced", "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    client.post(f"trips/{trip['id']}/items", headers=ordinary, json={"place_id": place_id, "position": 1})
    assert client.delete(f"admin/cities/{city_id}", headers=admin).status_code == 409
    assert client.delete(f"admin/cities/{city_id}/places/{place_id}", headers=admin).status_code == 409


def test_route_build_read_and_invalidation(api, monkeypatch):
    from fastapi import HTTPException
    from backend.routers.routes import routing_client
    from backend.services.routing import WalkingPath

    class FakeRoutingClient:
        def calculate(self, points):
            return WalkingPath(
                distance=1250, duration=901,
                geometry={"type": "LineString", "coordinates": [[lon, lat] for lat, lon in points]},
            )

    client, (city_id, place_id, _), sessions = api
    monkeypatch.setitem(app.dependency_overrides, routing_client, FakeRoutingClient)
    owner = login_as(client, "routes@example.com")
    other = login_as(client, "routes-other@example.com")
    trip = client.post("trips", headers=owner, json={
        "city_id": city_id, "title": "Walking", "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    path = f"trips/{trip['id']}"
    assert client.get(f"{path}/route", headers=owner).status_code == 404
    assert client.post(f"{path}/route", headers=owner).status_code == 422
    items = [client.post(f"{path}/items", headers=owner, json={
        "place_id": place_id, "position": pos,
    }).json() for pos in (1, 2)]
    assert client.post(f"{path}/route", headers=other).status_code == 404
    built = client.post(f"{path}/route", headers=owner)
    assert built.status_code == 200, built.text
    route = built.json()
    assert route["distance_km"] == 1.25
    assert route["duration_minutes"] == 16
    assert route["stop_ids"] == [item["id"] for item in items]
    assert route["geometry"]["type"] == "LineString"
    assert client.get(f"{path}/route", headers=owner).json() == route
    assert client.post(f"{path}/route", headers=owner).json()["id"] == route["id"]

    class FailedRoutingClient:
        def calculate(self, points):
            raise HTTPException(503, "Provider unavailable")

    monkeypatch.setitem(app.dependency_overrides, routing_client, FailedRoutingClient)
    assert client.post(f"{path}/route", headers=owner).status_code == 503
    assert client.get(f"{path}/route", headers=owner).json()["id"] == route["id"]
    monkeypatch.setitem(app.dependency_overrides, routing_client, FakeRoutingClient)
    assert client.put(f"{path}/items/order", headers=owner, json={
        "item_ids": [item["id"] for item in items][::-1],
    }).status_code == 200
    assert client.get(f"{path}/route", headers=owner).status_code == 404
    assert client.post(f"{path}/route", headers=owner).status_code == 200

    from sqlalchemy import update

    async def promote():
        async with sessions.begin() as session:
            await session.execute(update(User).where(User.email == "routes-other@example.com").values(is_admin=True))

    asyncio.run(promote())
    assert client.patch(f"admin/cities/{city_id}/places/{place_id}", headers=other, json={"lat": 55.81}).status_code == 200
    assert client.get(f"{path}/route", headers=owner).status_code == 404
    assert client.post(f"{path}/route", headers=owner).status_code == 200
    assert client.delete(f"{path}/items/{items[0]['id']}", headers=owner).status_code == 204
    assert client.get(f"{path}/route", headers=owner).status_code == 404


def test_concurrent_reorders_keep_unique_positions(api):
    from concurrent.futures import ThreadPoolExecutor

    client, (city_id, place_id, _), _ = api
    headers = login_as(client, "parallel-planner@example.com")
    trip = client.post("trips", headers=headers, json={
        "city_id": city_id, "title": "Concurrent order",
        "start_date": "2026-12-04", "end_date": "2026-12-06",
    }).json()
    path = f"trips/{trip['id']}/items"
    ids = [client.post(path, headers=headers, json={
        "place_id": place_id, "position": pos,
    }).json()["id"] for pos in (1, 2, 3)]

    def reorder(order):
        return client.put(f"{path}/order", headers=headers, json={"item_ids": order})

    with ThreadPoolExecutor(max_workers=2) as executor:
        responses = list(executor.map(reorder, [ids[::-1], [ids[1], ids[2], ids[0]]]))
    assert [response.status_code for response in responses] == [200, 200]
    saved = client.get(path, headers=headers).json()
    assert {item["id"] for item in saved} == set(ids)
    assert [item["position"] for item in saved] == [1, 2, 3]
