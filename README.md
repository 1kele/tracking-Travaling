# tracking-Travaling

Сервис планирования поездок на FastAPI и JavaScript. Нужны Python 3.12 и uv.

## Локальный запуск

Команды выполняются из корня репозитория.

```bash
uv sync --locked
[ -f .env ] || cp .env.example .env
uv run uvicorn backend.app:app --reload
```

Сайт доступен на http://127.0.0.1:8000/, Swagger UI — на http://127.0.0.1:8000/docs.
FastAPI раздаёт фронтенд и API с одного адреса. На сайте можно зарегистрироваться,
войти и сохранить поездку, её маршрут и посещения в PostgreSQL. Если в базе уже
создан локальный демоаккаунт, используй его данные из `.env.demo`.
Каталог может быть пустым после первой миграции. Пример заполнения ниже.

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
| Поездки | `GET /trips`, `POST /trips`, `GET`, `PATCH` и `DELETE /trips/{trip_id}` |
| Маршрут | `GET /trips/{trip_id}/items`, `POST /trips/{trip_id}/items`, `DELETE /trips/{trip_id}/items/{item_id}` |
| Посещения | `GET`, `PUT` и `DELETE /trips/{trip_id}/items/{item_id}/visit`, `GET /trips/{trip_id}/progress` |
| Порядок остановок | `PUT /trips/{trip_id}/items/order` |
| Время остановки | `PATCH /trips/{trip_id}/items/{item_id}` |
| Пешеходный путь | `POST` и `GET /trips/{trip_id}/route` |
| Заметки | `GET` и `POST /trips/{trip_id}/items/{item_id}/notes`, `PATCH` и `DELETE /trips/{trip_id}/items/{item_id}/notes/{note_id}` |
| Каталог администратора | `POST /admin/cities`, `PATCH` и `DELETE /admin/cities/{city_id}`, `POST /admin/cities/{city_id}/places`, `PATCH` и `DELETE /admin/cities/{city_id}/places/{place_id}` |

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
- `frontend/` — интерфейс сайта и клиент для API.
- `tests/` — тесты Swagger и конфигурации базы.

Зависимости добавляются через `uv add <пакет>`, тестовые зависимости —
через `uv add --dev <пакет>`. Тесты запускаются командой `uv run pytest`.

Интеграционные тесты запускаются с URL отдельной тестовой базы PostgreSQL.

```bash
TEST_DATABASE_URL='postgresql+asyncpg://USER:PASSWORD@localhost:5432/TEST_DB' uv run pytest
```

Тестовая роль должна иметь право создавать схемы в этой базе. Каждый
интеграционный тест создаёт и удаляет собственную временную схему.


## Правила работы бэкенда

`PATCH /trips/{trip_id}` принимает название, даты и статус. Переходы статусов
разрешены из `planned` в `in_progress`, из `in_progress` в `completed`
или `planned`, из `completed` в `planned`. Повторная установка текущего
статуса допустима. Новые даты должны включать все запланированные остановки.

Для изменения порядка передай `{"item_ids": [3, 1, 2]}` в
`PUT /trips/{trip_id}/items/order`. Список должен содержать все текущие
остановки ровно по одному разу. Новые позиции сохраняются от 1 до N.
Операции изменения одной поездки блокируются на время транзакции, поэтому
параллельные перестановки применяются последовательно.

Для времени остановки передай `{"planned_time": "2026-12-04T12:00:00Z"}`.
Значение `null` очищает время. Дата проверяется в UTC относительно дат поездки.
Снятие отметки о посещении удаляет посещение вместе с оценкой и пересчитывает
прогресс. Повторный запрос снятия отметки допустим.

Заметки принадлежат остановке личной поездки. В запросе создания или
изменения заметки передаётся `{"text": "Мои впечатления"}`. Длина текста
от 1 до 5000 символов. Оценка от 1 до 5 передаётся в ручку посещения.

## Пешеходный маршрут

Добавь от 2 до 50 остановок и вызови `POST /api/v1/trips/{trip_id}/route`.
Бэкенд запрашивает пешеходный путь Valhalla по дорожной сети OpenStreetMap
в текущем порядке остановок. Ответ содержит расстояние в километрах,
округлённое вверх время в минутах, список ID остановок, время расчёта
и геометрию GeoJSON LineString с координатами `[долгота, широта]`.

`GET /api/v1/trips/{trip_id}/route` возвращает сохранённый результат.
Добавление, удаление и перестановка остановок, а также изменение координат
места сбрасывают расчёт. После этого GET возвращает 404 до следующего POST.
Ошибки сервиса маршрутизации возвращаются как 422 для недоступного пути,
502 для некорректного ответа и 503 для недоступного провайдера.

В `.env` можно указать `ROUTING_BASE_URL` и `ROUTING_TIMEOUT_SECONDS`.
По умолчанию используется `https://valhalla1.openstreetmap.de` и тайм-аут
12 секунд. Публичный сервер подходит для учебной демонстрации. Собственный
экземпляр Valhalla подключается тем же параметром.
Порядок остановок задаёт пользователь, автоматическая оптимизация порядка
остаётся отдельной задачей.

## Управление каталогом

После применения миграций зарегистрируй аккаунт и назначь ему права
администратора локальной командой из корня проекта.

```bash
uv run python -m backend.manage grant-admin your-email@example.com
```

Отозвать права можно командой
`uv run python -m backend.manage revoke-admin your-email@example.com`. Роль проверяется в БД при каждом запросе.
Обычная регистрация создаёт пользователя с правами путешественника.
Администратор управляет каталогом через раздел `admin catalog` в Swagger.
Удаление города или места, на которое ссылаются другие записи, возвращает 409.

## Ветки и ответственность

Основная ветка проекта — `master`. Бэкенд, миграции и тесты ведёт Михаил,
фронтенд — Булат. Законченные фичи бэкенда разрабатываются в
`feature/trip-management`, `feature/itinerary-management`, `feature/trip-notes`,
`feature/catalog-management` и `feature/walking-routes` и сливаются в `master`
после проверок. Следующие фичи получают собственные ветки от актуального
`master`. Для коммитов используются английские сообщения с префиксами
`feat:`, `fix:`, `test:`, `refactor:`, `chore:` и `docs:`.
