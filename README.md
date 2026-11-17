# tracking-Travaling

Бэкенд сервиса планирования поездок на FastAPI. Нужны Python 3.12 и uv.

## Локальный запуск

Команды выполняются из корня репозитория.

```bash
uv sync --locked
[ -f .env ] || cp .env.example .env
uv run uvicorn backend.app:app --reload
```

Swagger UI доступен на http://127.0.0.1:8000/docs.

Для работы с PostgreSQL заполни `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`
и `DB_PASS` в локальном `.env`. `config.py` читает эти параметры и собирает
URL подключения. Git игнорирует локальный `.env`. Swagger доступен с пустым
шаблоном. Ручки открывают сессию БД при первом запросе.

## Миграции

После заполнения `.env` выполни `uv run alembic upgrade head`. Для просмотра
SQL начальной миграции можно выполнить `uv run alembic upgrade head --sql`.

## API

В локальном `.env` заполни `JWT_SECRET` случайной строкой длиной не менее
32 символов. Сгенерировать её можно командой
`uv run python -c "import secrets; print(secrets.token_urlsafe(32))"`.
Вход выдаёт токен на один час. Передавай его как
`Authorization: Bearer <access_token>`.

Все пути начинаются с `/api/v1`.

| Раздел | Ручки |
| --- | --- |
| Аккаунт | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Каталог | `GET /cities`, `GET /cities/{city_id}/places` |
| Поездки | `GET /trips`, `POST /trips`, `GET /trips/{trip_id}`, `DELETE /trips/{trip_id}` |
| Маршрут | `GET /trips/{trip_id}/items`, `POST /trips/{trip_id}/items`, `DELETE /trips/{trip_id}/items/{item_id}` |
| Посещения | `GET` и `PUT /trips/{trip_id}/items/{item_id}/visit`, `GET /trips/{trip_id}/progress` |

Каталог читается из таблиц `cities` и `places`. Чтобы добавить демонстрационный
город и место, выполни SQL в своей локальной БД после миграции.

```sql
WITH city AS (
    INSERT INTO cities (name, country, lat, lon)
    VALUES ('Казань', 'Россия', 55.79, 49.12)
    ON CONFLICT (name, country) DO NOTHING
    RETURNING id
)
INSERT INTO places (city_id, name, category, address, lat, lon)
SELECT id, 'Казанский кремль', 'достопримечательность', 'Кремлёвская, 2', 55.80, 49.11
FROM city;
```

## Структура

- `src/backend/app.py` — экземпляр FastAPI. Роутеры подключаются здесь.
- `src/backend/config.py` — настройки из окружения и `.env`.
- `src/backend/database.py` — async engine, фабрика сессий и `SessionDep`.
- `src/backend/routers/` — HTTP-обработчики.
- `src/backend/models/` — модели SQLAlchemy.
- `src/backend/schemas/` — схемы Pydantic.
- `src/backend/repositories/` — место для запросов к базе.
- `src/frontend/` — место для будущего фронтенда.
- `tests/` — тесты Swagger и конфигурации базы.

Зависимости добавляются через `uv add <пакет>`, тестовые зависимости —
через `uv add --dev <пакет>`. Тесты запускаются командой `uv run pytest`.

Интеграционные тесты запускаются с URL отдельной тестовой базы PostgreSQL.

```bash
TEST_DATABASE_URL='postgresql+asyncpg://USER:PASSWORD@localhost:5432/TEST_DB' uv run pytest
```

Тестовая роль должна иметь право создавать схемы в этой базе. Каждый
интеграционный тест создаёт и удаляет собственную временную схему.
