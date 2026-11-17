from typing import Annotated

from fastapi import Path

ResourceId = Annotated[int, Path(gt=0, le=2_147_483_647)]
