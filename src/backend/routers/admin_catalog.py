from fastapi import APIRouter, Depends, Response

from backend.database import SessionDep
from backend.models import City, Place
from backend.routers.params import ResourceId
from backend.schemas.catalog import (
    CityCreate, CityRead, CityUpdate, PlaceCreate, PlaceRead, PlaceUpdate,
)
from backend.security import require_admin
from backend.services.catalog import CatalogService

router = APIRouter(
    prefix="/admin/cities", tags=["admin catalog"], dependencies=[Depends(require_admin)]
)


@router.post("", response_model=CityRead, status_code=201)
async def create_city(data: CityCreate, session: SessionDep) -> City:
    city = City(**data.model_dump())
    session.add(city)
    await CatalogService(session).commit()
    return city


@router.patch("/{city_id}", response_model=CityRead)
async def edit_city(city_id: ResourceId, data: CityUpdate, session: SessionDep) -> City:
    service = CatalogService(session)
    city = await service.city(city_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(city, key, value)
    await service.commit()
    return city


@router.delete("/{city_id}", status_code=204)
async def delete_city(city_id: ResourceId, session: SessionDep) -> Response:
    service = CatalogService(session)
    await session.delete(await service.city(city_id))
    await service.commit()
    return Response(status_code=204)


@router.post("/{city_id}/places", response_model=PlaceRead, status_code=201)
async def create_place(
    city_id: ResourceId, data: PlaceCreate, session: SessionDep
) -> Place:
    service = CatalogService(session)
    await service.city(city_id)
    place = Place(city_id=city_id, **data.model_dump())
    session.add(place)
    await service.commit()
    return place


@router.patch("/{city_id}/places/{place_id}", response_model=PlaceRead)
async def edit_place(
    city_id: ResourceId, place_id: ResourceId, data: PlaceUpdate, session: SessionDep
) -> Place:
    service = CatalogService(session)
    place = await service.place(city_id, place_id)
    changes = data.model_dump(exclude_unset=True)
    if any(getattr(place, key) != changes.get(key, getattr(place, key)) for key in ("lat", "lon")):
        await service.invalidate_place_routes(place_id)
    for key, value in changes.items():
        setattr(place, key, value)
    await service.commit()
    return place


@router.delete("/{city_id}/places/{place_id}", status_code=204)
async def delete_place(
    city_id: ResourceId, place_id: ResourceId, session: SessionDep
) -> Response:
    service = CatalogService(session)
    await session.delete(await service.place(city_id, place_id))
    await service.commit()
    return Response(status_code=204)
