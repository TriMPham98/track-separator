from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./track_separator.db"
    upload_dir: Path = Path("uploads")
    stems_dir: Path = Path("stems")
    max_upload_size_mb: int = 100
    demucs_model: str = "htdemucs_6s"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "TS_"}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.stems_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
