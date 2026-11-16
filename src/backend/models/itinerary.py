from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base


class ItemStatus(StrEnum):
    PLANNED = "planned"
    VISITED = "visited"


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    __table_args__ = (
        UniqueConstraint("trip_id", "position", name="uq_itinerary_trip_position"),
        CheckConstraint("position >= 1", name="ck_itinerary_position"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"))
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"), index=True)
    position: Mapped[int]
    planned_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[ItemStatus] = mapped_column(
        Enum(
            ItemStatus,
            name="item_status",
            values_callable=lambda members: [member.value for member in members],
            native_enum=False,
            create_constraint=True,
        ),
        server_default=ItemStatus.PLANNED.value,
    )


class Visit(Base):
    __tablename__ = "visits"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_visits_rating"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    itinerary_item_id: Mapped[int] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE"), unique=True
    )
    visited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    rating: Mapped[int | None]


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    itinerary_item_id: Mapped[int] = mapped_column(
        ForeignKey("itinerary_items.id", ondelete="CASCADE"), index=True
    )
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
