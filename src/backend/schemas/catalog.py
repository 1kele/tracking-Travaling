from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    country: str
    lat: float
    lon: float


class PlaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city_id: int
    name: str
    category: str
    address: str
    lat: float
    lon: float


class CityCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=120)
    country: str = Field(min_length=1, max_length=120)
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lon: float = Field(ge=-180, le=180, allow_inf_nan=False)


class CatalogUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    @model_validator(mode="after")
    def validate_changes(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("Provide at least one field")
        if any(getattr(self, name) is None for name in self.model_fields_set):
            raise ValueError("Changed fields cannot be null")
        return self


class CityUpdate(CatalogUpdate):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    country: str | None = Field(default=None, min_length=1, max_length=120)
    lat: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    lon: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)


class PlaceCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=160)
    category: str = Field(min_length=1, max_length=80)
    address: str = Field(min_length=1, max_length=255)
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lon: float = Field(ge=-180, le=180, allow_inf_nan=False)


class PlaceUpdate(CatalogUpdate):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    lat: float | None = Field(default=None, ge=-90, le=90, allow_inf_nan=False)
    lon: float | None = Field(default=None, ge=-180, le=180, allow_inf_nan=False)
