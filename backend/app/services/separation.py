import asyncio
import logging
import shutil
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from sqlmodel import Session

from app.config import settings
from app.db import engine
from app.models.project import Job, Project

logger = logging.getLogger(__name__)

STEM_NAMES = ["drums", "bass", "vocals", "guitar", "piano", "other"]

_executor = ThreadPoolExecutor(max_workers=1)


def _run_demucs(project: Project, job_id: int):
    """Run Demucs separation in a thread."""
    logger.info("Starting separation for job %d, project %d", job_id, project.id)

    project_stems_dir = settings.stems_dir / str(project.id)
    project_stems_dir.mkdir(parents=True, exist_ok=True)

    with Session(engine) as session:
        job = session.get(Job, job_id)
        job.status = "processing"
        session.add(job)
        session.commit()

    try:
        import demucs.separate

        args = [
            "-n", settings.demucs_model,
            "-o", str(project_stems_dir),
            str(project.file_path),
        ]
        logger.info("Running demucs with args: %s", args)
        demucs.separate.main(args)
        logger.info("Demucs finished for job %d", job_id)

        # Find output stems - Demucs outputs to <out_dir>/<model>/<track_name>/
        track_name = Path(project.file_path).stem
        demucs_out = project_stems_dir / settings.demucs_model / track_name

        logger.info("Looking for stems in: %s (exists: %s)", demucs_out, demucs_out.exists())

        stems_found = []
        if demucs_out.exists():
            for stem_file in sorted(demucs_out.iterdir()):
                logger.info("Found file: %s", stem_file)
                stem_name = stem_file.stem
                if stem_name in STEM_NAMES:
                    dest = project_stems_dir / f"{stem_name}.wav"
                    shutil.move(str(stem_file), str(dest))
                    stems_found.append(stem_name)
                    logger.info("Moved stem %s -> %s", stem_file, dest)
        else:
            # List what's actually in the output dir for debugging
            logger.warning("Demucs output dir not found. Contents of %s:", project_stems_dir)
            for p in project_stems_dir.rglob("*"):
                logger.warning("  %s", p)

        with Session(engine) as session:
            job = session.get(Job, job_id)
            job.status = "completed"
            job.stems_found = ",".join(stems_found)
            job.completed_at = datetime.now(timezone.utc)
            session.add(job)
            session.commit()

        logger.info("Job %d completed with stems: %s", job_id, stems_found)

    except Exception as e:
        logger.exception("Separation failed for job %d: %s", job_id, e)
        with Session(engine) as session:
            job = session.get(Job, job_id)
            job.status = "failed"
            job.error = str(e)
            session.add(job)
            session.commit()


async def start_separation(project: Project, job_id: int):
    """Start Demucs separation as a background task."""
    _executor.submit(_run_demucs, project, job_id)
