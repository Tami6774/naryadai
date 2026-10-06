"""ИИ-проверка выполнения наряда (раздел 6.2) — базовый уровень на правилах.

Детерминированные проверки дают надёжный вердикт даже без LLM. На следующем этапе
сюда подключается языковая модель (соответствие работ проблеме) и мультимодальное
сравнение фото «до/после» поверх этих правил.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AIAssessment, MaterialNorm, Photo, Verdict, WorkOrder, WorkType
from ..serializers import work_minutes
from .photos import hamming

CRITICAL, REMARK, OK = "critical", "remark", "ok"


@dataclass
class Check:
    name: str
    level: str
    message: str
    penalty: int = 0


@dataclass
class ReviewResult:
    checks: list[Check] = field(default_factory=list)
    photo_score: int | None = None
    needs_master_check: bool = False

    def add(self, name: str, level: str, message: str, penalty: int = 0) -> None:
        self.checks.append(Check(name, level, message, penalty))


def _fmt_minutes(m: float) -> str:
    h, mm = divmod(int(round(m)), 60)
    return f"{h} ч {mm} мин" if h else f"{mm} мин"


_STOP = {"и", "в", "на", "с", "по", "не", "для", "от", "до", "из", "за", "к", "о", "у", "а", "но"}


def _stems(text: str) -> set[str]:
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    return {w[:5] for w in words if len(w) > 3 and w not in _STOP}


def check_completeness(o: WorkOrder, r: ReviewResult) -> None:
    has_after = any(p.kind == "after" for p in o.photos)
    if not o.work_done or len(o.work_done.strip()) < 5:
        r.add("completeness", CRITICAL, "Не описаны выполненные работы", 35)
    if not o.fault_code_id:
        r.add("completeness", CRITICAL, "Не указан шифр неисправности", 20)
    if o.work_type == WorkType.unplanned and not has_after:
        r.add("completeness", CRITICAL, "Нет фото «после» — обязательно для внеплановых работ", 35)
    elif not has_after:
        r.add("completeness", REMARK, "Нет фото «после»", 5)
    if not o.materials:
        r.add("completeness", REMARK, "Не указаны списанные материалы (если не использовались — укажите в комментарии)", 3)
    if not any(c.name == "completeness" for c in r.checks):
        r.add("completeness", OK, "Все обязательные поля закрытия заполнены")


from .ai_nlp import evaluate_work_relevance


def check_relevance(o: WorkOrder, r: ReviewResult) -> None:
    """Интеллектуальная проверка соответствия работ проблеме и шифру (автономный ИИ)."""
    if not o.work_done:
        return
    fault_name = o.fault_code.name if o.fault_code else ""
    ok, message, penalty = evaluate_work_relevance(o.description, o.work_done, fault_name)
    if ok:
        r.add("relevance", OK, message)
    else:
        r.add("relevance", REMARK, message, penalty)


def check_materials(db: Session, o: WorkOrder, r: ReviewResult) -> None:
    if not o.materials or not o.fault_code_id:
        return
    norms = {n.material_id: n.typical_qty for n in db.scalars(
        select(MaterialNorm).where(MaterialNorm.fault_code_id == o.fault_code_id))}
    problems = False
    fc_code = o.fault_code.code if o.fault_code else "не указан"
    for m in o.materials:
        typical = norms.get(m.material_id)
        name = m.material.name if m.material else f"Материал #{m.material_id}"
        unit = m.material.unit if m.material else "ед."
        if typical is None:
            problems = True
            r.add("materials", REMARK,
                  f"«{name}» нетипичен для шифра {fc_code}", 8)
        elif m.qty > typical * 2:
            problems = True
            r.add("materials", CRITICAL,
                  f"«{name}»: списано {m.qty:g} {unit} при обычном расходе "
                  f"{typical:g} — завышение в {m.qty / typical:.1f} раза", 25)
        elif m.qty > typical * 1.5:
            problems = True
            r.add("materials", REMARK,
                  f"«{name}»: списано {m.qty:g} {unit} при обычном расходе {typical:g}", 8)
    if not problems:
        r.add("materials", OK, "Материалы соответствуют шифру и обычному расходу")


def check_time(o: WorkOrder, r: ReviewResult) -> None:
    minutes = work_minutes(o)
    if o.done_at and o.done_at > o.deadline:
        late = (o.done_at - o.deadline).total_seconds() / 60
        r.add("time", REMARK, f"Выполнено с просрочкой на {_fmt_minutes(late)}", min(20, 5 + int(late // 30) * 3))
    if minutes is None or not o.fault_code:
        return
    norm = o.fault_code.norm_hours * 60
    if minutes > norm * 1.5:
        r.add("time", REMARK, f"Время работы {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(norm)}", 8)
    elif minutes < norm * 0.15 and o.work_type == WorkType.unplanned:
        r.add("time", REMARK, f"Подозрительно быстро: {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(norm)}", 5)
    elif not (o.done_at and o.done_at > o.deadline):
        r.add("time", OK, f"Время {_fmt_minutes(minutes)} в пределах норматива {_fmt_minutes(norm)}")


def check_photos(db: Session, o: WorkOrder, r: ReviewResult) -> None:
    """Базовая проверка фото (6.3 п.1): свежее, не повтор старого, отличается от «до»."""
    after = [p for p in o.photos if p.kind == "after"]
    before = [p for p in o.photos if p.kind == "before"]
    if not after:
        return
    issues = False
    other_hashes = db.execute(
        select(Photo.phash, Photo.order_id).where(Photo.order_id != o.id, Photo.phash.is_not(None))
    ).all()
    has_dup = False
    has_early = False
    has_identical = False

    for p in after:
        if not p.phash:
            continue
        dup = next((oid for h, oid in other_hashes if hamming(h, p.phash) <= 4), None)
        if dup:
            issues = True
            has_dup = True
            r.add("photo", CRITICAL, "Фото «после» повторяет ранее загруженное фото другого наряда", 35)
        if p.taken_at and o.started_at and p.taken_at < o.started_at.replace(microsecond=0) and \
                (o.started_at - p.taken_at).total_seconds() > 3600:
            issues = True
            has_early = True
            r.add("photo", REMARK, "Фото «после» сделано до начала работ (по метаданным)", 15)
        for b in before:
            if b.phash and hamming(b.phash, p.phash) <= 3:
                issues = True
                has_identical = True
                r.add("photo", REMARK, "Фото «после» практически совпадает с фото «до» — устранение не видно", 15)
                r.needs_master_check = True

    if has_dup:
        r.photo_score = 1
    elif has_early:
        r.photo_score = 2
    elif has_identical:
        r.photo_score = 3
    elif not issues:
        r.add("photo", OK, "Фото «после» свежее и не повторяет старые снимки")
        r.photo_score = 5 if before else 4
    else:
        r.photo_score = 3


def build_reports(o: WorkOrder, r: ReviewResult) -> tuple[Verdict, int, str, str]:
    score = max(0, 100 - sum(c.penalty for c in r.checks))
    has_critical = any(c.level == CRITICAL for c in r.checks)
    has_remarks = any(c.level == REMARK for c in r.checks)
    if has_critical:
        verdict = Verdict.needs_rework
        score = min(score, 59)
    elif has_remarks:
        verdict = Verdict.accepted_with_remarks
    else:
        verdict = Verdict.accepted

    bad = [c.message for c in r.checks if c.level in (CRITICAL, REMARK)]
    good = [c.message for c in r.checks if c.level == OK]
    head = {
        Verdict.accepted: "Наряд выполнен полностью и в срок.",
        Verdict.accepted_with_remarks: "Наряд принят с замечаниями.",
        Verdict.needs_rework: "Наряд требует доработки.",
    }[verdict]
    explanation = head + (" Замечания: " + "; ".join(bad) + "." if bad else "")

    minutes = work_minutes(o)
    time_line = ""
    if minutes is not None and o.fault_code:
        time_line = f"\nВремя: {_fmt_minutes(minutes)} при нормативе {_fmt_minutes(o.fault_code.norm_hours * 60)}."
    worker_report = (
        f"Оценка: {score}/100 — {head}\n"
        + ("Хорошо: " + "; ".join(good) + ".\n" if good else "")
        + ("Улучшить: " + "; ".join(bad) + "." if bad else "Замечаний нет.")
        + time_line
    )
    return verdict, score, explanation, worker_report


def review_order(db: Session, o: WorkOrder) -> AIAssessment:
    r = ReviewResult()
    check_completeness(o, r)
    check_relevance(o, r)
    check_materials(db, o, r)
    check_time(o, r)
    check_photos(db, o, r)
    verdict, score, explanation, worker_report = build_reports(o, r)
    a = AIAssessment(
        order_id=o.id, verdict=verdict, score=score, photo_score=r.photo_score,
        explanation=explanation, worker_report=worker_report,
        needs_master_check=r.needs_master_check,
        details={"checks": [c.__dict__ for c in r.checks], "engine": "rules-v1"},
    )
    db.add(a)
    db.flush()
    db.refresh(o, ["assessments"])
    return a
