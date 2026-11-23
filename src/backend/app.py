from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.routers import admin_catalog, auth, catalog, itinerary, notes, trips

app = FastAPI(title="Tracking Traveling API")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin_catalog.router, prefix="/api/v1")
app.include_router(catalog.router, prefix="/api/v1")
app.include_router(trips.router, prefix="/api/v1")
app.include_router(itinerary.router, prefix="/api/v1")
app.include_router(notes.router, prefix="/api/v1")


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, exception: RequestValidationError) -> JSONResponse:
    detail = [
        {key: error[key] for key in ("loc", "msg", "type")}
        for error in exception.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": detail})


frontend = Path(__file__).resolve().parents[2] / "frontend"
if frontend.is_dir():
    app.mount("/", StaticFiles(directory=frontend, html=True), name="frontend")
