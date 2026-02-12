import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from app.config import settings
from app.db import get_session
from app.models.project import Project, Job
from app.schemas.project import ProjectResponse, ProjectListResponse, JobResponse

router = APIRouter(prefix="/api", tags=["projects"])

STEM_NAMES = ["drums", "bass", "vocals", "guitar", "piano", "other"]


def _get_project_stems(project_id: int) -> list[str]:
    stems_dir = settings.stems_dir / str(project_id)
    if not stems_dir.exists():
        return []
    return [f.stem for f in stems_dir.glob("*.wav") if f.stem in STEM_NAMES]


@router.get("/projects", response_model=list[ProjectListResponse])
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project).order_by(Project.created_at.desc())).all()
    return projects


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    stems = _get_project_stems(project_id)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        original_filename=project.original_filename,
        created_at=project.created_at,
        stems=stems,
    )


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # Delete files
    upload_path = Path(project.file_path)
    if upload_path.exists():
        upload_path.unlink()
    stems_dir = settings.stems_dir / str(project_id)
    if stems_dir.exists():
        shutil.rmtree(stems_dir)

    # Delete DB records
    jobs = session.exec(select(Job).where(Job.project_id == project_id)).all()
    for job in jobs:
        session.delete(job)
    session.delete(project)
    session.commit()

    return {"message": "Project deleted"}


@router.get("/projects/{project_id}/stems/{stem_name}")
def get_stem(project_id: int, stem_name: str, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    if stem_name not in STEM_NAMES:
        raise HTTPException(400, f"Invalid stem name. Must be one of: {STEM_NAMES}")

    stem_path = settings.stems_dir / str(project_id) / f"{stem_name}.wav"
    if not stem_path.exists():
        raise HTTPException(404, "Stem not found")

    return FileResponse(
        path=str(stem_path),
        media_type="audio/wav",
        filename=f"{project.name}_{stem_name}.wav",
    )


@router.post("/projects/{project_id}/separate", response_model=JobResponse)
async def start_separation_endpoint(
    project_id: int,
    session: Session = Depends(get_session),
):
    from app.services.separation import start_separation

    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    job = Job(project_id=project_id)
    session.add(job)
    session.commit()
    session.refresh(job)

    await start_separation(project, job.id)

    return JobResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        error=job.error,
        stems_found=[],
        created_at=job.created_at,
        completed_at=job.completed_at,
    )


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    stems = job.stems_found.split(",") if job.stems_found else []
    return JobResponse(
        id=job.id,
        project_id=job.project_id,
        status=job.status,
        error=job.error,
        stems_found=stems,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )
