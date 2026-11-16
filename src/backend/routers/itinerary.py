from fastapi import APIRouter, HTTPException, Response
from sqlalchemy import func, select

from backend.database import SessionDep
from backend.models import ItemStatus, ItineraryItem, Place, Trip, Visit
from backend.routers.params import ResourceId
from backend.routers.trips import LockedTrip, OwnedTrip
from backend.schemas.itinerary import (
    ItineraryItemCreate,
    ItineraryItemRead,
    TripProgress,
    VisitCreate,
    VisitRead,
)

router = APIRouter(prefix="/trips/{trip_id}", tags=["itinerary"])


async def trip_item(item_id: int, trip: Trip, session: SessionDep) -> ItineraryItem:
    item = await session.get(ItineraryItem, item_id)
    if item is None or item.trip_id != trip.id:
        raise HTTPException(status_code=404, detail="Itinerary item not found")
    return item


@router.get("/items", response_model=list[ItineraryItemRead])
async def list_items(trip: OwnedTrip, session: SessionDep) -> list[ItineraryItem]:
    statement = (
        select(ItineraryItem)
        .where(ItineraryItem.trip_id == trip.id)
        .order_by(ItineraryItem.position)
    )
    return list((await session.scalars(statement)).all())


@router.post("/items", response_model=ItineraryItemRead, status_code=201)
async def add_item(
    data: ItineraryItemCreate, trip: LockedTrip, session: SessionDep
) -> ItineraryItem:
    place = await session.get(Place, data.place_id)
    if place is None or place.city_id != trip.city_id:
        raise HTTPException(status_code=404, detail="Place not found in trip city")
    occupied = await session.scalar(
        select(ItineraryItem.id).where(
            ItineraryItem.trip_id == trip.id, ItineraryItem.position == data.position
        )
    )
    if occupied is not None:
        raise HTTPException(status_code=409, detail="Position already occupied")
    item = ItineraryItem(trip_id=trip.id, **data.model_dump())
    session.add(item)
    await session.commit()
    return item


@router.delete("/items/{item_id}", status_code=204)
async def remove_item(item_id: ResourceId, trip: LockedTrip, session: SessionDep) -> Response:
    await session.delete(await trip_item(item_id, trip, session))
    await session.commit()
    return Response(status_code=204)


@router.get("/items/{item_id}/visit", response_model=VisitRead)
async def get_visit(item_id: ResourceId, trip: OwnedTrip, session: SessionDep) -> Visit:
    item = await trip_item(item_id, trip, session)
    visit = await session.scalar(select(Visit).where(Visit.itinerary_item_id == item.id))
    if visit is None:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit


@router.put("/items/{item_id}/visit", response_model=VisitRead)
async def mark_visit(
    item_id: ResourceId, data: VisitCreate, trip: LockedTrip, session: SessionDep
) -> Visit:
    item = await trip_item(item_id, trip, session)
    visit = await session.scalar(select(Visit).where(Visit.itinerary_item_id == item.id))
    if visit is None:
        visit = Visit(itinerary_item_id=item.id)
        session.add(visit)
    if data.visited_at is not None:
        visit.visited_at = data.visited_at
    if "rating" in data.model_fields_set:
        visit.rating = data.rating
    item.status = ItemStatus.VISITED
    await session.commit()
    return visit


@router.get("/progress")
async def get_progress(trip: OwnedTrip, session: SessionDep) -> TripProgress:
    statement = select(
        func.count(),
        func.count().filter(ItineraryItem.status == ItemStatus.VISITED),
    ).where(ItineraryItem.trip_id == trip.id)
    total, visited = (await session.execute(statement)).one()
    percent = round(visited * 100 / total, 2) if total else 0.0
    return TripProgress(total=total, visited=visited, percent=percent)
