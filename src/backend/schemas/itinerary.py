from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from backend.models import ItemStatus


class ItineraryItemCreate(BaseModel):
    place_id: int = Field(gt=0, le=2_147_483_647)
    position: int = Field(ge=1, le=2_147_483_647)
    planned_time: AwareDatetime | None = None


class ItineraryItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    place_id: int
    position: int
    planned_time: AwareDatetime | None
    status: ItemStatus


class VisitCreate(BaseModel):
    visited_at: AwareDatetime | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class VisitRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    itinerary_item_id: int
    visited_at: AwareDatetime
    rating: int | None


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    itinerary_item_id: int
    text: str
    created_at: AwareDatetime


class TripProgress(BaseModel):
    total: int
    visited: int
    percent: float
