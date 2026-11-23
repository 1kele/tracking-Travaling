from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response

from backend.database import SessionDep
from backend.models import Note
from backend.repositories.notes import NoteRepository
from backend.routers.itinerary import trip_item
from backend.routers.params import ResourceId
from backend.routers.trips import LockedTrip, OwnedTrip
from backend.schemas.itinerary import NoteRead, NoteWrite

router = APIRouter(prefix="/trips/{trip_id}/items/{item_id}/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
async def list_notes(
    item_id: ResourceId, trip: OwnedTrip, session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Note]:
    await trip_item(item_id, trip, session)
    return await NoteRepository(session).list(item_id, offset, limit)


@router.post("", response_model=NoteRead, status_code=201)
async def add_note(
    item_id: ResourceId, data: NoteWrite, trip: LockedTrip, session: SessionDep
) -> Note:
    await trip_item(item_id, trip, session)
    note = Note(itinerary_item_id=item_id, text=data.text)
    session.add(note)
    await session.commit()
    return note


@router.patch("/{note_id}", response_model=NoteRead)
async def edit_note(
    item_id: ResourceId, note_id: ResourceId, data: NoteWrite,
    trip: LockedTrip, session: SessionDep,
) -> Note:
    await trip_item(item_id, trip, session)
    note = await NoteRepository(session).get(item_id, note_id)
    if note is None:
        raise HTTPException(404, "Note not found")
    note.text = data.text
    await session.commit()
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    item_id: ResourceId, note_id: ResourceId, trip: LockedTrip, session: SessionDep
) -> Response:
    await trip_item(item_id, trip, session)
    note = await NoteRepository(session).get(item_id, note_id)
    if note is None:
        raise HTTPException(404, "Note not found")
    await session.delete(note)
    await session.commit()
    return Response(status_code=204)
