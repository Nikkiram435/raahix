from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (isse tables register hoti hain)
from auth_routes import router as auth_router
from trips_routes import router as trips_router
from saved_routes import router as saved_router
from database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RAAHIX API")

# Frontend (Live Server, port 5500) ko backend se baat karne ki ijazat
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(saved_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "RAAHIX"}