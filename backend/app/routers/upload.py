import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session

from app.config import settings
from app.db import get_session
from app.models.project import Project, Job
from app.schemas.project import UploadResponse
from app.services.separation import start_separation

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    if not file.filename or not file.filename.lower().endswith((".mp3", ".wav", ".flac")):
        raise HTTPException(400, "Only MP3, WAV, and FLAC files are supported")

    file_id = uuid.uuid4().hex[:12]
    ext = Path(file.filename).suffix
    save_path = settings.upload_dir / f"{file_id}{ext}"

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = save_path.stat().st_size
    if file_size > settings.max_upload_size_mb * 1024 * 1024:
        save_path.unlink()
        raise HTTPException(413, f"File exceeds {settings.max_upload_size_mb}MB limit")

    project = Project(
        name=Path(file.filename).stem,
        original_filename=file.filename,
        file_path=str(save_path),
    )
    session.add(project)
    session.commit()
    session.refresh(project)

    job = Job(project_id=project.id)
    session.add(job)
    session.commit()
    session.refresh(job)

    await start_separation(project, job.id)

    return UploadResponse(
        project_id=project.id,
        job_id=job.id,
        message="Upload successful, separation started",
    )
