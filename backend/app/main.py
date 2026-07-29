from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth, profiles

# Phase 1: create tables directly from models on startup.
# We'll move to Alembic migrations once the schema stabilises.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CreativeHub SA API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profiles.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
