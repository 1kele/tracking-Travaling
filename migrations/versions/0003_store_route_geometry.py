"""Store calculated walking routes and their stop sequence."""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("routes", sa.Column("stop_ids", sa.JSON(), nullable=True))
    op.add_column("routes", sa.Column("geometry", sa.JSON(), nullable=True))
    op.add_column("routes", sa.Column("provider", sa.String(40), nullable=True))
    op.add_column("routes", sa.Column("calculated_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    for column in ("calculated_at", "provider", "geometry", "stop_ids"):
        op.drop_column("routes", column)
