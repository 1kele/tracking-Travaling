from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base


class City(Base):
    __tablename__ = "cities"
    __table_args__ = (
        UniqueConstraint("name", "country", name="uq_cities_name_country"),
        CheckConstraint("lat BETWEEN -90 AND 90", name="ck_cities_lat"),
        CheckConstraint("lon BETWEEN -180 AND 180", name="ck_cities_lon"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(120))
    lat: Mapped[float]
    lon: Mapped[float]


class Place(Base):
    __tablename__ = "places"
    __table_args__ = (
        CheckConstraint("lat BETWEEN -90 AND 90", name="ck_places_lat"),
        CheckConstraint("lon BETWEEN -180 AND 180", name="ck_places_lon"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(80))
    address: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float]
    lon: Mapped[float]
