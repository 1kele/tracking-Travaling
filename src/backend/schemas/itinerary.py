from typing import Self

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator

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


class ItineraryItemUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    planned_time: AwareDatetime | None


class ItineraryOrder(BaseModel):
    item_ids: list[int] = Field(min_length=1, max_length=500)

    @model_validator(mode="after")
    def validate_ids(self) -> Self:
        if any(not 1 <= item <= 2_147_483_647 for item in self.item_ids):
            raise ValueError("Invalid item ID")
        if len(set(self.item_ids)) != len(self.item_ids):
            raise ValueError("Each item must occur exactly once")
        return self


class NoteWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    text: str = Field(min_length=1, max_length=5000)
