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

from ..i18n import T
from ..models import Employee, Equipment, Priority, Role, Section, Status, WorkOrder
from ..serializers import is_overdue, short_name
from . import reports
from .analytics import detect_anomalies
from .workers import live_statuses


_SPEC_KZ = {"Слесарь": "Слесарь", "Электрик": "Электрик", "Сварщик": "Дәнекерлеуші"}
# Казахские названия участков → начало русского названия в БД (для разбора запросов на казахском)
_SECTION_KZ = {"ұсақтау": "Участок дробления", "байыту": "Обогатительная", "кептіру": "Участок сушки",
               "жөндеу": "Ремонтно-механический"}


def _spec(name: str) -> str:
    return T(name, _SPEC_KZ.get(name, name))


def _extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[а-яёa-z0-9]+", (text or "").lower())
    return {w[:5] for w in words if len(w) >= 3}


def ask_assistant(db: Session, query: str) -> dict[str, Any]:
    """Обрабатывает вопрос мастера и возвращает развёрнутый ответ с рекомендациями."""
    q = (query or "").strip().lower()
    stems = _extract_keywords(q)

    # 1. Запрос: Кто свободен? (по специальностям или общий)
    if any(k in q for k in ["свобод", "кто сейчас", "есть кто", "найди слесар", "найди электрик", "доступн",
                         "кім бос", "қазір кім", "бос тұр", "бос слесар", "бос электрик"]):
        spec_match = None
        if any(k in q for k in ["электрик", "электро"]):
            spec_match = "Электрик"
        elif any(k in q for k in ["слесар"]):
            spec_match = "Слесарь"
        elif any(k in q for k in ["сварщ", "дәнекерл"]):
            spec_match = "Сварщик"

        statuses = live_statuses(db)
        workers_q = select(Employee).where(Employee.role == Role.worker, Employee.on_shift.is_(True))
        if spec_match:
            workers_q = workers_q.where(Employee.specialty == spec_match)
        workers = db.scalars(workers_q).all()

        free_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "free"]
        queue_list = [w for w in workers if statuses.get(w.id, {}).get("state") == "queue"]

        spec_label = (T(f"из специальности «{spec_match}»", f"«{_spec(spec_match)}» мамандығы бойынша")
                      if spec_match else T("среди всех специальностей", "барлық мамандықтар бойынша"))
        if free_list:
            names = ", ".join(f"{short_name(w.full_name)} ({_spec(w.specialty)}, {w.grade} {T('разряд', 'разряд')})"
                              for w in free_list)
            answer = T(f"🟢 Сейчас свободны на смене {len(free_list)} чел. {spec_label}: {names}.",
                       f"🟢 Қазір ауысымда {spec_label} {len(free_list)} адам бос: {names}.")
        elif queue_list:
            names = ", ".join(f"{short_name(w.full_name)} ({T('в очереди', 'кезекте')} {statuses[w.id]['queue_count']})"
                              for w in queue_list)
            answer = T(f"🟡 Полностью свободных нет, но в очереди ожидают: {names}. Можно назначить с постановкой в очередь.",
                       f"🟡 Толық бос адам жоқ, бірақ кезекте күтіп тұрғандар: {names}. Кезекке қойып тағайындауға болады.")
        else:
            answer = T(f"🔴 Все исполнители {spec_label} сейчас заняты выполнением нарядов либо не на смене.",
                       f"🔴 {spec_label.capitalize()} барлық орындаушылар қазір нарядтарды орындаумен айналысып жатыр немесе ауысымда емес.")

        return {
            "intent": "free_workers",
            "query": query,
            "answer": answer,
            "data": [
                {"id": w.id, "name": short_name(w.full_name), "specialty": _spec(w.specialty), "grade": w.grade,
                 "status": statuses.get(w.id, {}).get("label", T("Свободен", "Бос"))}
                for w in (free_list + queue_list)
            ],
            "suggestions": [
                T("Что просрочено на смене?", "Ауысымда не мерзімінен өтті?"),
                T("Сводка по смене", "Ауысым қорытындысы"),
                T("Топ проблемного оборудования", "Мәселелі жабдықтың топ-тізімі"),
            ],
        }

    # 2. Запрос: Что просрочено? (контроль сроков и эскалации)
    if any(k in q for k in ["просроч", "горит", "не успева", "опозда", "мерзімінен өт", "мерзімі өт", "кешік"]):
        now = datetime.now()
        tracked_statuses = [Status.issued, Status.queued, Status.accepted, Status.in_progress, Status.paused, Status.rework]
        active_orders = db.scalars(select(WorkOrder).where(WorkOrder.status.in_(tracked_statuses))).all()
        overdue = [o for o in active_orders if is_overdue(o, now)]

        if not overdue:
            answer = T("✅ На текущей смене просроченных нарядов нет. Все работы укладываются в регламентные сроки.",
                       "✅ Ағымдағы ауысымда мерзімі өткен нарядтар жоқ. Барлық жұмыс регламенттік мерзімге сыяды.")
        else:
            items = []
            for o in overdue:
                mins = round((now - o.deadline).total_seconds() / 60)
                worker_s = short_name(o.assignee.full_name) if o.assignee else T("не назначен", "тағайындалмаған")
                eq_name = o.equipment.name if o.equipment else '—'
                items.append(T(f"Наряд №{o.number} ({eq_name}) — просрочен на {mins} мин (исп. {worker_s})",
                               f"№{o.number} наряд ({eq_name}) — мерзімі {mins} мин өтті (орынд. {worker_s})"))
            answer = (T(f"⚠️ Внимание! На смене зафиксировано {len(overdue)} просроченных нарядов:\n",
                        f"⚠️ Назар аударыңыз! Ауысымда мерзімі өткен {len(overdue)} наряд тіркелді:\n")
                      + "\n".join(f"• {it}" for it in items))

        return {
            "intent": "overdue_orders",
            "query": query,
            "answer": answer,
            "data": [{"id": o.id, "number": o.number, "equipment": o.equipment.name if o.equipment else "—",
                      "assignee": short_name(o.assignee.full_name) if o.assignee else "—"} for o in overdue],
            "suggestions": [
                T("Кто сейчас свободен из слесарей?", "Слесарьлерден қазір кім бос?"),
                T("Сводка по смене", "Ауысым қорытындысы"),
                T("Покажи аномалии за 3 месяца", "3 айлық аномалияларды көрсет"),
            ],
        }

    # 3. Запрос: Отчёт / сводка по участку
    sections = db.scalars(select(Section)).all()
    matched_sec = None
    for s in sections:
        sec_stems = _extract_keywords(s.name)
        kz_hit = any(kz in q and s.name.startswith(ru) for kz, ru in _SECTION_KZ.items())
        if (stems & sec_stems) or any(w in q for w in s.name.lower().split()) or kz_hit:
            matched_sec = s
            break

    if matched_sec and any(k in q for k in ["отчет", "сводк", "участ", "обогащен", "дроблен", "сушк", "рмц", "покажи",
                                       "есеп", "қорытынды", "бөлімше", "көрсет"]):
        now = datetime.now()
        month_ago = now - timedelta(days=30)
        sec_orders = db.scalars(
            select(WorkOrder).where(WorkOrder.section_id == matched_sec.id, WorkOrder.created_at >= month_ago)
        ).all()
        unplanned = sum(1 for o in sec_orders if o.work_type == "unplanned")
        planned = sum(1 for o in sec_orders if o.work_type == "planned")
        overdue_cnt = sum(1 for o in sec_orders if is_overdue(o, now))

        answer = T(
            f"📊 Аналитическая сводка по участку «{matched_sec.name}» за 30 дней:\n"
            f"• Всего нарядов: {len(sec_orders)} (аварийных: {unplanned}, плановых ППР: {planned}).\n"
            f"• Просрочек исполнения: {overdue_cnt}.\n"
            f"• Рекомендация ИИ: проверить периодичность смазки и центровки конвейерных линий участка.",
            f"📊 «{matched_sec.name}» бөлімшесі бойынша 30 күндік талдамалық қорытынды:\n"
            f"• Барлық наряд: {len(sec_orders)} (апаттық: {unplanned}, жоспарлы ЖЕЖ: {planned}).\n"
            f"• Орындау мерзімінің өтуі: {overdue_cnt}.\n"
            f"• ЖИ ұсынысы: бөлімше конвейер желілерінің майлау және центрлеу кезеңділігін тексеру."
        )

        return {
            "intent": "section_summary",
            "query": query,
            "answer": answer,
            "data": {"section_id": matched_sec.id, "total": len(sec_orders), "unplanned": unplanned, "planned": planned},
            "suggestions": [
                T("Кто сейчас свободен из электриков?", "Электриктерден қазір кім бос?"),
                T("Что просрочено на смене?", "Ауысымда не мерзімінен өтті?"),
                T("Топ проблемного оборудования", "Мәселелі жабдықтың топ-тізімі"),
            ],
        }

    # 4. Запрос: Топ проблемного оборудования и закономерности
    if any(k in q for k in ["проблем", "поломк", "часто", "топ", "аномал", "отказ",
                         "мәселелі", "бұзылу", "жиі", "істен шық"]):
        anom = detect_anomalies(db, days=90)
        top10 = anom.get("top_problematic", [])
        insights = anom.get("insights", [])

        if top10:
            top_eq = top10[0]
            lines = [T(f"{i+1}. {e['name']} ({e['section']}) — {e['unplanned_count']} поломок, простой {e['downtime_hours']} ч",
                       f"{i+1}. {e['name']} ({e['section']}) — {e['unplanned_count']} бұзылу, тоқтап тұру {e['downtime_hours']} сағ")
                     for i, e in enumerate(top10[:3])]
            answer = T(
                f"🚨 Топ проблемных агрегатов за 90 дней:\n" + "\n".join(lines) + "\n\n"
                f"💡 Главный вывод ИИ: «{top_eq['name']}» отказывает в {top_eq['ratio_to_avg']} раза чаще нормы. "
                f"Рекомендована внеочередная ревизия.",
                f"🚨 90 күндегі ең мәселелі агрегаттар:\n" + "\n".join(lines) + "\n\n"
                f"💡 ЖИ-дің негізгі қорытындысы: «{top_eq['name']}» нормадан {top_eq['ratio_to_avg']} есе жиі істен шығады. "
                f"Кезектен тыс тексеру ұсынылады."
            )
        else:
            answer = T("Накопленных данных недостаточно для выявления аномалий оборудования.",
                       "Жабдық аномалияларын анықтау үшін жинақталған деректер жеткіліксіз.")

        return {
            "intent": "equipment_anomalies",
            "query": query,
            "answer": answer,
            "data": top10[:5],
            "suggestions": [
                T("Кто свободен из слесарей?", "Слесарьлерден кім бос?"),
                T("Сводка по смене", "Ауысым қорытындысы"),
                T("Что просрочено на смене?", "Ауысымда не мерзімінен өтті?"),
            ],
        }

    # 5. По умолчанию: Сводка текущей смены (раздел 5.2 п.4)
    start, end, shift_name = reports.current_shift()
    rep = reports.shift_report(db, start, end)
    shift_label = (T("☀️ Дневная", "☀️ Күндізгі") if shift_name == "day" else T("🌙 Ночная", "🌙 Түнгі"))
    answer = T(
        f"📋 Сводка текущей смены ({shift_label}):\n"
        f"• Выдано нарядов: {rep['issued']} | Выполнено: {rep['done']} | В работе: {rep['issued'] - rep['done']}\n"
        f"• Просрочено: {rep['overdue']} | Отклонено: {rep['rejected']}\n"
        f"• Суммарный простой оборудования: {rep['downtime_hours']} ч.\n"
        f"• {rep['summary']}",
        f"📋 Ағымдағы ауысым қорытындысы ({shift_label}):\n"
        f"• Берілген наряд: {rep['issued']} | Орындалды: {rep['done']} | Жұмыста: {rep['issued'] - rep['done']}\n"
        f"• Мерзімі өтті: {rep['overdue']} | Қабылданбады: {rep['rejected']}\n"
        f"• Жабдықтың жиынтық тоқтап тұруы: {rep['downtime_hours']} сағ.\n"
        f"• {rep['summary']}"
    )

    return {
        "intent": "general_shift_summary",
        "query": query,
        "answer": answer,
        "data": rep,
        "suggestions": [
            T("Кто сейчас свободен из электриков?", "Электриктерден қазір кім бос?"),
            T("Что просрочено на смене?", "Ауысымда не мерзімінен өтті?"),
            T("Покажи проблемы участка обогащения", "Байыту бөлімшесінің мәселелерін көрсет"),
            T("Топ проблемного оборудования", "Мәселелі жабдықтың топ-тізімі"),
        ],
    }
