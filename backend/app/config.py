"""Настройки приложения (читаются из переменных окружения)."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# По умолчанию SQLite — чтобы проект запускался без Docker.
# Для PostgreSQL: DATABASE_URL=postgresql+psycopg://naryad:naryad@localhost:5432/naryad
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'naryad.db'}")

JWT_SECRET = os.getenv("JWT_SECRET", "naryad-ai-kostanai-minerals-production-secret-key-32b")
JWT_TTL_HOURS = int(os.getenv("JWT_TTL_HOURS", "24"))

MEDIA_DIR = Path(os.getenv("MEDIA_DIR", BASE_DIR / "media"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Фото: максимальная сторона и качество JPEG после сжатия
PHOTO_MAX_SIDE = int(os.getenv("PHOTO_MAX_SIDE", "1600"))
PHOTO_JPEG_QUALITY = int(os.getenv("PHOTO_JPEG_QUALITY", "75"))

# Контроль сроков (раздел 6.1 кейса)
DEADLINE_CHECK_INTERVAL_SEC = int(os.getenv("DEADLINE_CHECK_INTERVAL_SEC", "30"))
REMIND_BEFORE_MIN = int(os.getenv("REMIND_BEFORE_MIN", "30"))
ACCEPT_TIMEOUT_MIN = int(os.getenv("ACCEPT_TIMEOUT_MIN", "10"))
ACCEPT_TIMEOUT_EMERGENCY_MIN = int(os.getenv("ACCEPT_TIMEOUT_EMERGENCY_MIN", "3"))
OVERDUE_REPEAT_MIN = int(os.getenv("OVERDUE_REPEAT_MIN", "30"))

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
