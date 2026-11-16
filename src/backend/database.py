from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.config import Settings

engine = create_async_engine(Settings().get_db_url())
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with async_session_maker() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]
