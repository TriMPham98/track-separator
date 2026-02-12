from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    original_filename: str
    file_path: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    status: str = Field(default="pending")  # pending, processing, completed, failed
    error: Optional[str] = None
    stems_found: str = Field(default="")  # comma-separated list of completed stems
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
