"""ИИ-контроль сроков (раздел 6.1, MVP).

Фоновая задача раз в N секунд:
1. за REMIND_BEFORE_MIN до срока — напоминание исполнителю;
2. при просрочке — сообщение исполнителю и мастеру (повтор через OVERDUE_REPEAT_MIN);
3. наряд не принят за 10 мин (аварийный — за 3) — эскалация мастеру с предложением исполнителя;
4. длительная просрочка (> 2 ч) — уведомление руководителю.
"""
import asyncio
import logging
from datetime import datetime, timedelta

import anyio
from sqlalchemy import select

from ..config import (
    ACCEPT_TIMEOUT_EMERGENCY_MIN,
    ACCEPT_TIMEOUT_MIN,
    DEADLINE_CHECK_INTERVAL_SEC,
    OVERDUE_REPEAT_MIN,
    REMIND_BEFORE_MIN,
)
from ..db import SessionLocal
from ..models import Employee, Priority, Role, Status, WorkOrder
from ..serializers import STATUS_LABELS, short_name
from .events import notify
from .workers import suggest_assignees

log = logging.getLogger(__name__)

TRACKED = {Status.issued, Status.queued, Status.accepted, Status.in_progress, Status.paused,
           Status.rework}
MANAGER_AFTER_MIN = 120


def _fmt(minutes: float) -> str:
    h, m = divmod(int(minutes), 60)
    return f"{h} ч {m} мин" if h else f"{m} мин"


def _last_comment(o: WorkOrder) -> str | None:
    for ev in reversed(o.events):
        if ev.comment or ev.reason:
            return ev.reason or ev.comment
    return None


def overdue_message(o: WorkOrder, now: datetime) -> str:
    """Формат из кейса: «Наряд №147 просрочен на 45 мин. Дробилка КМД-1750, участок дробления…»"""
    late = (now - o.deadline).total_seconds() / 60
    status_line = STATUS_LABELS[Status(o.status)].lower()
    if o.status == Status.in_progress and o.started_at:
        status_line += f" с {o.started_at:%H:%M}"
    text = (f"Наряд №{o.number} просрочен на {_fmt(late)}. {o.equipment.name}, "
            f"{o.section.name.lower()}. Исполнитель: "
            f"{short_name(o.assignee.full_name) if o.assignee else '—'}. Статус: {status_line}.")
    last = _last_comment(o)
    if last:
        text += f" Последний комментарий: «{last}»."
    return text


def check_deadlines() -> int:
    """Один проход проверки. Возвращает число отправленных уведомлений."""
    sent = 0
    now = datetime.now()
    with SessionLocal() as db:
        orders = db.scalars(select(WorkOrder).where(WorkOrder.status.in_(list(TRACKED)))).all()
        for o in orders:
            # 3. эскалация: не принят вовремя
            if o.status == Status.issued and not o.escalated_at:
                timeout = ACCEPT_TIMEOUT_EMERGENCY_MIN if o.priority == Priority.emergency else ACCEPT_TIMEOUT_MIN
                if now - o.created_at >= timedelta(minutes=timeout):
                    alt = suggest_assignees(db, o.equipment_id, o.description,
                                            exclude_ids={o.assignee_id} if o.assignee_id else set(), limit=1)
                    alt_txt = (f" Предлагаем: {alt[0]['short_name']} ({alt[0]['live']['label'].lower()})."
                               if alt else "")
                    notify(db, o.master, "escalation", f"Наряд №{o.number} не принят за {timeout} мин",
                           f"{o.equipment.name}, исполнитель "
                           f"{short_name(o.assignee.full_name) if o.assignee else '—'} не отвечает.{alt_txt}",
                           order_id=o.id, urgent=True)
                    o.escalated_at = now
                    sent += 1

            if not o.assignee:
                continue
            left = (o.deadline - now).total_seconds() / 60

            # 1. напоминание до срока
            if 0 < left <= REMIND_BEFORE_MIN and not o.reminded_at:
                notify(db, o.assignee, "reminder", f"До срока наряда №{o.number} — {_fmt(left)}",
                       f"{o.equipment.name}, {o.section.name.lower()}. Срок: {o.deadline:%H:%M}",
                       order_id=o.id)
                o.reminded_at = now
                sent += 1

            # 2. просрочка (с повтором)
            if left <= 0 and (not o.overdue_notified_at or
                              now - o.overdue_notified_at >= timedelta(minutes=OVERDUE_REPEAT_MIN)):
                text = overdue_message(o, now)
                title = f"Просрочка: наряд №{o.number}"
                notify(db, o.assignee, "overdue", title, text, order_id=o.id, urgent=True)
                notify(db, o.master, "overdue", title, text, order_id=o.id, urgent=True)
                o.overdue_notified_at = now
                sent += 2

            # 4. длительная просрочка → руководителю
            if left <= -MANAGER_AFTER_MIN and not o.manager_notified_at:
                for m in db.scalars(select(Employee).where(Employee.role == Role.manager)):
                    notify(db, m, "overdue_long", f"Длительная просрочка: наряд №{o.number}",
                           overdue_message(o, now), order_id=o.id)
                    sent += 1
                o.manager_notified_at = now
        db.commit()
    return sent


async def deadline_loop() -> None:
    while True:
        try:
            n = await anyio.to_thread.run_sync(check_deadlines)
            if n:
                log.info("Контроль сроков: отправлено %s уведомлений", n)
        except Exception:
            log.exception("Ошибка контроля сроков")
        await asyncio.sleep(DEADLINE_CHECK_INTERVAL_SEC)
