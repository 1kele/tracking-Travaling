from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr, StringConstraints


class UserCreate(BaseModel):
    email: EmailStr = Field(max_length=254)
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    password: SecretStr = Field(min_length=12, max_length=128)


class Login(BaseModel):
    email: EmailStr = Field(max_length=254)
    password: SecretStr = Field(min_length=1, max_length=128)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str


class AccessToken(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
