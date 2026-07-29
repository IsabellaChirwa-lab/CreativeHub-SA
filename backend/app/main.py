from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.routers import auth, profiles, data_projects

# Phase 1: create tables directly from models on startup.
# We'll move to Alembic migrations once the schema stabilises.
Base.metadata.create_all(bind=engine)

# Seed demo user for login testing
from app.core.security import hash_password
from app.models.user import ArtistProfile, DataProject, User
from app.core.database import SessionLocal

with SessionLocal() as db:
    demo_user = db.query(User).filter(User.email == "demo@creativehub.sa").first()
    if not demo_user:
        demo_user = User(
            email="demo@creativehub.sa",
            hashed_password=hash_password("Password123!"),
            full_name="Demo Artist",
        )
        db.add(demo_user)
        db.flush()

    if not db.query(ArtistProfile).filter(ArtistProfile.user_id == demo_user.id).first():
        profile = ArtistProfile(
            user_id=demo_user.id,
            discipline="Multidisciplinary Creative",
            bio="Demo profile for creatives showcasing portfolios, projects and client work.",
            skills="Photography, Illustration, UI/UX, Visual Storytelling",
            location="Cape Town, South Africa",
            portfolio_views=120,
        )
        db.add(profile)

    if not db.query(DataProject).filter(DataProject.user_id == demo_user.id).first():
        sample_project = DataProject(
            user_id=demo_user.id,
            name="Creative Assets Ingestion",
            description="Track photo and design asset ingestion from S3 into the platform.",
            source="AWS S3",
            pipeline_status="Succeeded",
            records_processed=4200,
        )
        db.add(sample_project)

    db.commit()

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
app.include_router(data_projects.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
