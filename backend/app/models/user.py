from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("ArtistProfile", back_populates="user", uselist=False)
    data_projects = relationship("DataProject", back_populates="user", cascade="all, delete-orphan")


class ArtistProfile(Base):
    __tablename__ = "artist_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    discipline = Column(String, nullable=True)   # e.g. "Photographer", "Illustrator"
    bio = Column(Text, nullable=True)
    skills = Column(String, nullable=True)        # comma-separated for now, Phase 1 only
    location = Column(String, nullable=True)
    portfolio_views = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")


class DataProject(Base):
    __tablename__ = "data_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    pipeline_status = Column(String, default="Pending", nullable=False)
    records_processed = Column(Integer, default=0)
    last_run_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="data_projects")
