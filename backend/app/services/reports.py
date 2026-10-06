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
    Brigade,
    Employee,
    Equipment,
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
    # Исключаем агрегаты с конструктивно обусловленной аварийностью (Конвейер К-3),
    # чтобы не наказывать добросовестных слесарей за дефекты оборудования
    k3_id = db.scalar(select(Equipment.id).where(Equipment.name == "Конвейер К-3"))
    closed = [o for o in orders if o.done_at and o.fault_code_id and (k3_id is None or o.equipment_id != k3_id)]
    if not closed:
        return set()
    lo = min(o.done_at for o in closed)
    later = db.execute(
        select(WorkOrder.equipment_id, WorkOrder.fault_code_id, WorkOrder.created_at)
        .where(WorkOrder.work_type == "unplanned", WorkOrder.created_at >= lo,
               WorkOrder.fault_code_id.is_not(None),
               WorkOrder.equipment_id != k3_id if k3_id else True)
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

    reaction_times = [(o.started_at - o.created_at).total_seconds() / 60
                      for o in orders if o.started_at and o.created_at and o.started_at > o.created_at]
    avg_reaction_min = round(sum(reaction_times) / len(reaction_times), 1) if reaction_times else 0.0

    mttr_times = [(o.done_at - o.started_at).total_seconds() / 3600
                  for o in orders if o.done_at and o.started_at and o.done_at > o.started_at]
    avg_mttr_hours = round(sum(mttr_times) / len(mttr_times), 2) if mttr_times else 0.0

    ftfr = round(sum(1 for o in closed if not any(e.action in ('rework', 'return_rework') for e in o.events)) / len(closed) * 100, 1) if closed else 100.0

    return {
        "period": {"start": start, "end": end},
        "issued": issued, "done": len(done), "closed": len(closed),
        "overdue": len(overdue), "rejected": rejected,
        "downtime_hours": round(downtime / 60, 1),
        "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
        "avg_reaction_min": avg_reaction_min,
        "avg_mttr_hours": avg_mttr_hours,
        "first_time_fix_rate": ftfr,
        "load": sorted([{"worker_id": k, "name": names.get(k, "?"), **v,
                         "minutes": round(v["minutes"])} for k, v in load.items()],
                       key=lambda x: -x["orders"]),
        "overdue_orders": [{"id": o.id, "number": o.number,
                            "equipment": o.equipment.name if o.equipment else "—",
                            "assignee": short_name(o.assignee.full_name) if o.assignee else None}
                           for o in overdue],
        "summary": summary,
    }


def compute_brigade_rating(db: Session, start: datetime, end: datetime) -> list[dict]:
    """Рейтинг производственных бригад (раздел 6.6 и 7 ТЗ)."""
    orders = _period_orders(db, start, end)
    brigades = db.scalars(select(Brigade)).all()
    worker_ratings = {r["id"]: r for r in compute_rating(db, start, end)}

    res = []
    for br in brigades:
        workers = db.scalars(select(Employee).where(Employee.brigade_id == br.id, Employee.role == Role.worker)).all()
        w_ids = {w.id for w in workers}
        br_orders = [o for o in orders if o.assignee_id in w_ids or o.brigade_id == br.id]
        closed = [o for o in br_orders if o.status == Status.closed]

        # Средний рейтинг рабочих бригады
        scores = [worker_ratings[w.id]["rating"] for w in workers if w.id in worker_ratings]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Доля закрытых в срок
        on_time = sum(1 for o in closed if o.done_at and o.deadline and o.done_at <= o.deadline)
        on_time_pct = round(on_time / len(closed) * 100, 1) if closed else 100.0

        # Количество возвратов на доработку
        reworks = sum(1 for o in br_orders if any(e.action in ("rework", "return_rework") for e in o.events))

        res.append({
            "id": br.id,
            "name": br.name,
            "workers_count": len(workers),
            "orders_closed": len(closed),
            "score": avg_score,
            "on_time_percent": on_time_pct,
            "rework_count": reworks,
            "explanation": f"Средний балл рабочих: {avg_score}. Нарядов в срок: {on_time_pct}%.",
        })

    res.sort(key=lambda x: (x["score"], x["on_time_percent"]), reverse=True)
    for idx, item in enumerate(res, 1):
        item["place"] = idx
    return res
