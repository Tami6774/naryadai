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

import math
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
from ..i18n import T
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
                "title": T(f"Критическая аварийность: {eq.name}", f"Күрделі апаттылық: {eq.name}"),
                "text": T(
                    f"{eq.name} ({eq.section.name}): {cnt} внеплановых остановок за {days} дней "
                    f"(в {cnt / avg_unplanned:.1f} раза чаще среднего показателя по предприятию). "
                    f"{top_fault_cnt} из них — шифр {top_fault}{fc_desc}.",
                    f"{eq.name} ({eq.section.name}): {days} күнде {cnt} жоспардан тыс тоқтау "
                    f"(кәсіпорын бойынша орташа көрсеткіштен {cnt / avg_unplanned:.1f} есе жиі). "
                    f"Олардың {top_fault_cnt}-і — {top_fault} шифры{fc_desc}.",
                ),
                "recommendation": T(
                    f"Провести внеочередную вибродиагностику и проверку соосности привода {eq.name}. "
                    f"Включить ревизию подшипниковых узлов в ближайший план ППР.",
                    f"{eq.name} жетегіне кезектен тыс діріл диагностикасы мен центрлеуді тексеруді жүргізу. "
                    f"Мойынтірек тораптарының ревизиясын таяудағы ЖЕЖ жоспарына енгізу.",
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
                "title": T(f"Повторные отказы после ППР: {eq.name}", f"ЖЕЖ-ден кейінгі қайталанатын істен шығулар: {eq.name}"),
                "text": T(
                    f"По {eq.name} зафиксировано {len(fails)} внеплановых остановок в течение 2–5 дней "
                    f"после завершения планового ТО. Это указывает на скрытые дефекты сборки либо неполный объём регламентных работ.",
                    f"{eq.name} бойынша жоспарлы ТҚ аяқталғаннан кейін 2–5 күн ішінде {len(fails)} жоспардан тыс тоқтау тіркелді. "
                    f"Бұл құрастырудағы жасырын ақауларды немесе регламенттік жұмыстардың толық орындалмағанын көрсетеді.",
                ),
                "recommendation": T(
                    f"Усилить приёмку после ППР мастером смены: обязательный тест под нагрузкой "
                    f"не менее 2 часов с тепловизионным контролем.",
                    f"ЖЕЖ-ден кейін ауысым шеберінің қабылдауын күшейту: тепловизорлық бақылаумен "
                    f"кемінде 2 сағаттық жүктемемен міндетті сынақ.",
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
                    "title": T(f"Высокая доля повторных отказов: {short_name(worker.full_name)}", f"Қайталанатын істен шығулардың жоғары үлесі: {short_name(worker.full_name)}"),
                    "text": T(
                        f"У исполнителя {short_name(worker.full_name)} ({worker.specialty}, {worker.grade} разряд) "
                        f"{len(reps)} из {total_w} ремонтов ({len(reps) / total_w * 100:.0f}%) повлекли "
                        f"повторную поломку того же шифра на оборудовании в течение 7 дней.",
                        f"{short_name(worker.full_name)} орындаушысының ({worker.specialty}, {worker.grade} разряд) "
                        f"{total_w} жөндеуінің {len(reps)}-і ({len(reps) / total_w * 100:.0f}%) жабдықта "
                        f"7 күн ішінде сол шифрдағы қайталама бұзылуға әкелді.",
                    ),
                    "recommendation": T(
                        f"Направить сотрудника на наставничество к бригадиру смены, "
                        f"ввести обязательную инструментальную проверку его нарядов мастером.",
                        f"Қызметкерді ауысым бригадиріне тәлімгерлікке жіберу, "
                        f"оның нарядтарын шебердің аспаптық тексеруін міндетті ету.",
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
                "title": T(f"Ночной всплеск аварийности: {sec.name}", f"Түнгі апаттылық өсімі: {sec.name}"),
                "text": T(
                    f"На участке «{sec.name}» в ночные смены зафиксировано {counts['night']} аварийных нарядов "
                    f"против {counts['day']} в дневные (превышение в {counts['night'] / max(1, counts['day']):.1f} раза).",
                    f"«{sec.name}» бөлімшесінде түнгі ауысымдарда {counts['night']} апаттық наряд тіркелді, "
                    f"күндізгі ауысымдарда — {counts['day']} ({counts['night'] / max(1, counts['day']):.1f} есе артық).",
                ),
                "recommendation": T(
                    f"Проверить соблюдение регламентов технологической загрузки агрегатов в ночное время, "
                    f"усилить дежурную ремонтную смену электриком и слесарем.",
                    f"Түнде агрегаттарды технологиялық жүктеу регламенттерінің сақталуын тексеру, "
                    f"кезекші жөндеу ауысымын электрик пен слесарьмен күшейту.",
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
                    "title": T(f"Систематический перерасход материалов: {short_name(worker.full_name)}", f"Материалдардың жүйелі артық шығыны: {short_name(worker.full_name)}"),
                    "text": T(
                        f"Исполнитель {short_name(worker.full_name)} в {stat['over_count']} нарядах списал ТМЦ "
                        f"в среднем в {avg_over:.1f} раза выше нормы расхода по технологическим картам.",
                        f"{short_name(worker.full_name)} орындаушысы {stat['over_count']} нарядта ТМҚ-ны "
                        f"технологиялық карталар бойынша шығын нормасынан орта есеппен {avg_over:.1f} есе артық есептен шығарды.",
                    ),
                    "recommendation": T(
                        f"Провести инвентаризацию списания запчастей, сопоставить фактически установленные "
                        f"узлы с возвратным металлоломом на складе.",
                        f"Қосалқы бөлшектерді есептен шығаруға түгендеу жүргізу, нақты орнатылған "
                        f"тораптарды қоймадағы қайтарылған металл сынықтарымен салыстыру.",
                    ),
                })

    # ------------------------------------------------ 6. Прогноз вероятных отказов (бонус)
    forecast = forecast_failures(db)
    for f in [f for f in forecast if f["level"] == "high"][:2]:
        when = (T("в течение суток", "тәулік ішінде") if f["expected_in_days"] < 1
                else T(f"в среднем через {f['expected_in_days']:.0f} сут", f"орта есеппен {f['expected_in_days']:.0f} тәуліктен кейін"))
        insights.append({
            "type": "failure_forecast",
            "severity": "warning",
            "target": f["name"],
            "title": T(f"Прогноз отказа: {f['name']}", f"Істен шығу болжамы: {f['name']}"),
            "text": T(f"{f['explanation']} Следующая остановка ожидается {when}.", f"{f['explanation']} Келесі тоқтау {when} күтіледі."),
            "recommendation": f["recommendation"],
        })

    return {
        "period_days": days,
        "forecast": forecast,
        "total_orders": len(orders),
        "unplanned_orders": total_unplanned,
        "planned_orders": total_planned,
        "insights": insights,
        "top_problematic": top_problematic[:10],
    }


# ------------------------------------------------------------------ история оборудования (раздел 5.5)

def equipment_history(db: Session, equipment_id: int, days: int = 365) -> dict | None:
    """Полная история нарядов, ремонтов и простоев по единице оборудования."""
    from ..serializers import equipment_out, order_brief, work_minutes
    from ..models import ACTIVE_STATUSES

    eq = db.get(Equipment, equipment_id)
    if not eq:
        return None
    since = datetime.now() - timedelta(days=days)
    orders = db.scalars(
        select(WorkOrder).where(WorkOrder.equipment_id == equipment_id, WorkOrder.created_at >= since)
        .options(selectinload(WorkOrder.fault_code), selectinload(WorkOrder.photos),
                 selectinload(WorkOrder.assessments))
        .order_by(WorkOrder.created_at.desc())
    ).all()

    unplanned = sorted((o for o in orders if o.work_type == "unplanned"), key=lambda o: o.created_at)
    downtime = sum(downtime_minutes(o) or 0 for o in unplanned)
    repair = [m for m in (work_minutes(o) for o in orders) if m]
    intervals = [(b.created_at - a.created_at).total_seconds() / 86400 for a, b in zip(unplanned, unplanned[1:])]

    by_fault: dict[str, dict] = {}
    for o in orders:
        if o.fault_code:
            f = by_fault.setdefault(o.fault_code.code, {"code": o.fault_code.code, "name": o.fault_code.name,
                                                        "count": 0, "downtime_hours": 0.0})
            f["count"] += 1
            f["downtime_hours"] += (downtime_minutes(o) or 0) / 60

    return {
        "equipment": equipment_out(eq),
        "period_days": days,
        "summary": {
            "orders_total": len(orders),
            "unplanned": len(unplanned),
            "planned": len(orders) - len(unplanned),
            "open_orders": sum(1 for o in orders if o.status in ACTIVE_STATUSES),
            "downtime_hours": round(downtime / 60, 1),
            "mttr_hours": round(sum(repair) / len(repair) / 60, 1) if repair else None,
            "mtbf_days": round(sum(intervals) / len(intervals), 1) if intervals else None,
            "last_failure_at": unplanned[-1].created_at if unplanned else None,
        },
        "by_fault": sorted(({**f, "downtime_hours": round(f["downtime_hours"], 1)} for f in by_fault.values()),
                           key=lambda f: f["count"], reverse=True),
        "orders": [{**order_brief(o),
                    "fault_code": o.fault_code.code if o.fault_code else None,
                    "downtime_minutes": downtime_minutes(o),
                    "work_minutes": round(work_minutes(o)) if work_minutes(o) else None}
                   for o in orders[:200]],
    }


# ------------------------------------------------------------------ отчёт по простоям (раздел 7)

def downtime_report(db: Session, start: datetime, end: datetime, section_id: int | None = None) -> dict:
    """Время простоя по каждой единице, причины по шифрам, доля плановых и внеплановых."""
    from ..serializers import work_minutes

    q = (select(WorkOrder).where(WorkOrder.created_at >= start, WorkOrder.created_at < end)
         .options(selectinload(WorkOrder.equipment).selectinload(Equipment.section),
                  selectinload(WorkOrder.fault_code)))
    if section_id:
        q = q.where(WorkOrder.section_id == section_id)
    orders = db.scalars(q).all()

    by_eq: dict[int, dict] = {}
    by_fault: dict[str, dict] = {}
    for o in orders:
        if o.status == "cancelled":
            continue
        if o.work_type == "unplanned":
            minutes = downtime_minutes(o) or 0          # от выдачи до «Исполнено» (или до сейчас)
        else:
            minutes = work_minutes(o) or 0              # плановый ремонт: чистое время работ
        e = by_eq.setdefault(o.equipment_id, {
            "equipment_id": o.equipment_id, "name": o.equipment.name,
            "section": o.equipment.section.name if o.equipment.section else "—",
            "unplanned_hours": 0.0, "planned_hours": 0.0, "unplanned_count": 0, "planned_count": 0,
            "causes": {},
        })
        kind = "unplanned" if o.work_type == "unplanned" else "planned"
        e[f"{kind}_hours"] += minutes / 60
        e[f"{kind}_count"] += 1
        if o.work_type == "unplanned":
            code = o.fault_code.code if o.fault_code else T("без шифра", "шифрсыз")
            e["causes"][code] = e["causes"].get(code, 0) + minutes / 60
            f = by_fault.setdefault(code, {"code": code, "name": o.fault_code.name if o.fault_code else T("Шифр не указан", "Шифр көрсетілмеген"),
                                           "hours": 0.0, "count": 0})
            f["hours"] += minutes / 60
            f["count"] += 1

    items = []
    for e in by_eq.values():
        total = e["unplanned_hours"] + e["planned_hours"]
        top = sorted(e["causes"].items(), key=lambda kv: kv[1], reverse=True)[:3]
        items.append({
            **{k: v for k, v in e.items() if k != "causes"},
            "unplanned_hours": round(e["unplanned_hours"], 1),
            "planned_hours": round(e["planned_hours"], 1),
            "total_hours": round(total, 1),
            "unplanned_share": round(100 * e["unplanned_hours"] / total) if total else 0,
            "top_causes": [{"code": c, "hours": round(h, 1)} for c, h in top],
        })
    items.sort(key=lambda x: x["unplanned_hours"], reverse=True)

    unplanned_total = sum(i["unplanned_hours"] for i in items)
    planned_total = sum(i["planned_hours"] for i in items)
    total = unplanned_total + planned_total
    return {
        "period": {"start": start, "end": end},
        "totals": {
            "unplanned_hours": round(unplanned_total, 1),
            "planned_hours": round(planned_total, 1),
            "unplanned_share": round(100 * unplanned_total / total) if total else 0,
            "equipment_count": len(items),
        },
        "items": items,
        "by_fault": sorted(({**f, "hours": round(f["hours"], 1)} for f in by_fault.values()),
                           key=lambda f: f["hours"], reverse=True),
    }


# ------------------------------------------------------------------ прогноз отказов (раздел 6.5, бонус)

FORECAST_WINDOW_DAYS = 120
FORECAST_HORIZON_DAYS = 7


def forecast_failures(db: Session, limit: int = 10) -> list[dict]:
    """Прогноз вероятного отказа по росту внеплановых нарядов (раздел 6.5, бонус).

    Отказы единицы оборудования рассматриваются как пуассоновский поток. Интенсивность λ
    (отказов в сутки) — взвешенная: 60 % — последние 30 дней, 40 % — предыдущие 90, чтобы
    рост частоты сразу поднимал прогноз. Вероятность отказа за горизонт H суток:
        P = 1 − e^(−λ·H).
    Уровень риска — относительно парка: «высокий», если λ ≥ 1.8× среднего или частота
    растёт на ≥ 50 % быстрее, чем по парку в целом, при λ выше среднего (общий рост числа
    нарядов, например сезонный, не делает каждый агрегат «аномальным»).
    """
    now = datetime.now()
    since = now - timedelta(days=FORECAST_WINDOW_DAYS)
    recent_from = now - timedelta(days=30)
    rows = db.execute(
        select(WorkOrder.equipment_id, WorkOrder.created_at)
        .where(WorkOrder.work_type == "unplanned", WorkOrder.created_at >= since)
    ).all()
    by_eq: dict[int, list[datetime]] = defaultdict(list)
    for eq_id, ts in rows:
        by_eq[eq_id].append(ts)

    equipment_total = db.scalar(select(func.count(Equipment.id))) or 1
    fleet_rate = len(rows) / equipment_total / FORECAST_WINDOW_DAYS or 1e-6
    fleet_recent = sum(1 for _, ts in rows if ts >= recent_from) / 30
    fleet_base = sum(1 for _, ts in rows if ts < recent_from) / (FORECAST_WINDOW_DAYS - 30)
    fleet_growth = (fleet_recent - fleet_base) / fleet_base if fleet_base else 0.0
    equipment = {e.id: e for e in db.scalars(
        select(Equipment).where(Equipment.id.in_(list(by_eq))).options(selectinload(Equipment.section)))}

    out = []
    for eq_id, times in by_eq.items():
        if len(times) < 3:
            continue
        eq = equipment[eq_id]
        recent = sum(1 for t in times if t >= recent_from)
        base = len(times) - recent
        rate_recent = recent / 30
        rate_base = base / (FORECAST_WINDOW_DAYS - 30)
        rate = 0.6 * rate_recent + 0.4 * rate_base
        if rate <= 0:
            continue
        probability = 1 - math.exp(-rate * FORECAST_HORIZON_DAYS)
        ratio = rate / fleet_rate
        growth = (rate_recent - rate_base) / max(rate_base, 1 / (FORECAST_WINDOW_DAYS - 30))
        relative_growth = (1 + growth) / (1 + fleet_growth) - 1   # рост сверх общего по парку
        if ratio >= 1.8 or (relative_growth >= 0.5 and ratio >= 1):
            level = "high"
        elif ratio >= 1.2 or relative_growth >= 0.3:
            level = "medium"
        else:
            level = "low"
        days_since = (now - max(times)).total_seconds() / 86400
        trend = (T(f"частота растёт быстрее парка: +{growth * 100:.0f}% против +{fleet_growth * 100:.0f}% "
                   f"по парку (за 30 дн. — {recent}, ранее {rate_base * 30:.1f} в месяц)",
                   f"жиілік парктен жылдам өсуде: парк бойынша +{fleet_growth * 100:.0f}% қарсы +{growth * 100:.0f}% "
                   f"(30 күнде — {recent}, бұрын айына {rate_base * 30:.1f})") if relative_growth > 0.1
                 else T(f"частота меняется как по парку ({recent} за 30 дн.)",
                        f"жиілік парк бойынша өзгереді (30 күнде {recent})"))
        out.append({
            "equipment_id": eq_id,
            "name": eq.name,
            "section": eq.section.name if eq.section else "—",
            "failures": len(times),
            "failures_30d": recent,
            "rate_per_month": round(rate * 30, 1),
            "fleet_ratio": round(ratio, 1),
            "growth_pct": round(growth * 100),
            "relative_growth_pct": round(relative_growth * 100),
            "probability_7d": round(probability * 100),
            "risk": round(probability * 100),
            "expected_in_days": round(1 / rate, 1),
            "days_since_last": round(days_since, 1),
            "level": level,
            "explanation": T(f"Вероятность отказа в ближайшие {FORECAST_HORIZON_DAYS} дней — {probability * 100:.0f}%: "
                             f"{rate * 30:.1f} внеплановых остановок в месяц, в {ratio:.1f} раза чаще среднего по парку; "
                             f"{trend}.",
                             f"Таяу {FORECAST_HORIZON_DAYS} күнде істен шығу ықтималдығы — {probability * 100:.0f}%: "
                             f"айына {rate * 30:.1f} жоспардан тыс тоқтау, парк бойынша орташадан {ratio:.1f} есе жиі; "
                             f"{trend}."),
            "recommendation": (T("Включить в ближайший план ППР: диагностика узлов по частым шифрам отказов, "
                                 "подготовить запчасти заранее.",
                                 "Таяудағы ЖЕЖ жоспарына енгізу: істен шығудың жиі шифрлары бойынша тораптарды диагностикалау, "
                                 "қосалқы бөлшектерді алдын ала дайындау.") if level == "high"
                               else T("Усилить осмотры при обходах смены.", "Ауысымды аралағанда тексеруді күшейту.") if level == "medium"
                               else T("Обслуживание по графику ППР.", "ЖЕЖ кестесі бойынша қызмет көрсету.")),
        })
    rank = {"high": 0, "medium": 1, "low": 2}
    out.sort(key=lambda x: (rank[x["level"]], -x["probability_7d"]))
    return out[:limit]
