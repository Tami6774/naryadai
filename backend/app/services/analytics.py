"""ИИ-аналитика истории и поиск аномалий (раздел 6.5 кейса).

Выявляет:
 1. Оборудование и участки с частыми поломками («узкие места»);
 2. Повторяющиеся неисправности одного шифра на одном оборудовании (ремонт не устраняет причину);
 3. Поломки, возникающие вскоре (2–5 дней) после планового ремонта (качество ППР);
 4. Связь поломок со сменами (день / ночь), участками, исполнителями;
 5. Аномальный расход материалов против норматива.

Каждый вывод формулируется простым техническим языком с конкретной рекомендацией.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..models import (
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    MaterialWriteOff,
    Role,
    Section,
    WorkOrder,
    WorkOrderEvent,
)
from ..serializers import downtime_minutes, short_name


def detect_anomalies(db: Session, days: int = 90) -> dict:
    since = datetime.now() - timedelta(days=days)
    orders = db.scalars(
        select(WorkOrder)
        .where(WorkOrder.created_at >= since)
        .options(
            selectinload(WorkOrder.equipment).selectinload(Equipment.section),
            selectinload(WorkOrder.fault_code),
            selectinload(WorkOrder.assignee),
            selectinload(WorkOrder.materials).selectinload(MaterialWriteOff.material),
            selectinload(WorkOrder.events),
        )
    ).all()

    insights = []
    total_unplanned = sum(1 for o in orders if o.work_type == "unplanned")
    total_planned = sum(1 for o in orders if o.work_type == "planned")
    equipment_count = db.scalar(select(func.count(Equipment.id))) or 1

    # ------------------------------------------------ 1. Топ проблемного оборудования и повторные поломки
    unplanned_by_eq = defaultdict(list)
    for o in orders:
        if o.work_type == "unplanned":
            unplanned_by_eq[o.equipment_id].append(o)

    avg_unplanned = total_unplanned / equipment_count if equipment_count else 0
    top_problematic = []

    for eq_id, eq_orders in unplanned_by_eq.items():
        eq = eq_orders[0].equipment
        cnt = len(eq_orders)
        fault_counts = defaultdict(int)
        for o in eq_orders:
            if o.fault_code:
                fault_counts[o.fault_code.code] += 1

        top_fault = max(fault_counts, key=fault_counts.get) if fault_counts else None
        top_fault_cnt = fault_counts[top_fault] if top_fault else 0
        total_downtime = sum(downtime_minutes(o) or 0 for o in eq_orders)

        top_problematic.append({
            "equipment_id": eq.id,
            "name": eq.name,
            "section": eq.section.name,
            "unplanned_count": cnt,
            "ratio_to_avg": round(cnt / avg_unplanned, 1) if avg_unplanned else 1.0,
            "top_fault": top_fault,
            "top_fault_count": top_fault_cnt,
            "downtime_hours": round(total_downtime / 60, 1),
        })

        # Закономерность 1: поломки чаще среднего в 2.5+ раз
        if cnt >= avg_unplanned * 2.5 and cnt >= 5:
            fc_obj = db.scalar(select(FaultCode).where(FaultCode.code == top_fault)) if top_fault else None
            fc_desc = f" ({fc_obj.name.lower()})" if fc_obj else ""
            insights.append({
                "type": "equipment_frequency",
                "severity": "critical",
                "target": eq.name,
                "title": f"Критическая аварийность: {eq.name}",
                "text": (
                    f"{eq.name} ({eq.section.name}): {cnt} внеплановых остановок за {days} дней "
                    f"(в {cnt / avg_unplanned:.1f} раза чаще среднего показателя по предприятию). "
                    f"{top_fault_cnt} из них — шифр {top_fault}{fc_desc}."
                ),
                "recommendation": (
                    f"Провести внеочередную вибродиагностику и проверку соосности привода {eq.name}. "
                    f"Включить ревизию подшипниковых узлов в ближайший план ППР."
                ),
            })

    top_problematic.sort(key=lambda x: x["unplanned_count"], reverse=True)

    # ------------------------------------------------ 2. Поломки вскоре после ППР (качество ТО)
    planned_orders = [o for o in orders if o.work_type == "planned" and o.done_at]
    critical_eq_ids = {p["equipment_id"] for p in top_problematic if p["unplanned_count"] >= avg_unplanned * 2.5 and p["unplanned_count"] >= 5}
    post_ppr_by_eq = defaultdict(list)
    for p in planned_orders:
        if p.equipment_id in critical_eq_ids:
            continue
        # Ищем первый внеплановый отказ на том же агрегате в течение 1.5–5 дней после ППР
        earliest = None
        for u in unplanned_by_eq.get(p.equipment_id, []):
            if p.done_at and u.created_at and u.created_at > p.done_at:
                delta_days = (u.created_at - p.done_at).total_seconds() / 86400
                if 1.5 <= delta_days <= 5.0:
                    if earliest is None or u.created_at < earliest[1].created_at:
                        earliest = (p, u, delta_days)
        if earliest:
            post_ppr_by_eq[p.equipment_id].append(earliest)

    sorted_ppr = sorted(post_ppr_by_eq.items(), key=lambda x: len(x[1]), reverse=True)
    # Выделяем агрегаты с систематическим браком после ТО (не более топ-2)
    for eq_id, fails in sorted_ppr[:2]:
        if len(fails) >= 4:
            eq = fails[0][0].equipment
            insights.append({
                "type": "post_ppr_quality",
                "severity": "warning",
                "target": eq.name,
                "title": f"Повторные отказы после ППР: {eq.name}",
                "text": (
                    f"По {eq.name} зафиксировано {len(fails)} внеплановых остановок в течение 2–5 дней "
                    f"после завершения планового ТО. Это указывает на скрытые дефекты сборки либо неполный объём регламентных работ."
                ),
                "recommendation": (
                    f"Усилить приёмку после ППР мастером смены: обязательный тест под нагрузкой "
                    f"не менее 2 часов с тепловизионным контролем."
                ),
            })

    # ------------------------------------------------ 3. Повторные поломки по исполнителям (в течение 7 дней)
    repeat_by_worker = defaultdict(list)
    worker_orders = defaultdict(list)
    for o in orders:
        if o.assignee_id and o.work_type == "unplanned" and o.done_at and o.fault_code_id:
            if o.equipment_id not in critical_eq_ids:
                worker_orders[o.assignee_id].append(o)

    for wid, w_orders in worker_orders.items():
        for i, o1 in enumerate(w_orders):
            for o2 in unplanned_by_eq.get(o1.equipment_id, []):
                if o1.id != o2.id and o1.fault_code_id == o2.fault_code_id and o1.done_at and o2.created_at:
                    d = (o2.created_at - o1.done_at).total_seconds() / 86400
                    if 0.1 <= d <= 7.0:
                        repeat_by_worker[wid].append((o1, o2))
                        break

    for wid, reps in repeat_by_worker.items():
        total_w = len(worker_orders[wid])
        if total_w >= 10 and (len(reps) / total_w) > 0.50:
            worker = db.get(Employee, wid)
            if worker:
                insights.append({
                    "type": "worker_repeat_rate",
                    "severity": "warning",
                    "target": worker.full_name,
                    "title": f"Высокая доля повторных отказов: {short_name(worker.full_name)}",
                    "text": (
                        f"У исполнителя {short_name(worker.full_name)} ({worker.specialty}, {worker.grade} разряд) "
                        f"{len(reps)} из {total_w} ремонтов ({len(reps) / total_w * 100:.0f}%) повлекли "
                        f"повторную поломку того же шифра на оборудовании в течение 7 дней."
                    ),
                    "recommendation": (
                        f"Направить сотрудника на наставничество к бригадиру смены, "
                        f"ввести обязательную инструментальную проверку его нарядов мастером."
                    ),
                })

    # ------------------------------------------------ 4. Аномалии сменности (День vs Ночь)
    shift_section_stats = defaultdict(lambda: {"day": 0, "night": 0})
    for o in orders:
        if o.work_type == "unplanned":
            sh = "day" if 8 <= o.created_at.hour < 20 else "night"
            shift_section_stats[o.section_id][sh] += 1

    for sec_id, counts in shift_section_stats.items():
        sec = db.get(Section, sec_id)
        if sec and counts["night"] > counts["day"] * 1.7 and counts["night"] >= 15:
            insights.append({
                "type": "shift_imbalance",
                "severity": "warning",
                "target": sec.name,
                "title": f"Ночной всплеск аварийности: {sec.name}",
                "text": (
                    f"На участке «{sec.name}» в ночные смены зафиксировано {counts['night']} аварийных нарядов "
                    f"против {counts['day']} в дневные (превышение в {counts['night'] / max(1, counts['day']):.1f} раза)."
                ),
                "recommendation": (
                    f"Проверить соблюдение регламентов технологической загрузки агрегатов в ночное время, "
                    f"усилить дежурную ремонтную смену электриком и слесарем."
                ),
            })

    # ------------------------------------------------ 5. Аномальный перерасход материалов
    norms = db.scalars(select(MaterialNorm)).all()
    norm_map = {(n.fault_code_id, n.material_id): n.typical_qty for n in norms}
    overuse_by_worker = defaultdict(lambda: {"total": 0, "over_count": 0, "ratio_sum": 0.0})

    for o in orders:
        if o.assignee_id and o.fault_code_id and o.materials:
            for m in o.materials:
                typ = norm_map.get((o.fault_code_id, m.material_id))
                if typ:
                    overuse_by_worker[o.assignee_id]["total"] += 1
                    ratio = m.qty / typ
                    if ratio >= 1.5:
                        overuse_by_worker[o.assignee_id]["over_count"] += 1
                        overuse_by_worker[o.assignee_id]["ratio_sum"] += ratio

    for wid, stat in overuse_by_worker.items():
        if stat["over_count"] >= 5 and (stat["over_count"] / stat["total"]) > 0.4:
            worker = db.get(Employee, wid)
            if worker:
                avg_over = stat["ratio_sum"] / stat["over_count"]
                insights.append({
                    "type": "material_overuse",
                    "severity": "info",
                    "target": worker.full_name,
                    "title": f"Систематический перерасход материалов: {short_name(worker.full_name)}",
                    "text": (
                        f"Исполнитель {short_name(worker.full_name)} в {stat['over_count']} нарядах списал ТМЦ "
                        f"в среднем в {avg_over:.1f} раза выше нормы расхода по технологическим картам."
                    ),
                    "recommendation": (
                        f"Провести инвентаризацию списания запчастей, сопоставить фактически установленные "
                        f"узлы с возвратным металлоломом на складе."
                    ),
                })

    return {
        "period_days": days,
        "total_orders": len(orders),
        "unplanned_orders": total_unplanned,
        "planned_orders": total_planned,
        "insights": insights,
        "top_problematic": top_problematic[:10],
    }
