from datetime import date
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.models import TripStatus


class TripCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    city_id: int = Field(gt=0, le=2_147_483_647)
    title: str = Field(min_length=1, max_length=160)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_date_range(self) -> Self:
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class TripRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city_id: int
    title: str
    start_date: date
    end_date: date
    status: TripStatus


class RouteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    distance_km: float
    duration_minutes: int
