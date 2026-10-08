"""Необязательный модуль языковой и мультимодальной модели (Claude) для ИИ-проверки нарядов.

Разделы 6.2–6.3 кейса: «языковая модель сравнивает описание проблемы и выполненных работ»,
«мультимодальная модель сравнивает фото до и после».

Включается явно: переменной ANTHROPIC_API_KEY или AI_LLM_ENABLED=true. Без них, а также при
таймауте, ошибке сети/API или отказе модели функции возвращают None — ai_review продолжает
работать на правилах (rules-v1), наряд закрывается в любом случае.

Безопасность данных (раздел 9): в модель уходят только технические тексты наряда (описание,
выполненные работы, шифр) и фото оборудования — без ФИО, логинов и других персональных данных.
"""
from __future__ import annotations

import base64
import json
import logging
import os
from functools import lru_cache
from pathlib import Path

import anthropic

from ..config import MEDIA_DIR
from ..i18n import is_kz

log = logging.getLogger(__name__)

MODEL = os.getenv("AI_LLM_MODEL", "claude-opus-5-5")
EFFORT = os.getenv("AI_LLM_EFFORT", "low")          # проверка идёт внутри запроса «Исполнено» — важна скорость
TIMEOUT_SEC = float(os.getenv("AI_LLM_TIMEOUT_SEC", "25"))
MAX_PHOTOS_PER_KIND = 2


def enabled() -> bool:
    flag = os.getenv("AI_LLM_ENABLED", "").strip().lower()
    if flag in ("0", "false", "no"):
        return False
    return bool(os.getenv("ANTHROPIC_API_KEY")) or flag in ("1", "true", "yes")


@lru_cache(maxsize=1)
def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(timeout=TIMEOUT_SEC, max_retries=1)


# Тексты в ответе модели (explanation, missing, issues) — на языке интерфейса
_LANG_NOTE = (" Ignore the instruction to answer in Russian: write every text field of the answer "
              "(explanation, missing, issues) in Kazakh (қазақ тілінде).")


def _call_json(system: str, content: list, schema: dict, max_tokens: int = 2000) -> dict | None:
    """Один запрос со структурированным ответом по JSON-схеме. None — модель недоступна/отказала."""
    try:
        response = _client().beta.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",            # отказ классификатора → рекомендованная резервная модель
            output_config={"effort": EFFORT, "format": {"type": "json_schema", "schema": schema}},
            system=system + _LANG_NOTE if is_kz() else system,
            messages=[{"role": "user", "content": content}],
        )
    except anthropic.APITimeoutError:
        log.warning("Claude: таймаут %.0f с — используем правила", TIMEOUT_SEC)
        return None
    except anthropic.RateLimitError:
        log.warning("Claude: превышен лимит запросов — используем правила")
        return None
    except anthropic.APIStatusError as e:
        log.warning("Claude: ошибка API %s (%s) — используем правила", e.status_code, e.message)
        return None
    except anthropic.APIConnectionError:
        log.warning("Claude: нет связи с API — используем правила")
        return None
    except anthropic.AnthropicError as e:   # например, не настроены учётные данные
        log.warning("Claude недоступен: %s — используем правила", e)
        return None

    if response.stop_reason == "refusal":
        log.warning("Claude: отказ (%s) — используем правила",
                    response.stop_details.category if response.stop_details else "—")
        return None
    if response.stop_reason == "max_tokens":
        log.warning("Claude: ответ обрезан по max_tokens — используем правила")
        return None
    text = next((b.text for b in response.content if b.type == "text"), None)
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        log.warning("Claude: некорректный JSON — используем правила")
        return None


# ------------------------------------------------------------------ 6.2: соответствие работ проблеме

RELEVANCE_SCHEMA = {
    "type": "object",
    "properties": {
        "relevant": {"type": "boolean", "description": "Работы устраняют заявленную неисправность"},
        "confidence": {"type": "number", "description": "Уверенность 0..1"},
        "explanation": {"type": "string", "description": "1–2 предложения для мастера и исполнителя"},
        "missing": {"type": "array", "items": {"type": "string"},
                    "description": "Каких операций не хватает (пусто, если всё есть)"},
    },
    "required": ["relevant", "confidence", "explanation", "missing"],
    "additionalProperties": False,
}

RELEVANCE_SYSTEM = (
    "Ты — цифровой контролёр смены на горно-обогатительном предприятии. Тебе дают описание "
    "неисправности из наряда, шифр неисправности и текст исполнителя о выполненных работах. "
    "Оцени, устраняют ли выполненные работы заявленную проблему и соответствуют ли шифру. "
    "Считай работы соответствующими, если они по существу устраняют причину, даже если "
    "сформулированы иначе. Отвечай на русском, коротко и по-деловому."
)


def check_relevance(description: str, work_done: str, fault_name: str) -> dict | None:
    if not enabled():
        return None
    text = (f"Описание неисправности: {description}\n"
            f"Шифр неисправности: {fault_name or 'не указан'}\n"
            f"Выполненные работы (со слов исполнителя): {work_done}")
    return _call_json(RELEVANCE_SYSTEM, [{"type": "text", "text": text}], RELEVANCE_SCHEMA)


# ------------------------------------------------------------------ 6.3: фото «до» и «после»

PHOTO_SCHEMA = {
    "type": "object",
    "properties": {
        "same_equipment": {"type": "boolean", "description": "На фото «до» и «после» тот же узел/оборудование"},
        "problem_fixed": {"type": "string", "enum": ["yes", "no", "unclear"],
                          "description": "Устранена ли видимая проблема"},
        "quality_issues": {"type": "array", "items": {"type": "string"},
                           "description": "Видимые недочёты: мусор, незакреплённые элементы, нет кожуха и т.п."},
        "score": {"type": "integer", "description": "Оценка качества по фото от 1 до 5"},
        "confidence": {"type": "number", "description": "Уверенность 0..1"},
        "explanation": {"type": "string", "description": "Короткое пояснение на русском"},
    },
    "required": ["same_equipment", "problem_fixed", "quality_issues", "score", "confidence", "explanation"],
    "additionalProperties": False,
}

PHOTO_SYSTEM = (
    "Ты — цифровой контролёр ремонтов на горно-обогатительном предприятии. Тебе дают фото "
    "неисправности «до» (если есть) и фото «после» ремонта. Определи: то ли это оборудование, "
    "устранена ли видимая проблема (течь, обрыв, разрушение, загрязнение), есть ли видимые "
    "недочёты (мусор, незакреплённые элементы, отсутствие защитных кожухов). Оцени качество "
    "от 1 до 5. Если по фото нельзя уверенно судить — ставь problem_fixed=\"unclear\" и низкую "
    "уверенность: окончательное решение примет мастер. Отвечай на русском."
)


def _image_block(rel_path: str) -> dict | None:
    path = Path(MEDIA_DIR) / rel_path
    try:
        data = path.read_bytes()
    except OSError:
        return None
    # фото сохраняются в JPEG при загрузке (services/photos.py)
    return {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg",
                                        "data": base64.standard_b64encode(data).decode("ascii")}}


def compare_photos(description: str, before_paths: list[str], after_paths: list[str]) -> dict | None:
    if not enabled() or not after_paths:
        return None
    content: list = [{"type": "text", "text": f"Неисправность по наряду: {description}"}]
    for label, paths in (("Фото «до» (неисправность)", before_paths), ("Фото «после» ремонта", after_paths)):
        blocks = [b for b in (_image_block(p) for p in paths[:MAX_PHOTOS_PER_KIND]) if b]
        if blocks:
            content.append({"type": "text", "text": label + ":"})
            content.extend(blocks)
    if not any(b.get("type") == "image" for b in content):
        return None
    result = _call_json(PHOTO_SYSTEM, content, PHOTO_SCHEMA)
    if result is not None:
        result["score"] = max(1, min(5, int(result.get("score", 3))))
    return result
