"""Рейтинг исполнителей (6.6) и отчёт за смену (раздел 7).

Формула (веса обосновываются на защите):
  Рейтинг = 0.35·Качество + 0.25·ВСрок + 0.20·(100 − Доработки/повторы)
          + 0.15·ОбъёмСложность + 0.05·(100 − Необоснованные отказы)
Все компоненты нормированы 0–100.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    Employee,
    Role,
    Status,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import downtime_minutes, employee_out, is_overdue, short_name
from .orders import VALID_REJECT_REASONS

WEIGHTS = {"quality": 0.35, "on_time": 0.25, "no_rework": 0.20, "volume": 0.15, "no_reject": 0.05}
WEIGHT_LABELS = {
    "quality": "Качество (средняя оценка ИИ/мастера)",
    "on_time": "Выполнено в срок",
    "no_rework": "Без доработок и повторных поломок за 7 дней",
    "volume": "Объём и сложность закрытых нарядов",
    "no_reject": "Без необоснованных отказов",
}
FINISHED = {Status.done, Status.ai_review, Status.closed, Status.rework}


def _period_orders(db: Session, start: datetime, end: datetime) -> list[WorkOrder]:
    return db.scalars(
        select(WorkOrder).where(WorkOrder.created_at >= start, WorkOrder.created_at < end)
        .options(selectinload(WorkOrder.assessments), selectinload(WorkOrder.events),
                 selectinload(WorkOrder.fault_code))
    ).all()


def _repeat_failure_ids(db: Session, orders: list[WorkOrder]) -> set[int]:
    """Наряды, после которых в течение 7 дней на том же оборудовании была внеплановая поломка того же шифра."""
    closed = [o for o in orders if o.done_at and o.fault_code_id]
    if not closed:
        return set()
    lo = min(o.done_at for o in closed)
    later = db.execute(
        select(WorkOrder.equipment_id, WorkOrder.fault_code_id, WorkOrder.created_at)
        .where(WorkOrder.work_type == "unplanned", WorkOrder.created_at >= lo,
               WorkOrder.fault_code_id.is_not(None))
    ).all()
    idx = defaultdict(list)
    for eq, fc, ts in later:
        idx[(eq, fc)].append(ts)
    out = set()
    for o in closed:
        for ts in idx.get((o.equipment_id, o.fault_code_id), []):
            if o.done_at < ts <= o.done_at + timedelta(days=7):
                out.add(o.id)
                break
    return out


def compute_rating(db: Session, start: datetime, end: datetime,
                   brigade_id: int | None = None) -> list[dict]:
    orders = _period_orders(db, start, end)
    repeat_ids = _repeat_failure_ids(db, orders)
    workers = db.scalars(select(Employee).where(Employee.role == Role.worker)
                         .options(selectinload(Employee.brigade))).all()
    if brigade_id:
        workers = [w for w in workers if w.brigade_id == brigade_id]

    # отказы считаем по событиям (исполнитель мог отказаться, а наряд ушёл другому)
    rejects = db.execute(
        select(WorkOrderEvent.actor_id, WorkOrderEvent.reason)
        .where(WorkOrderEvent.action == "reject", WorkOrderEvent.created_at >= start,
               WorkOrderEvent.created_at < end)
    ).all()
    rej_total, rej_bad = defaultdict(int), defaultdict(int)
    for actor_id, reason in rejects:
        rej_total[actor_id] += 1
        if reason not in VALID_REJECT_REASONS:
            rej_bad[actor_id] += 1

    stats = {}
    for w in workers:
        mine = [o for o in orders if o.assignee_id == w.id and o.status in FINISHED]
        scored = [o.assessment.final_score for o in mine if o.assessment]
        on_time = [not is_overdue(o) for o in mine]
        reworked = [o for o in mine if any(e.action == "return_rework" for e in o.events)
                    or o.id in repeat_ids]
        volume = sum((o.fault_code.norm_hours if o.fault_code else 1.0) for o in mine)
        stats[w.id] = {
            "worker": w, "count": len(mine),
            "quality": sum(scored) / len(scored) if scored else 0,
            "on_time": 100 * sum(on_time) / len(on_time) if on_time else 0,
            "rework_share": 100 * len(reworked) / len(mine) if mine else 0,
            "repeat_count": sum(1 for o in mine if o.id in repeat_ids),
            "volume_raw": volume,
            "rejects": rej_total[w.id], "rejects_bad": rej_bad[w.id],
        }

    max_volume = max((s["volume_raw"] for s in stats.values()), default=0) or 1
    out = []
    for s in stats.values():
        handled = s["count"] + s["rejects"]
        comp = {
            "quality": s["quality"],
            "on_time": s["on_time"],
            "no_rework": 100 - s["rework_share"],
            "volume": 100 * s["volume_raw"] / max_volume,
            "no_reject": 100 - (100 * s["rejects_bad"] / handled if handled else 0),
        }
        total = sum(WEIGHTS[k] * v for k, v in comp.items()) if s["count"] else 0
        w = s["worker"]
        out.append({
            **employee_out(w),
            "rating": round(total, 1),
            "components": {k: round(v, 1) for k, v in comp.items()},
            "orders_closed": s["count"], "repeat_failures": s["repeat_count"],
            "rejects": s["rejects"], "rejects_unjustified": s["rejects_bad"],
            "explanation": _explain(w, comp, s) if s["count"] else "Нет закрытых нарядов за период",
        })
    out.sort(key=lambda r: r["rating"], reverse=True)
    for i, r in enumerate(out, 1):
        r["place"] = i
    return out


def _explain(w: Employee, comp: dict, s: dict) -> str:
    """Пояснение исполнителю, из чего сложился рейтинг (LLM-версия — на этапе ИИ)."""
    parts = [f"{WEIGHT_LABELS[k]}: {comp[k]:.0f} × {WEIGHTS[k]:.2f} = {comp[k] * WEIGHTS[k]:.1f}"
             for k in WEIGHTS]
    weakest = min(WEIGHTS, key=lambda k: comp[k])
    return (f"{short_name(w.full_name)}: закрыто {s['count']} нарядов. " + "; ".join(parts)
            + f". Главный резерв роста — «{WEIGHT_LABELS[weakest].lower()}».")


def shift_bounds(day: datetime, shift: str) -> tuple[datetime, datetime]:
    base = day.replace(hour=0, minute=0, second=0, microsecond=0)
    if shift == "night":
        return base + timedelta(hours=20), base + timedelta(days=1, hours=8)
    return base + timedelta(hours=8), base + timedelta(hours=20)


def current_shift() -> tuple[datetime, datetime, str]:
    now = datetime.now()
    if 8 <= now.hour < 20:
        s, e = shift_bounds(now, "day")
        return s, e, "day"
    day = now if now.hour >= 20 else now - timedelta(days=1)
    s, e = shift_bounds(day, "night")
    return s, e, "night"


def shift_report(db: Session, start: datetime, end: datetime) -> dict:
    orders = _period_orders(db, start, end)
    issued = len(orders)
    done = [o for o in orders if o.status in FINISHED]
    closed = [o for o in orders if o.status == Status.closed]
    overdue = [o for o in orders if is_overdue(o)]
    rejected = sum(1 for o in orders if any(e.action == "reject" for e in o.events))
    downtime = sum(downtime_minutes(o) or 0 for o in orders)
    scores = [o.assessment.final_score for o in done if o.assessment]

    load = defaultdict(lambda: {"orders": 0, "minutes": 0.0})
    names = {}
    for o in orders:
        if o.assignee_id:
            load[o.assignee_id]["orders"] += 1
            if o.started_at and o.done_at:
                load[o.assignee_id]["minutes"] += (o.done_at - o.started_at).total_seconds() / 60
    for e in db.scalars(select(Employee).where(Employee.id.in_(list(load)))):
        names[e.id] = short_name(e.full_name)

    by_equipment = defaultdict(int)
    for o in orders:
        if o.work_type == "unplanned" and o.equipment:
            by_equipment[o.equipment.name] += 1

    summary = (
        f"За смену выдано {issued} нарядов, выполнено {len(done)}, закрыто мастером {len(closed)}, "
        f"просрочено {len(overdue)}, отклонений {rejected}. "
        f"Средняя оценка качества — {sum(scores) / len(scores):.0f}/100. " if scores else
        f"За смену выдано {issued} нарядов, выполнено {len(done)}, просрочено {len(overdue)}. "
    )
    if by_equipment:
        top = max(by_equipment, key=by_equipment.get)
        if by_equipment[top] > 1:
            summary += f"Больше всего внеплановых нарядов — {top} ({by_equipment[top]}). "
    summary += f"Суммарный простой оборудования — {downtime / 60:.1f} ч."

    return {
        "period": {"start": start, "end": end},
        "issued": issued, "done": len(done), "closed": len(closed),
        "overdue": len(overdue), "rejected": rejected,
        "downtime_hours": round(downtime / 60, 1),
        "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
        "load": sorted([{"worker_id": k, "name": names.get(k, "?"), **v,
                         "minutes": round(v["minutes"])} for k, v in load.items()],
                       key=lambda x: -x["orders"]),
        "overdue_orders": [{"id": o.id, "number": o.number,
                            "equipment": o.equipment.name if o.equipment else "—",
                            "assignee": short_name(o.assignee.full_name) if o.assignee else None}
                           for o in overdue],
        "summary": summary,
    }
