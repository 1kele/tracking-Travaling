from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from backend.database import SessionDep
from backend.models import City, Place
from backend.routers.params import ResourceId
from backend.schemas.catalog import CityRead, PlaceRead

router = APIRouter(prefix="/cities", tags=["catalog"])


@router.get("", response_model=list[CityRead])
async def list_cities(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[City]:
    statement = select(City).order_by(City.name, City.id).offset(offset).limit(limit)
    return list((await session.scalars(statement)).all())


@router.get("/{city_id}/places", response_model=list[PlaceRead])
async def list_places(
    city_id: ResourceId,
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Place]:
    if await session.get(City, city_id) is None:
        raise HTTPException(status_code=404, detail="City not found")
    statement = (
        select(Place)
        .where(Place.city_id == city_id)
        .order_by(Place.name, Place.id)
        .offset(offset)
        .limit(limit)
    )
    return list((await session.scalars(statement)).all())
