from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import ItineraryItem, ItemStatus, Route, Trip, Visit


class ItineraryService:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def validate_time(trip: Trip, planned_time: datetime | None) -> None:
        if planned_time is not None:
            day = planned_time.astimezone(timezone.utc).date()
            if not trip.start_date <= day <= trip.end_date:
                raise HTTPException(422, "Planned time must fall within trip dates in UTC")

    async def invalidate_route(self, trip_id: int) -> None:
        await self.session.execute(delete(Route).where(Route.trip_id == trip_id))

    async def reorder(self, trip: Trip, item_ids: list[int]) -> list[ItineraryItem]:
        items = list(await self.session.scalars(
            select(ItineraryItem).where(ItineraryItem.trip_id == trip.id)
        ))
        by_id = {item.id: item for item in items}
        if set(item_ids) != set(by_id):
            raise HTTPException(409, "Provide exactly all current itinerary item IDs")
        # Free positive positions let immediate UNIQUE checks pass during a swap.
        occupied = {item.position for item in items}
        temporary = len(items) + 1
        for item in items:
            while temporary in occupied:
                temporary += 1
            item.position = temporary
            occupied.add(temporary)
            temporary += 1
        await self.session.flush()
        for position, item_id in enumerate(item_ids, 1):
            by_id[item_id].position = position
        await self.session.flush()
        await self.invalidate_route(trip.id)
        await self.session.commit()
        return [by_id[item_id] for item_id in item_ids]

    async def unvisit(self, item: ItineraryItem) -> None:
        await self.session.execute(delete(Visit).where(Visit.itinerary_item_id == item.id))
        item.status = ItemStatus.PLANNED
        await self.session.commit()
