from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from starlette.concurrency import run_in_threadpool

from backend.database import SessionDep
from backend.models import User
from backend.schemas.user import AccessToken, Login, UserCreate, UserRead
from backend.security import CurrentUser, issue_token, password_hasher, unauthorized

dummy_password_hash = password_hasher.hash("missing-account-password")
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=201)
async def register(data: UserCreate, session: SessionDep) -> User:
    email = data.email.casefold()
    if len(email) > 254:
        raise HTTPException(status_code=422, detail="Email is too long")
    password_hash = await run_in_threadpool(
        password_hasher.hash, data.password.get_secret_value()
    )
    statement = (
        insert(User)
        .values(email=email, name=data.name, password_hash=password_hash)
        .on_conflict_do_nothing(index_elements=[User.email])
        .returning(User)
    )
    user = await session.scalar(statement)
    if user is None:
        raise HTTPException(status_code=409, detail="Email already registered")
    await session.commit()
    return user


@router.post("/login")
async def login(data: Login, session: SessionDep) -> AccessToken:
    user = await session.scalar(select(User).where(User.email == data.email.casefold()))
    valid, upgraded_hash = await run_in_threadpool(
        password_hasher.verify_and_update,
        data.password.get_secret_value(),
        user.password_hash if user else dummy_password_hash,
    )
    if not valid or user is None:
        raise unauthorized()
    if upgraded_hash is not None:
        user.password_hash = upgraded_hash
        await session.commit()
    return AccessToken(access_token=issue_token(user))


@router.get("/me", response_model=UserRead)
async def me(user: CurrentUser) -> User:
    return user
