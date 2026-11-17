from collections.abc import AsyncIterator
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.config import Settings

@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    try:
        url = Settings().get_db_url()
    except ValidationError:
        raise HTTPException(status_code=503, detail="Database is not configured") from None
    engine = create_async_engine(url, pool_pre_ping=True)
    return async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    session_factory = get_session_factory()
    async with session_factory() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]
