from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import ItineraryItem, Trip, TripStatus
from backend.schemas.trip import TripUpdate


class TripService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def update(self, trip: Trip, data: TripUpdate) -> Trip:
        changes = data.model_dump(exclude_unset=True)
        start = changes.get("start_date", trip.start_date)
        end = changes.get("end_date", trip.end_date)
        if end < start:
            raise HTTPException(422, "end_date must be on or after start_date")
        transitions = {
            TripStatus.PLANNED: {TripStatus.IN_PROGRESS},
            TripStatus.IN_PROGRESS: {TripStatus.COMPLETED, TripStatus.PLANNED},
            TripStatus.COMPLETED: {TripStatus.PLANNED},
        }
        status = changes.get("status", trip.status)
        if status != trip.status and status not in transitions[trip.status]:
            raise HTTPException(409, "Invalid trip status transition")
        times = await self.session.scalars(
            select(ItineraryItem.planned_time).where(
                ItineraryItem.trip_id == trip.id,
                ItineraryItem.planned_time.is_not(None),
            )
        )
        if any(not start <= time.date() <= end for time in times):
            raise HTTPException(409, "Existing planned stops fall outside the new dates")
        for field, value in changes.items():
            setattr(trip, field, value)
        await self.session.commit()
        return trip
