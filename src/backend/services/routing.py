import json
import math
import ssl

import certifi
from datetime import datetime, timezone
from typing import Literal, Self
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from backend.config import RoutingSettings
from backend.models import City, ItineraryItem, Place, Route, Trip


class PathGeometry(BaseModel):
    type: Literal["LineString"]
    coordinates: list[tuple[float, float]] = Field(min_length=2, max_length=100_000)

    @model_validator(mode="after")
    def validate_coordinates(self) -> Self:
        for lon, lat in self.coordinates:
            if not math.isfinite(lon) or not math.isfinite(lat):
                raise ValueError("Coordinates must be finite")
            if not -180 <= lon <= 180 or not -90 <= lat <= 90:
                raise ValueError("Coordinate out of range")
        return self


class WalkingPath(BaseModel):
    distance: float = Field(ge=0, le=1_000_000_000, allow_inf_nan=False)
    duration: float = Field(ge=0, le=1_000_000_000, allow_inf_nan=False)
    geometry: PathGeometry


class ValhallaClient:
    def __init__(self, settings: RoutingSettings | None = None):
        self.settings = settings or RoutingSettings()

    def calculate(self, points: list[tuple[float, float]]) -> WalkingPath:
        payload = {
            "locations": [{"lat": lat, "lon": lon, "type": "break"} for lat, lon in points],
            "costing": "pedestrian",
            "units": "kilometers",
            "format": "osrm",
            "shape_format": "geojson",
        }
        request = Request(
            self.settings.ROUTING_BASE_URL.rstrip("/") + "/route",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "TrackingTraveling/0.1"},
        )
        try:
            with urlopen(
                request,
                timeout=self.settings.ROUTING_TIMEOUT_SECONDS,
                context=ssl.create_default_context(cafile=certifi.where()),
            ) as response:
                raw = response.read(4_000_001)
        except HTTPError as error:
            if error.code in (400, 404):
                raise HTTPException(422, "No walking route available for these stops") from None
            raise HTTPException(503, "Routing provider is unavailable") from None
        except (URLError, TimeoutError, OSError):
            raise HTTPException(503, "Routing provider is unavailable") from None
        if len(raw) > 4_000_000:
            raise HTTPException(502, "Routing provider response is too large")
        try:
            result = json.loads(raw)
            if result.get("code") == "NoRoute":
                raise HTTPException(422, "No walking route available for these stops")
            if result.get("code") != "Ok":
                raise ValueError("Invalid routing result")
            return WalkingPath.model_validate(result["routes"][0])
        except (ValueError, KeyError, IndexError, TypeError, AttributeError):
            raise HTTPException(502, "Invalid response from routing provider") from None


class RouteService:
    def __init__(self, session: AsyncSession, client: ValhallaClient):
        self.session = session
        self.client = client

    async def build(self, trip: Trip) -> Route:
        # Coordinate edits and route builds serialize on the city row.
        await self.session.scalar(
            select(City).where(City.id == trip.city_id).with_for_update()
        )
        stops = list((await self.session.execute(
            select(ItineraryItem.id, Place.lat, Place.lon)
            .join(Place, Place.id == ItineraryItem.place_id)
            .where(ItineraryItem.trip_id == trip.id)
            .order_by(ItineraryItem.position)
        )).all())
        if not 2 <= len(stops) <= 50:
            raise HTTPException(422, "A walking route needs between 2 and 50 stops")
        path = await run_in_threadpool(
            self.client.calculate, [(stop.lat, stop.lon) for stop in stops]
        )
        route = await self.session.scalar(select(Route).where(Route.trip_id == trip.id))
        if route is None:
            route = Route(trip_id=trip.id)
            self.session.add(route)
        route.distance_km = round(path.distance / 1000, 3)
        route.duration_minutes = math.ceil(path.duration / 60)
        route.stop_ids = [stop.id for stop in stops]
        route.geometry = path.geometry.model_dump(mode="json")
        route.provider = "valhalla"
        route.calculated_at = datetime.now(timezone.utc)
        await self.session.commit()
        return route
