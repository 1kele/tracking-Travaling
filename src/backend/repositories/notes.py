from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models import Note


class NoteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self, item_id: int, offset: int, limit: int) -> list[Note]:
        query = (
            select(Note).where(Note.itinerary_item_id == item_id)
            .order_by(Note.created_at, Note.id).offset(offset).limit(limit)
        )
        return list(await self.session.scalars(query))

    async def get(self, item_id: int, note_id: int) -> Note | None:
        return await self.session.scalar(
            select(Note).where(Note.id == note_id, Note.itinerary_item_id == item_id)
        )
