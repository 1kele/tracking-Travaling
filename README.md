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
URL подключения. Git игнорирует локальный `.env`. Приложение и Swagger
доступны с пустым шаблоном. Параметры БД нужны при импорте `backend.database`.

## Структура

- `src/backend/app.py` — экземпляр FastAPI. Роутеры подключаются здесь.
- `src/backend/config.py` — настройки из окружения и `.env`.
- `src/backend/database.py` — async engine, фабрика сессий, `SessionDep` и `Base`.
- `src/backend/routers/` — HTTP-обработчики.
- `src/backend/models/` — модели SQLAlchemy.
- `src/backend/schemas/` — схемы Pydantic.
- `src/backend/repositories/` — место для запросов к базе.
- `src/frontend/` — место для будущего фронтенда.
- `tests/` — тесты Swagger и конфигурации базы.

Зависимости добавляются через `uv add <пакет>`, тестовые зависимости —
через `uv add --dev <пакет>`. Тесты запускаются командой `uv run pytest`.
