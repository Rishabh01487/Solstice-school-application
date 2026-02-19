"""
EduNexus School — Application Configuration
Uses pydantic-settings to load from environment variables / .env file.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ──
    APP_NAME: str = "EduNexus School"
    APP_ENV: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://edunexus:edunexus_pass@db:5432/edunexus"
    DATABASE_URL_SYNC: str = "postgresql://edunexus:edunexus_pass@db:5432/edunexus"

    # ── Redis ──
    REDIS_URL: str = "redis://redis:6379/0"

    # ── JWT ──
    SECRET_KEY: str = "change-me-to-a-random-64-char-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── File Storage ──
    STORAGE_BACKEND: str = "minio"  # "minio" or "gcs"
    GCS_BUCKET: str = "edunexus-files"
    GCS_CREDENTIALS_PATH: str = ""

    # MinIO (local dev)
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "edunexus-files"
    MINIO_USE_SSL: bool = False

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
