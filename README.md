# tracking-Travaling

Бэкенд сервиса планирования поездок на FastAPI. Нужны Python 3.12 и uv.

## Локальный запуск

Команды выполняются из корня репозитория.

```bash
uv sync
[ -f .env ] || cp .env.example .env
uv run uvicorn backend.app:app --reload
```

Swagger UI доступен на http://127.0.0.1:8000/docs.
`GET /health` проверяет, что приложение отвечает.

Для подключения PostgreSQL заполни `DATABASE_URL` в локальном `.env`.

```dotenv
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE
```

Без заполненного URL приложение запускается, и `/health` отвечает. Соединение
с базой открывается при первом запросе SQL. Локальный `.env` игнорируется Git.

## Структура

- `src/backend/app.py` — приложение FastAPI.
- `src/backend/config.py` — настройки из окружения и `.env`.
- `src/backend/database.py` — зависимость для асинхронной сессии на запрос.
- `src/backend/api/` — подключение роутеров.
- `src/backend/routers/` — HTTP-обработчики.
- `src/backend/models/` — модели SQLAlchemy.
- `src/backend/schemas/` — схемы Pydantic.
- `src/backend/repositories/` — место для запросов к базе.
- `src/frontend/` — место для будущего фронтенда.
- `tests/` — тесты запуска API и запроса через асинхронную сессию.

`pyproject.toml` и `uv.lock` лежат в корне. Зависимости добавляются через
`uv add <пакет>`, тестовые зависимости — через `uv add --dev <пакет>`.
Тесты запускаются командой `uv run pytest` и используют SQLite в памяти.
