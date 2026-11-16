from fastapi import APIRouter

from backend.schemas.health import HealthStatus

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> HealthStatus:
    return HealthStatus()
