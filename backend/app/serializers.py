"""Преобразование ORM-объектов в JSON для API и подписи на русском."""
from datetime import datetime

from .models import (
    AIAssessment,
    Employee,
    Equipment,
    Photo,
    Status,
    WorkOrder,
    WorkOrderEvent,
)

STATUS_LABELS = {
    Status.issued: "Выдан",
    Status.queued: "В очереди",
    Status.accepted: "Принят",
    Status.rejected: "Отклонён",
    Status.in_progress: "В работе",
    Status.paused: "Приостановлен",
    Status.done: "Исполнено",
    Status.ai_review: "Проверка ИИ",
    Status.rework: "На доработке",
    Status.closed: "Закрыт",
    Status.cancelled: "Отменён",
}

PRIORITY_LABELS = {
    "emergency": "Аварийный",
    "high": "Высокий",
    "normal": "Обычный",
    "planned": "Плановый",
}

VERDICT_LABELS = {
    "accepted": "Принято",
    "accepted_with_remarks": "Принято с замечаниями",
    "needs_rework": "Требует доработки",
}

ACTION_LABELS = {
    "issued": "Наряд выдан",
    "accept": "Принят в работу",
    "queue": "Поставлен в очередь",
    "auto_accept": "Взят из очереди",
    "reject": "Отклонён",
    "start": "Начато исполнение",
    "pause": "Приостановлен",
    "resume": "Возобновлён",
    "complete": "Исполнено",
    "ai_review": "Проверка ИИ",
    "ai_verdict": "Вердикт ИИ",
    "approve": "Закрыт мастером",
    "return_rework": "Возвращён на доработку",
    "reassign": "Переназначен",
    "cancel": "Отменён",
    "change_priority": "Изменён приоритет",
    "master_score": "Мастер изменил оценку",
}


def short_name(full_name: str) -> str:
    """«Ахметов Ерлан Серикович» → «Ахметов Е.»"""
    parts = full_name.split()
    return f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else full_name


def employee_brief(e: Employee | None) -> dict | None:
    if not e:
        return None
    return {"id": e.id, "full_name": e.full_name, "short_name": short_name(e.full_name),
            "specialty": e.specialty}


def employee_out(e: Employee) -> dict:
    return {
        "id": e.id, "full_name": e.full_name, "short_name": short_name(e.full_name),
        "specialty": e.specialty, "grade": e.grade, "role": e.role, "shift": e.shift,
        "on_shift": e.on_shift, "login": e.login,
        "brigade": {"id": e.brigade.id, "name": e.brigade.name} if e.brigade else None,
    }


def equipment_out(eq: Equipment) -> dict:
    return {"id": eq.id, "name": eq.name, "inv_no": eq.inv_no, "type": eq.type,
            "criticality": eq.criticality, "section_id": eq.section_id,
            "section": eq.section.name if eq.section else None,
            "qr_code": eq.qr_code}


def photo_out(p: Photo) -> dict:
    return {"id": p.id, "kind": p.kind, "url": f"/media/{p.file_path}",
            "taken_at": p.taken_at, "uploaded_at": p.uploaded_at, "author_id": p.author_id}


def event_out(ev: WorkOrderEvent) -> dict:
    return {
        "id": ev.id, "action": ev.action, "action_label": ACTION_LABELS.get(ev.action, ev.action),
        "from_status": ev.from_status, "to_status": ev.to_status,
        "comment": ev.comment, "reason": ev.reason, "created_at": ev.created_at,
        "actor": employee_brief(ev.actor) if ev.actor else {"id": None, "short_name": "ИИ / система"},
    }


def assessment_out(a: AIAssessment | None) -> dict | None:
    if not a:
        return None
    return {
        "id": a.id, "verdict": a.verdict, "verdict_label": VERDICT_LABELS.get(a.verdict, a.verdict),
        "score": a.score, "final_score": a.final_score, "photo_score": a.photo_score,
        "explanation": a.explanation, "worker_report": a.worker_report, "details": a.details,
        "needs_master_check": a.needs_master_check, "master_score": a.master_score,
        "master_comment": a.master_comment, "created_at": a.created_at,
    }


def is_overdue(o: WorkOrder, at: datetime | None = None) -> bool:
    at = at or datetime.now()
    if o.status in (Status.closed, Status.cancelled):
        return bool(o.done_at and o.done_at > o.deadline)
    if o.status in (Status.done, Status.ai_review):
        return bool(o.done_at and o.done_at > o.deadline)
    return at > o.deadline


def work_minutes(o: WorkOrder) -> float | None:
    """Чистое время работы: от начала до «Исполнено» минус паузы."""
    if not o.started_at or not o.done_at:
        return None
    return max(0.0, (o.done_at - o.started_at).total_seconds() / 60 - (o.paused_minutes or 0))


def order_brief(o: WorkOrder) -> dict:
    now = datetime.now()
    overdue = is_overdue(o, now)
    sec_data = {"id": o.section.id, "name": o.section.name} if o.section else {"id": 0, "name": "Не указан"}
    eq_data = {"id": o.equipment.id, "name": o.equipment.name, "inv_no": o.equipment.inv_no} if o.equipment else {"id": 0, "name": "Не указано", "inv_no": "—"}
    return {
        "id": o.id, "number": o.number, "work_type": o.work_type, "priority": o.priority,
        "priority_label": PRIORITY_LABELS.get(o.priority, str(o.priority)),
        "status": o.status, "status_label": STATUS_LABELS.get(o.status, str(o.status)),
        "description": o.description,
        "section": sec_data,
        "equipment": eq_data,
        "assignee": employee_brief(o.assignee),
        "master": employee_brief(o.master),
        "deadline": o.deadline, "created_at": o.created_at,
        "started_at": o.started_at, "done_at": o.done_at, "closed_at": o.closed_at,
        "overdue": overdue,
        "overdue_minutes": round((now - o.deadline).total_seconds() / 60) if overdue and o.status
        not in (Status.closed, Status.cancelled, Status.done, Status.ai_review) else 0,
        "has_photo_before": any(p.kind == "before" for p in o.photos),
        "score": o.assessment.final_score if o.assessment else None,
        "verdict": o.assessment.verdict if o.assessment else None,
    }


def order_full(o: WorkOrder) -> dict:
    data = order_brief(o)
    data.update({
        "comment": o.comment,
        "work_done": o.work_done,
        "close_comment": o.close_comment,
        "fault_code": ({"id": o.fault_code.id, "code": o.fault_code.code, "name": o.fault_code.name,
                        "norm_hours": o.fault_code.norm_hours} if o.fault_code else None),
        "materials": [{"id": m.id, "material_id": m.material_id,
                       "name": m.material.name if m.material else f"Материал #{m.material_id}",
                       "unit": m.material.unit if m.material else "ед.",
                       "qty": m.qty} for m in (o.materials or [])],
        "photos": [photo_out(p) for p in o.photos],
        "events": [event_out(e) for e in o.events],
        "assessment": assessment_out(o.assessment),
        "accepted_at": o.accepted_at, "queued_at": o.queued_at,
        "work_minutes": work_minutes(o),
        "paused_minutes": o.paused_minutes,
        "downtime_minutes": downtime_minutes(o),
    })
    return data


def downtime_minutes(o: WorkOrder) -> float | None:
    """Простой оборудования по внеплановому наряду: от выдачи до «Исполнено» (или до текущего момента)."""
    if o.work_type != "unplanned":
        return None
    end = o.done_at or (None if o.status in (Status.cancelled,) else datetime.now())
    if not end:
        return None
    return round((end - o.created_at).total_seconds() / 60)
