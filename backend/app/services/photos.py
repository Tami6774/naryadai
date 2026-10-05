"""Хранение фото: сжатие, EXIF-время съёмки, перцептивный хеш (для поиска повторных фото)."""
import io
import uuid
from datetime import datetime

from PIL import ExifTags, Image, ImageOps

from ..config import MEDIA_DIR, PHOTO_JPEG_QUALITY, PHOTO_MAX_SIDE

_EXIF_DT_TAGS = {v: k for k, v in ExifTags.TAGS.items()}


def _exif_taken_at(img: Image.Image) -> datetime | None:
    try:
        exif = img.getexif()
        ifd = exif.get_ifd(ExifTags.IFD.Exif)
        raw = ifd.get(_EXIF_DT_TAGS["DateTimeOriginal"]) or exif.get(_EXIF_DT_TAGS["DateTime"])
        return datetime.strptime(raw, "%Y:%m:%d %H:%M:%S") if raw else None
    except Exception:
        return None


def dhash(img: Image.Image, size: int = 8) -> str:
    """Difference hash 64 бита → 16 hex-символов. Устойчив к сжатию и масштабу."""
    g = img.convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for row in range(size):
        for col in range(size):
            left = px[row * (size + 1) + col]
            right = px[row * (size + 1) + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
    return f"{bits:016x}"


def hamming(a: str, b: str) -> int:
    return bin(int(a, 16) ^ int(b, 16)).count("1")


def save_photo(data: bytes, order_id: int) -> tuple[str, datetime | None, str]:
    """Сохраняет сжатое фото. Возвращает (относительный путь, время съёмки, хеш)."""
    img = Image.open(io.BytesIO(data))
    taken_at = _exif_taken_at(img)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((PHOTO_MAX_SIDE, PHOTO_MAX_SIDE))
    phash = dhash(img)

    rel_dir = f"orders/{order_id}"
    (MEDIA_DIR / rel_dir).mkdir(parents=True, exist_ok=True)
    rel_path = f"{rel_dir}/{uuid.uuid4().hex}.jpg"
    img.save(MEDIA_DIR / rel_path, "JPEG", quality=PHOTO_JPEG_QUALITY, optimize=True)
    return rel_path, taken_at, phash
