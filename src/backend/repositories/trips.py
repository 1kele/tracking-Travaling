from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import Trip


async def find_owned_trip(
    session: AsyncSession, user_id: int, trip_id: int, *, lock: bool = False
) -> Trip | None:
    statement = select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id)
    if lock:
        statement = statement.with_for_update()
    return await session.scalar(statement)
