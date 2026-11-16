from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.api.router import router
from backend.config import Settings
from backend.database import database_sessions


def create_app(settings: Settings | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        config = settings if settings is not None else Settings()
        database_url = config.database_url
        async with database_sessions(
            database_url.get_secret_value() if database_url is not None else None
        ) as session_factory:
            app.state.session_factory = session_factory
            yield

    app = FastAPI(title="Tracking Traveling API", lifespan=lifespan)
    app.include_router(router)
    return app


app = create_app()
