from sqlalchemy.engine import make_url

from backend.config import Settings


def test_settings_build_postgresql_url_from_dotenv(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    for key in ("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASS"):
        monkeypatch.delenv(key, raising=False)
    (tmp_path / ".env").write_text(
        "DB_HOST=localhost\n"
        "DB_PORT=5433\n"
        "DB_NAME=travel\n"
        "DB_USER=traveler\n"
        "DB_PASS=p@ss:/word#\n",
        encoding="utf-8",
    )

    url = Settings().get_db_url()

    assert url.drivername == "postgresql+asyncpg"
    assert (url.host, url.port, url.database) == ("localhost", 5433, "travel")
    assert url.username == "traveler"
    assert make_url(url.render_as_string(hide_password=False)).password == "p@ss:/word#"
