from datetime import datetime
from pydantic import BaseModel


class ProjectResponse(BaseModel):
    id: int
    name: str
    original_filename: str
    created_at: datetime
    stems: list[str]


class ProjectListResponse(BaseModel):
    id: int
    name: str
    original_filename: str
    created_at: datetime


class JobResponse(BaseModel):
    id: int
    project_id: int
    status: str
    error: str | None
    stems_found: list[str]
    created_at: datetime
    completed_at: datetime | None


class UploadResponse(BaseModel):
    project_id: int
    job_id: int
    message: str
