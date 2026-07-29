from datetime import datetime

from pydantic import BaseModel


class DataProjectCreate(BaseModel):
    name: str
    description: str
    source: str
    pipeline_status: str = "Pending"
    records_processed: int = 0


class DataProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    source: str | None = None
    pipeline_status: str | None = None
    records_processed: int | None = None
    last_run_at: datetime | None = None


class DataProjectOut(BaseModel):
    id: int
    name: str
    description: str
    source: str
    pipeline_status: str
    records_processed: int
    last_run_at: datetime | None

    class Config:
        from_attributes = True
