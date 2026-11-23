from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base


class TripStatus(StrEnum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = (
        CheckConstraint("end_date >= start_date", name="ck_trips_date_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    city_id: Mapped[int] = mapped_column(ForeignKey("cities.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    start_date: Mapped[date]
    end_date: Mapped[date]
    status: Mapped[TripStatus] = mapped_column(
        Enum(
            TripStatus,
            name="trip_status",
            values_callable=lambda members: [member.value for member in members],
            native_enum=False,
            create_constraint=True,
        ),
        server_default=TripStatus.PLANNED.value,
    )


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        CheckConstraint("distance_km >= 0", name="ck_routes_distance"),
        CheckConstraint("duration_minutes >= 0", name="ck_routes_duration"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), unique=True
    )
    distance_km: Mapped[float]
    duration_minutes: Mapped[int]

    stop_ids: Mapped[list[int] | None] = mapped_column(JSON)
    geometry: Mapped[dict | None] = mapped_column(JSON)
    provider: Mapped[str | None] = mapped_column(String(40))
    calculated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
