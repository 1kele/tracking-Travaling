"""Local administrative commands using the database configured in .env."""
import argparse
import asyncio

from sqlalchemy import select

from backend.database import get_session_factory
from backend.models import User


async def set_admin(email: str, enabled: bool) -> None:
    sessions = get_session_factory()
    try:
        async with sessions.begin() as session:
            user = await session.scalar(select(User).where(User.email == email.casefold()))
            if user is None:
                raise SystemExit("User not found. Register this account first.")
            user.is_admin = enabled
        print("Administrator permission updated.")
    finally:
        await sessions.kw["bind"].dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["grant-admin", "revoke-admin"])
    parser.add_argument("email")
    args = parser.parse_args()
    asyncio.run(set_admin(args.email, args.action == "grant-admin"))


if __name__ == "__main__":
    main()
