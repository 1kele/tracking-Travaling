from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import City, ItineraryItem, Place, Route


class CatalogService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def city(self, city_id: int) -> City:
        city = await self.session.scalar(
            select(City).where(City.id == city_id).with_for_update()
        )
        if city is None:
            raise HTTPException(404, "City not found")
        return city

    async def place(self, city_id: int, place_id: int) -> Place:
        await self.city(city_id)
        place = await self.session.get(Place, place_id)
        if place is None or place.city_id != city_id:
            raise HTTPException(404, "Place not found")
        return place

    async def invalidate_place_routes(self, place_id: int) -> None:
        await self.session.execute(delete(Route).where(
            Route.trip_id.in_(
                select(ItineraryItem.trip_id).where(ItineraryItem.place_id == place_id)
            )
        ))

    async def commit(self) -> None:
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise HTTPException(
                409, "Catalog conflict: duplicate city or record is still referenced"
            ) from None
