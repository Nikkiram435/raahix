from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import models  
from auth_routes import router as auth_router
from trips_routes import router as trips_router
from saved_routes import router as saved_router
from chat_routes import router as chat_router
from weather_routes import router as weather_router
from places_routes import router as places_router
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RAAHIX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(saved_router)
app.include_router(chat_router)
app.include_router(weather_router)
app.include_router(places_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "RAAHIX"}


FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
