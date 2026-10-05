"""Текущие статусы исполнителей и ИИ-подбор исполнителя (раздел 5.1 п.2–3)."""
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import AIAssessment, Employee, Equipment, Role, Status, WorkOrder
from ..serializers import employee_out

BUSY = {Status.in_progress, Status.paused}
QUEUE = {Status.issued, Status.queued, Status.accepted, Status.rework}

# Ключевые слова → специальность (простая эвристика; на этапе ИИ дополняется LLM)
SPECIALTY_KEYWORDS = {
    "Слесарь": ["течь", "масл", "подшипник", "редуктор", "насос", "лента", "ролик", "вибрац",
                "шум", "муфт", "вал", "износ", "болт", "уплотн", "гидравл", "смазк", "шестерн",
                "заклин", "футеровк", "натяж"],
    "Электрик": ["электр", "двигател", "кабел", "автомат", "пускател", "датчик", "напряжен",
                 "искр", "замыкан", "не запускается", "освещен", "щит", "обмотк", "кз", "фаз"],
    "Сварщик": ["свар", "трещин", "разрыв", "корпус", "рама", "металлоконструк", "прогар",
                "шов", "лопнул"],
}


def guess_specialty(text: str) -> str | None:
    t = text.lower()
    scores = {s: sum(1 for k in kws if k in t) for s, kws in SPECIALTY_KEYWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else None


def live_statuses(db: Session) -> dict[int, dict]:
    """Статус каждого исполнителя: free / busy / queue / off."""
    active = db.scalars(
        select(WorkOrder).where(WorkOrder.status.in_(list(BUSY | QUEUE)),
                                WorkOrder.assignee_id.is_not(None))
    ).all()
    by_worker: dict[int, list[WorkOrder]] = defaultdict(list)
    for o in active:
        by_worker[o.assignee_id].append(o)

    result = {}
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker)).all()
    for w in workers:
        orders = by_worker.get(w.id, [])
        current = next((o for o in orders if o.status in BUSY), None)
        queue = [o for o in orders if o.status in QUEUE]
        if not w.on_shift:
            state, label = "off", "Не на смене"
        elif current:
            state = "busy"
            label = f"Выполняет наряд №{current.number}" + (
                " (пауза)" if current.status == Status.paused else "")
            if queue:
                label += f", в очереди {len(queue)}"
        elif queue:
            state, label = "queue", f"В очереди {len(queue)} нарядов"
        else:
            state, label = "free", "Свободен"
        result[w.id] = {
            "state": state, "label": label,
            "current_order": {"id": current.id, "number": current.number} if current else None,
            "queue_count": len(queue),
        }
    return result


def workers_with_status(db: Session) -> list[dict]:
    statuses = live_statuses(db)
    workers = db.scalars(
        select(Employee).where(Employee.role == Role.worker)
        .options(selectinload(Employee.brigade)).order_by(Employee.full_name)
    ).all()
    order = {"free": 0, "queue": 1, "busy": 2, "off": 3}
    out = [{**employee_out(w), "live": statuses[w.id]} for w in workers]
    return sorted(out, key=lambda x: (order[x["live"]["state"]], x["full_name"]))


def suggest_assignees(db: Session, equipment_id: int, description: str,
                      exclude_ids: set[int] | None = None, limit: int = 3) -> list[dict]:
    """ИИ-подсказка: свободный + нужная специальность + лучший рейтинг по этому типу оборудования."""
    exclude_ids = exclude_ids or set()
    equipment = db.get(Equipment, equipment_id) if equipment_id else None
    need = guess_specialty(description or "")
    statuses = live_statuses(db)

    # средняя оценка каждого исполнителя по этому типу оборудования за 90 дней
    per: dict[int, list[int]] = defaultdict(list)
    if equipment:
        since = datetime.now() - timedelta(days=90)
        rows = db.execute(
            select(WorkOrder.assignee_id, AIAssessment.score, AIAssessment.master_score)
            .join(AIAssessment, AIAssessment.order_id == WorkOrder.id)
            .join(Equipment, Equipment.id == WorkOrder.equipment_id)
            .where(Equipment.type == equipment.type, WorkOrder.created_at >= since)
        ).all()
        for aid, s, ms in rows:
            per[aid].append(ms if ms is not None else s)

    candidates = []
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker,
                                                Employee.on_shift.is_(True))).all()
    for w in workers:
        if w.id in exclude_ids:
            continue
        st = statuses[w.id]
        scores = per.get(w.id, [])
        avg = sum(scores) / len(scores) if scores else 70.0
        score = 0.0
        reasons = []
        if st["state"] == "free":
            score += 50; reasons.append("свободен")
        elif st["state"] == "queue":
            score += 25 - 5 * st["queue_count"]; reasons.append(f"очередь {st['queue_count']}")
        else:
            score += 5; reasons.append("занят")
        if need and w.specialty == need:
            score += 30; reasons.append(f"специальность: {w.specialty.lower()}")
        elif need:
            score -= 20
        score += (avg - 70) * 0.5
        if scores and equipment:
            reasons.append(f"ср. оценка по «{equipment.type}»: {avg:.0f} ({len(scores)} нарядов)")
        candidates.append({
            **employee_out(w), "live": st, "match_score": round(score, 1),
            "reason": ", ".join(reasons),
        })
    candidates.sort(key=lambda c: c["match_score"], reverse=True)
    return candidates[:limit]
