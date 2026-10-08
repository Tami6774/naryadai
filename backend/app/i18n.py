"""Язык текстов, которые генерирует сервер (ИИ-заключения, аналитика, уведомления, отчёты).

Язык берётся из заголовка `X-Lang` или параметра `?lang=` (ru | kz) и хранится в contextvar на время запроса.
Вне запроса (фоновый планировщик) действует русский. Тексты, сохранённые в БД (журнал наряда, уведомления,
заключение ИИ), остаются на языке того запроса, в котором они созданы.
"""
from contextvars import ContextVar

DEFAULT_LANG = "ru"
_lang: ContextVar[str] = ContextVar("naryad_lang", default=DEFAULT_LANG)


def normalize(value: str | None) -> str:
    return "kz" if (value or "").strip().lower() in ("kz", "kk", "kk-kz") else DEFAULT_LANG


def set_lang(value: str | None):
    """Возвращает токен для сброса: `_lang.reset(token)` не нужен — contextvar живёт в рамках запроса."""
    return _lang.set(normalize(value))


def get_lang() -> str:
    return _lang.get()


def is_kz() -> bool:
    return _lang.get() == "kz"


def T(ru: str, kz: str) -> str:
    """Текст на языке текущего запроса: `T('Свободен', 'Бос')`."""
    return kz if _lang.get() == "kz" else ru
