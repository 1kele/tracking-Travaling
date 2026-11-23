from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from backend.database import SessionDep
from backend.models import Route
from backend.routers.trips import LockedTrip, OwnedTrip
from backend.schemas.trip import RouteRead
from backend.services.routing import RouteService, ValhallaClient

router = APIRouter(prefix="/trips/{trip_id}/route", tags=["walking route"])


def routing_client() -> ValhallaClient:
    return ValhallaClient()


@router.post("", response_model=RouteRead)
async def build_route(
    trip: LockedTrip, session: SessionDep,
    client: Annotated[ValhallaClient, Depends(routing_client)],
) -> Route:
    return await RouteService(session, client).build(trip)


@router.get("", response_model=RouteRead)
async def get_route(trip: OwnedTrip, session: SessionDep) -> Route:
    route = await session.scalar(select(Route).where(Route.trip_id == trip.id))
    if route is None:
        raise HTTPException(404, "Route has not been calculated or its stops changed")
    return route
