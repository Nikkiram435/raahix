from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAAHIX API")

# Frontend (Live Server) ko backend se baat karne ki ijazat
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"app": "RAAHIX", "status": "running"}


@app.get("/api/health")
def health():
    return {"ok": True}