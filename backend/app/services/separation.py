import asyncio
import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from sqlmodel import Session

from app.config import settings
from app.db import engine
from app.models.project import Job, Project
from app.ws import broadcast_sync

STEM_NAMES = ["drums", "bass", "vocals", "guitar", "piano", "other"]

_executor = ThreadPoolExecutor(max_workers=1)


def _run_demucs(project: Project, job_id: int, loop: asyncio.AbstractEventLoop):
    """Run Demucs separation in a thread."""
    import demucs.separate

    project_stems_dir = settings.stems_dir / str(project.id)
    project_stems_dir.mkdir(parents=True, exist_ok=True)

    broadcast_sync(job_id, {"type": "status", "status": "processing", "stems_found": []})

    with Session(engine) as session:
        job = session.get(Job, job_id)
        job.status = "processing"
        session.add(job)
        session.commit()

    try:
        demucs.separate.main([
            "--two-stems=None",
            "-n", settings.demucs_model,
            "-o", str(project_stems_dir),
            str(project.file_path),
        ])

        # Find output stems - Demucs outputs to <out_dir>/<model>/<track_name>/
        track_name = Path(project.file_path).stem
        demucs_out = project_stems_dir / settings.demucs_model / track_name

        stems_found = []
        if demucs_out.exists():
            for stem_file in demucs_out.iterdir():
                stem_name = stem_file.stem
                if stem_name in STEM_NAMES:
                    # Move stem to project stems dir for easy access
                    dest = project_stems_dir / f"{stem_name}.wav"
                    stem_file.rename(dest)
                    stems_found.append(stem_name)
                    broadcast_sync(job_id, {
                        "type": "stem_complete",
                        "stem": stem_name,
                        "stems_found": stems_found,
                    })

        with Session(engine) as session:
            job = session.get(Job, job_id)
            job.status = "completed"
            job.stems_found = ",".join(stems_found)
            job.completed_at = datetime.now(timezone.utc)
            session.add(job)
            session.commit()

        broadcast_sync(job_id, {
            "type": "status",
            "status": "completed",
            "stems_found": stems_found,
        })

    except Exception as e:
        with Session(engine) as session:
            job = session.get(Job, job_id)
            job.status = "failed"
            job.error = str(e)
            session.add(job)
            session.commit()

        broadcast_sync(job_id, {
            "type": "status",
            "status": "failed",
            "error": str(e),
        })


async def start_separation(project: Project, job_id: int):
    """Start Demucs separation as a background task."""
    loop = asyncio.get_event_loop()
    _executor.submit(_run_demucs, project, job_id, loop)
