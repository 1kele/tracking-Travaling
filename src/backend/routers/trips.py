from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import select

from backend.database import SessionDep
from backend.models import City, Trip
from backend.repositories.trips import find_owned_trip
from backend.routers.params import ResourceId
from backend.schemas.trip import TripCreate, TripRead, TripUpdate
from backend.services.trips import TripService
from backend.security import CurrentUser

router = APIRouter(prefix="/trips", tags=["trips"])


async def owned_trip(trip_id: ResourceId, user: CurrentUser, session: SessionDep) -> Trip:
    trip = await find_owned_trip(session, user.id, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


async def locked_trip(trip_id: ResourceId, user: CurrentUser, session: SessionDep) -> Trip:
    trip = await find_owned_trip(session, user.id, trip_id, lock=True)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


OwnedTrip = Annotated[Trip, Depends(owned_trip)]
LockedTrip = Annotated[Trip, Depends(locked_trip)]


@router.post("", response_model=TripRead, status_code=201)
async def create_trip(data: TripCreate, user: CurrentUser, session: SessionDep) -> Trip:
    if await session.get(City, data.city_id) is None:
        raise HTTPException(status_code=404, detail="City not found")
    trip = Trip(user_id=user.id, **data.model_dump())
    session.add(trip)
    await session.commit()
    return trip


@router.get("", response_model=list[TripRead])
async def list_trips(
    user: CurrentUser,
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Trip]:
    statement = (
        select(Trip)
        .where(Trip.user_id == user.id)
        .order_by(Trip.start_date, Trip.id)
        .offset(offset)
        .limit(limit)
    )
    return list((await session.scalars(statement)).all())


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip(trip: OwnedTrip) -> Trip:
    return trip


@router.delete("/{trip_id}", status_code=204)
async def delete_trip(trip: LockedTrip, session: SessionDep) -> Response:
    await session.delete(trip)
    await session.commit()
    return Response(status_code=204)


@router.patch("/{trip_id}", response_model=TripRead)
async def update_trip(data: TripUpdate, trip: LockedTrip, session: SessionDep) -> Trip:
    return await TripService(session).update(trip, data)
