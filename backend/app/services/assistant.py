"""Автономный ИИ-ассистент мастера смены (раздел 6.7 кейса, Бонус).

Работает полностью автономно (on-premise, zero-cost, без платных облачных API).
Анализирует текст запроса мастера (включая распознанный голосовой ввод),
определяет намерение (intent), извлекает контекст (специальность, участок, оборудование, сроки)
и генерирует точный оперативный ответ со ссылками на живые данные смены.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Employee, Equipment, Priority, Role, Section, Status, WorkOrder
from ..serializers import is_overdue, short_name
from . import reports
from .analytics import detect_anomalies
from .workers import live_statuses


def _extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    return {w[:5] for w in words if len(w) >= 3}


def ask_assistant(db: Session, query: str) -> dict[str, Any]:
    """Обрабатывает вопрос мастера и возвращает развёрнутый ответ с рекомендациями."""
    q = (query or "").strip().lower()
    stems = _extract_keywords(q)

    # 1. Запрос: Кто свободен? (по специальностям или общий)
    if any(k in q for k in ["свобод", "кто сейчас", "есть кто", "найди слесар", "найди электрик", "доступн"]):
        spec_match = None
        if any(k in q for k in ["электрик", "электро"]):
            spec_match = "Электрик"
        elif any(k in q for k in ["слесар"]):
            spec_match = "Слесарь"
        elif any(k in q for k in ["сварщ"]):
            spec_match = "Сварщик"

        statuses = live_statuses(db)
        workers_q = select(Employee).where(Employee.role == Role.worker, Employee.on_shift.is_(True))
        if spec_match:
            workers_q = workers_q.where(Employee.specialty == spec_match)
        workers = db.scalars(workers_q).all()

        free_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "free"]
        queue_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "queue"]

        spec_label = f"из специальности «{spec_match}»" if spec_match else "среди всех специальностей"
        if free_list:
            names = ", ".join(f"{short_name(w.full_name)} ({w.specialty}, {w.grade} разряд)" for w in free_list)
            answer = f"🟢 Сейчас свободны на смене {len(free_list)} чел. {spec_label}: {names}."
        elif queue_list:
            names = ", ".join(f"{short_name(w.full_name)} (в очереди {statuses[w.id]['queue_count']})" for w in queue_list)
            answer = f"🟡 Полностью свободных нет, но в очереди ожидают: {names}. Можно назначить с постановкой в очередь."
        else:
            answer = f"🔴 Все исполнители {spec_label} сейчас заняты выполнением нарядов либо не на смене."

        return {
            "intent": "free_workers",
            "query": query,
            "answer": answer,
            "data": [
                {"id": w.id, "name": short_name(w.full_name), "specialty": w.specialty, "grade": w.grade,
                 "status": statuses.get(w.id, {}).get("label", "Свободен")}
                for w in (free_list + queue_list)
            ],
            "suggestions": [
                "Что просрочено на смене?",
                "Сводка по смене",
                "Топ проблемного оборудования",
            ],
        }

    # 2. Запрос: Что просрочено? (контроль сроков и эскалации)
    if any(k in q for k in ["просроч", "горит", "не успева", "опозда"]):
        now = datetime.now()
        tracked_statuses = [Status.issued, Status.queued, Status.accepted, Status.in_progress, Status.paused, Status.rework]
        active_orders = db.scalars(select(WorkOrder).where(WorkOrder.status.in_(tracked_statuses))).all()
        overdue = [o for o in active_orders if is_overdue(o, now)]

        if not overdue:
            answer = "✅ На текущей смене просроченных нарядов нет. Все работы укладываются в регламентные сроки."
        else:
            items = []
            for o in overdue:
                mins = round((now - o.deadline).total_seconds() / 60)
                worker_s = short_name(o.assignee.full_name) if o.assignee else "не назначен"
                items.append(f"Наряд №{o.number} ({o.equipment.name if o.equipment else '—'}) — просрочен на {mins} мин (исп. {worker_s})")
            answer = f"⚠️ Внимание! На смене зафиксировано {len(overdue)} просроченных нарядов:\n" + "\n".join(f"• {it}" for it in items)

        return {
            "intent": "overdue_orders",
            "query": query,
            "answer": answer,
            "data": [{"id": o.id, "number": o.number, "equipment": o.equipment.name if o.equipment else "—",
                      "assignee": short_name(o.assignee.full_name) if o.assignee else "—"} for o in overdue],
            "suggestions": [
                "Кто сейчас свободен из слесарей?",
                "Сводка по смене",
                "Покажи аномалии за 3 месяца",
            ],
        }

    # 3. Запрос: Отчёт / сводка по участку
    sections = db.scalars(select(Section)).all()
    matched_sec = None
    for s in sections:
        sec_stems = _extract_keywords(s.name)
        if (stems & sec_stems) or any(w in q for w in s.name.lower().split()):
            matched_sec = s
            break

    if matched_sec and any(k in q for k in ["отчет", "сводк", "участ", "обогащен", "дроблен", "сушк", "рмц", "покажи"]):
        now = datetime.now()
        month_ago = now - timedelta(days=30)
        sec_orders = db.scalars(
            select(WorkOrder).where(WorkOrder.section_id == matched_sec.id, WorkOrder.created_at >= month_ago)
        ).all()
        unplanned = sum(1 for o in sec_orders if o.work_type == "unplanned")
        planned = sum(1 for o in sec_orders if o.work_type == "planned")
        overdue_cnt = sum(1 for o in sec_orders if is_overdue(o, now))

        answer = (
            f"📊 Аналитическая сводка по участку «{matched_sec.name}» за 30 дней:\n"
            f"• Всего нарядов: {len(sec_orders)} (аварийных: {unplanned}, плановых ППР: {planned}).\n"
            f"• Просрочек исполнения: {overdue_cnt}.\n"
            f"• Рекомендация ИИ: проверить периодичность смазки и центровки конвейерных линий участка."
        )

        return {
            "intent": "section_summary",
            "query": query,
            "answer": answer,
            "data": {"section_id": matched_sec.id, "total": len(sec_orders), "unplanned": unplanned, "planned": planned},
            "suggestions": [
                "Кто сейчас свободен из электриков?",
                "Что просрочено на смене?",
                "Топ проблемного оборудования",
            ],
        }

    # 4. Запрос: Топ проблемного оборудования и закономерности
    if any(k in q for k in ["проблем", "поломк", "часто", "топ", "аномал", "отказ"]):
        anom = detect_anomalies(db, days=90)
        top10 = anom.get("top_problematic", [])
        insights = anom.get("insights", [])

        if top10:
            top_eq = top10[0]
            lines = [f"{i+1}. {e['name']} ({e['section']}) — {e['unplanned_count']} поломок, простой {e['downtime_hours']} ч"
                     for i, e in enumerate(top10[:3])]
            answer = (
                f"🚨 Топ проблемных агрегатов за 90 дней:\n" + "\n".join(lines) + "\n\n"
                f"💡 Главный вывод ИИ: «{top_eq['name']}» отказывает в {top_eq['ratio_to_avg']} раза чаще нормы. "
                f"Рекомендована внеочередная ревизия."
            )
        else:
            answer = "Накопленных данных недостаточно для выявления аномалий оборудования."

        return {
            "intent": "equipment_anomalies",
            "query": query,
            "answer": answer,
            "data": top10[:5],
            "suggestions": [
                "Кто свободен из слесарей?",
                "Сводка по смене",
                "Что просрочено на смене?",
            ],
        }

    # 5. По умолчанию: Сводка текущей смены (раздел 5.2 п.4)
    start, end, shift_name = reports.current_shift()
    rep = reports.shift_report(db, start, end)
    shift_label = "☀️ Дневная" if shift_name == "day" else "🌙 Ночная"
    answer = (
        f"📋 Сводка текущей смены ({shift_label}):\n"
        f"• Выдано нарядов: {rep['issued']} | Выполнено: {rep['done']} | В работе: {rep['issued'] - rep['done']}\n"
        f"• Просрочено: {rep['overdue']} | Отклонено: {rep['rejected']}\n"
        f"• Суммарный простой оборудования: {rep['downtime_hours']} ч.\n"
        f"• {rep['summary']}"
    )

    return {
        "intent": "general_shift_summary",
        "query": query,
        "answer": answer,
        "data": rep,
        "suggestions": [
            "Кто сейчас свободен из электриков?",
            "Что просрочено на смене?",
            "Покажи проблемы участка обогащения",
            "Топ проблемного оборудования",
        ],
    }
