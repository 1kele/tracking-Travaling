from backend.config import Settings


def test_settings_read_database_url_from_dotenv(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    database_url = "postgresql+asyncpg://user:password@localhost:5432/travel"
    (tmp_path / ".env").write_text(f"DATABASE_URL={database_url}\n", encoding="utf-8")

    settings = Settings()

    assert settings.database_url is not None
    assert settings.database_url.get_secret_value() == database_url
