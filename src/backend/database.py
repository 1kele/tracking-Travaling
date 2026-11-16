from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


@asynccontextmanager
async def database_sessions(
    database_url: str | None,
) -> AsyncIterator[async_sessionmaker[AsyncSession] | None]:
    if database_url is None:
        yield None
        return

    engine = create_async_engine(database_url, pool_pre_ping=True)
    try:
        yield async_sessionmaker(engine, expire_on_commit=False)
    finally:
        await engine.dispose()


async def get_session(request: Request) -> AsyncIterator[AsyncSession]:
    session_factory: async_sessionmaker[AsyncSession] | None = (
        request.app.state.session_factory
    )
    if session_factory is None:
        raise HTTPException(status_code=503, detail="Database is not configured")

    async with session_factory() as session:
        yield session
