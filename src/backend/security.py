from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from pydantic import ValidationError

from backend.config import AuthSettings
from backend.database import SessionDep
from backend.models import User

password_hasher = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)


@lru_cache
def get_signing_key() -> str:
    try:
        secret = AuthSettings().JWT_SECRET
    except ValidationError:
        secret = None
    if secret is None:
        raise HTTPException(status_code=503, detail="JWT signing key is not configured")
    return secret.get_secret_value()


def issue_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    claims = {"sub": str(user.id), "iat": now, "exp": now + timedelta(hours=1)}
    return jwt.encode(claims, get_signing_key(), algorithm="HS256")


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    session: SessionDep,
) -> User:
    if credentials is None:
        raise unauthorized()
    try:
        payload = jwt.decode(
            credentials.credentials,
            get_signing_key(),
            algorithms=["HS256"],
            options={"require": ["sub", "iat", "exp"]},
        )
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, ValueError):
        raise unauthorized() from None
    if not 1 <= user_id <= 2_147_483_647:
        raise unauthorized()
    user = await session.get(User, user_id)
    if user is None:
        raise unauthorized()
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
