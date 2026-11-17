from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    DB_HOST: str
    DB_PORT: int = Field(ge=1, le=65535)
    DB_NAME: str
    DB_USER: str
    DB_PASS: SecretStr

    def get_db_url(self) -> URL:
        return URL.create(
            "postgresql+asyncpg",
            username=self.DB_USER,
            password=self.DB_PASS.get_secret_value(),
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME,
        )


class AuthSettings(BaseSettings):
    model_config = Settings.model_config

    JWT_SECRET: SecretStr | None = Field(default=None, min_length=32)
