"""Жизненный цикл наряда: машина состояний на 10 статусов (раздел 4) и журнал действий."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models import (
    PRIORITY_ORDER,
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialWriteOff,
    Priority,
    Role,
    Status,
    Verdict,
    WorkOrder,
    WorkOrderEvent,
)
from ..i18n import T
from ..serializers import order_brief, priority_text, short_name, status_text
from . import ai_review
from .events import broadcast, notify
from .workers import suggest_assignees

S = Status


@dataclass(frozen=True)
class Transition:
    sources: frozenset[Status]
    target: Status
    role: Role
    reason_required: bool = False


TRANSITIONS: dict[str, Transition] = {
    # исполнитель
    "accept": Transition(frozenset({S.issued, S.queued}), S.accepted, Role.worker),
    "queue": Transition(frozenset({S.issued}), S.queued, Role.worker),
    "reject": Transition(frozenset({S.issued, S.queued, S.accepted}), S.rejected, Role.worker, True),
    "start": Transition(frozenset({S.accepted, S.rework, S.queued}), S.in_progress, Role.worker),
    "pause": Transition(frozenset({S.in_progress}), S.paused, Role.worker, True),
    "resume": Transition(frozenset({S.paused}), S.in_progress, Role.worker),
    "complete": Transition(frozenset({S.in_progress}), S.done, Role.worker),
    # мастер
    "approve": Transition(frozenset({S.ai_review, S.done}), S.closed, Role.master),
    "return_rework": Transition(frozenset({S.ai_review, S.done}), S.rework, Role.master, True),
    "cancel": Transition(
        frozenset({S.issued, S.queued, S.accepted, S.rejected, S.in_progress, S.paused, S.rework}),
        S.cancelled, Role.master, True),
}

REASSIGNABLE = {S.issued, S.queued, S.accepted, S.rejected, S.paused, S.rework}

# Уважительные причины отклонения (для рейтинга: остальные — «без уважительной причины»)
VALID_REJECT_REASONS = ["Нет материалов", "Нет допуска", "Занят аварийным нарядом",
                        "Нет инструмента", "Не моя специальность"]
PAUSE_REASONS = ["Ждёт запчасти", "Ждёт остановки оборудования", "Ждёт допуска",
                 "Обед / перерыв", "Переключён на аварийный наряд"]


def log_event(db: Session, o: WorkOrder, actor: Employee | None, action: str,
              from_status: str | None = None, to_status: str | None = None,
              comment: str | None = None, reason: str | None = None) -> None:
    db.add(WorkOrderEvent(order_id=o.id, actor_id=actor.id if actor else None, action=action,
                          from_status=from_status, to_status=to_status,
                          comment=comment, reason=reason))


def next_number(db: Session) -> int:
    return (db.scalar(select(func.max(WorkOrder.number))) or 0) + 1


def _new_order_title(o: WorkOrder, urgent: bool) -> str:
    if urgent:
        return T(f"АВАРИЙНЫЙ наряд №{o.number}", f"АПАТТЫҚ №{o.number} наряд")
    return T(f"Наряд №{o.number}", f"№{o.number} наряд")


def _order_line(o: WorkOrder) -> str:
    return f"{o.equipment.name}, {o.section.name.lower()}"


def _emit_update(db: Session, o: WorkOrder) -> None:
    db.flush()
    db.refresh(o)
    broadcast(db, {"type": "order_updated", "order": order_brief(o)})


def create_order(db: Session, master: Employee, data) -> WorkOrder:
    equipment = db.get(Equipment, data.equipment_id)
    if not equipment:
        raise HTTPException(404, T("Оборудование не найдено", "Жабдық табылмады"))
    assignee = db.get(Employee, data.assignee_id) if data.assignee_id else None
    if data.assignee_id and (not assignee or assignee.role != Role.worker):
        raise HTTPException(400, T("Исполнитель не найден", "Орындаушы табылмады"))

    # Наряд на бригаду (раздел 5.1): ИИ выбирает лучшего свободного члена бригады
    brigade_note = None
    if data.brigade_id:
        brigade = db.get(Brigade, data.brigade_id)
        if not brigade:
            raise HTTPException(400, T("Бригада не найдена", "Бригада табылмады"))
        if not assignee:
            candidates = [c for c in suggest_assignees(db, equipment.id, data.description, limit=100)
                          if (c.get("brigade") or {}).get("id") == brigade.id]
            if not candidates:
                raise HTTPException(409, T(f"В бригаде «{brigade.name}» нет исполнителей на смене", f"«{brigade.name}» бригадасында ауысымда орындаушылар жоқ"))
            best = candidates[0]
            assignee = db.get(Employee, best["id"])
            brigade_note = T(f"Наряд на «{brigade.name}»: ИИ назначил {best['short_name']} ({best['reason']})",
                             f"«{brigade.name}» бригадасына наряд: ЖИ {best['short_name']} тағайындады ({best['reason']})")

    o = None
    for attempt in range(5):
        sp = db.begin_nested()
        try:
            o = WorkOrder(
                number=next_number(db), work_type=data.work_type, description=data.description,
                section_id=equipment.section_id, equipment_id=equipment.id,
                assignee_id=assignee.id if assignee else None, brigade_id=data.brigade_id,
                master_id=master.id, priority=data.priority, deadline=data.deadline,
                comment=data.comment, status=S.issued,
            )
            db.add(o)
            db.flush()
            sp.commit()
            break
        except IntegrityError:
            sp.rollback()
            if attempt == 4:
                raise HTTPException(500, T("Не удалось сформировать уникальный номер наряда. Повторите попытку.", "Нарядтың бірегей нөмірін қалыптастыру мүмкін болмады. Қайталап көріңіз."))

    log_event(db, o, master, "issued", None, S.issued, comment=data.comment)
    if brigade_note:
        log_event(db, o, None, "brigade_assign", comment=brigade_note)
    db.refresh(o)
    if assignee:
        urgent = o.priority == Priority.emergency
        notify(db, assignee, "new_order",
               _new_order_title(o, urgent),
               T(f"{_order_line(o)}. {o.description}. Срок: {o.deadline:%H:%M %d.%m}",
                 f"{_order_line(o)}. {o.description}. Мерзімі: {o.deadline:%H:%M %d.%m}"),
               order_id=o.id, urgent=urgent)
    _emit_update(db, o)
    return o


def _promote_next_queued(db: Session, worker: Employee) -> None:
    """«В очереди → Принят (по очереди)»: после завершения берём следующий наряд из очереди."""
    queued = db.scalars(select(WorkOrder).where(
        WorkOrder.assignee_id == worker.id, WorkOrder.status == S.queued)).all()
    if not queued:
        return
    nxt = min(queued, key=lambda q: (PRIORITY_ORDER[Priority(q.priority)], q.deadline))
    nxt.status = S.accepted
    nxt.accepted_at = datetime.now()
    log_event(db, nxt, None, "auto_accept", S.queued, S.accepted, comment=T("Следующий в очереди", "Кезектегі келесі"))
    notify(db, worker, "next_in_queue", T(f"Следующий наряд №{nxt.number}", f"Келесі наряд №{nxt.number}"),
           f"{_order_line(nxt)}. {nxt.description}", order_id=nxt.id)
    _emit_update(db, nxt)


def apply_action(db: Session, o: WorkOrder, actor: Employee, action: str,
                 reason: str | None = None, comment: str | None = None,
                 closing=None) -> WorkOrder:
    t = TRANSITIONS.get(action)
    if not t:
        raise HTTPException(400, T(f"Неизвестное действие: {action}", f"Белгісіз әрекет: {action}"))
    if actor.role != t.role and not (t.role == Role.master and actor.role == Role.admin):
        raise HTTPException(403, T("Это действие недоступно для вашей роли", "Бұл әрекет сіздің рөліңіз үшін қолжетімсіз"))
    if actor.role == Role.worker and o.assignee_id != actor.id:
        raise HTTPException(403, T("Это не ваш наряд", "Бұл сіздің наряд емес"))
    if o.status not in t.sources:
        raise HTTPException(409, T(f"Нельзя выполнить «{action}» из статуса «{status_text(o.status)}»", f"«{action}» әрекетін «{status_text(o.status)}» мәртебесінен орындау мүмкін емес"))
    if t.reason_required and not reason:
        raise HTTPException(422, T("Укажите причину", "Себебін көрсетіңіз"))

    prev = o.status
    now = datetime.now()
    o.status = t.target

    if action == "accept":
        o.accepted_at = now
    elif action == "queue":
        o.queued_at = now
    elif action == "start":
        o.started_at = o.started_at or now
        o.accepted_at = o.accepted_at or now
    elif action == "pause":
        o.paused_since = now
    elif action == "resume":
        if o.paused_since:
            o.paused_minutes = (o.paused_minutes or 0) + (now - o.paused_since).total_seconds() / 60
        o.paused_since = None
    elif action == "complete":
        _apply_closing_form(db, o, closing)
        o.done_at = now
    elif action == "approve":
        o.closed_at = now

    log_event(db, o, actor, action, prev, o.status, comment=comment, reason=reason)

    # уведомления мастеру о действиях исполнителя
    who = short_name(actor.full_name)
    if action == "reject":
        notify(db, o.master, "rejected", T(f"Наряд №{o.number} отклонён", f"№{o.number} наряд қабылданбады"),
               T(f"{who}: «{reason}». {_order_line(o)}. Переназначьте исполнителя.",
                 f"{who}: «{reason}». {_order_line(o)}. Орындаушыны қайта тағайындаңыз."),
               order_id=o.id, urgent=o.priority == Priority.emergency)
    elif action == "pause":
        notify(db, o.master, "paused", T(f"Наряд №{o.number} приостановлен", f"№{o.number} наряд тоқтатылды"),
               f"{who}: «{reason}». {_order_line(o)}", order_id=o.id)
    elif action == "return_rework":
        notify(db, o.assignee, "rework", T(f"Наряд №{o.number} возвращён на доработку", f"№{o.number} наряд қайта қарауға қайтарылды"),
               T(f"Мастер: «{reason}»", f"Шебер: «{reason}»"), order_id=o.id, urgent=True)
    elif action == "approve" and o.assignee:
        a = o.assessment
        notify(db, o.assignee, "closed", T(f"Наряд №{o.number} закрыт", f"№{o.number} наряд жабылды"),
               (T(f"Итоговая оценка: {a.final_score}/100", f"Қорытынды баға: {a.final_score}/100") if a
                else T("Наряд закрыт мастером", "Нарядты шебер жапты")),
               order_id=o.id)

    _emit_update(db, o)

    if action == "complete":
        _run_ai_review(db, o, actor)
    elif action == "cancel" and o.assignee:
        _promote_next_queued(db, o.assignee)
    return o


def _apply_closing_form(db: Session, o: WorkOrder, closing) -> None:
    if closing is None:
        raise HTTPException(422, T("Заполните форму закрытия", "Жабу пішінін толтырыңыз"))
    if closing.fault_code_id is not None:
        fc = db.get(FaultCode, closing.fault_code_id)
        if not fc:
            raise HTTPException(400, T("Указанный шифр неисправности не найден в справочнике", "Көрсетілген ақау шифры анықтамалықта табылмады"))
    o.work_done = closing.work_done
    o.fault_code_id = closing.fault_code_id
    o.close_comment = closing.comment
    for m in list(o.materials):
        db.delete(m)
    db.flush()
    for item in closing.materials:
        mat = db.get(Material, item.material_id)
        if not mat:
            raise HTTPException(400, T(f"Материал с ID {item.material_id} не найден в справочнике", f"ID {item.material_id} материалы анықтамалықта табылмады"))
        db.add(MaterialWriteOff(order_id=o.id, material_id=item.material_id, qty=item.qty))
    db.flush()
    db.refresh(o, ["materials"])


def _run_ai_review(db: Session, o: WorkOrder, worker: Employee) -> None:
    """Исполнено → Проверка ИИ → (вердикт) → На доработке | ждёт подтверждения мастера."""
    o.status = S.ai_review
    log_event(db, o, None, "ai_review", S.done, S.ai_review)
    db.flush()
    a = ai_review.review_order(db, o)
    log_event(db, o, None, "ai_verdict", comment=f"{a.score}/100. {a.explanation}")

    notify(db, worker, "ai_result", T(f"Отчёт ИИ по наряду №{o.number}", f"№{o.number} наряд бойынша ЖИ есебі"), a.worker_report or "",
           order_id=o.id, urgent=a.verdict == Verdict.needs_rework)

    if a.verdict == Verdict.needs_rework:
        o.status = S.rework
        log_event(db, o, None, "return_rework", S.ai_review, S.rework, reason=T("Вердикт ИИ", "ЖИ үкімі"))
        notify(db, o.master, "ai_rework", T(f"Наряд №{o.number}: требует доработки", f"№{o.number} наряд: қайта қарауды қажет етеді"),
               f"{short_name(worker.full_name)}, {_order_line(o)}. {a.explanation}", order_id=o.id)
    else:
        notify(db, o.master, "ai_review_done",
               T(f"Наряд №{o.number} ждёт подтверждения ({a.score}/100)", f"№{o.number} наряд растауды күтуде ({a.score}/100)"),
               f"{short_name(worker.full_name)}, {_order_line(o)}. {a.explanation}", order_id=o.id)
    _emit_update(db, o)
    if a.verdict != Verdict.needs_rework:
        _promote_next_queued(db, worker)


def reassign(db: Session, o: WorkOrder, master: Employee, assignee_id: int,
             comment: str | None = None) -> WorkOrder:
    if o.status not in REASSIGNABLE:
        raise HTTPException(409, T("Наряд в этом статусе нельзя переназначить", "Бұл мәртебедегі нарядты қайта тағайындауға болмайды"))
    new = db.get(Employee, assignee_id)
    if not new or new.role != Role.worker:
        raise HTTPException(400, T("Исполнитель не найден", "Орындаушы табылмады"))
    old = o.assignee
    prev = o.status
    o.assignee_id = new.id
    o.status = S.issued
    o.accepted_at = o.started_at = o.queued_at = None
    o.escalated_at = None
    log_event(db, o, master, "reassign", prev, S.issued,
              comment=f"{short_name(old.full_name) if old else '—'} → {short_name(new.full_name)}"
              + (f". {comment}" if comment else ""))
    db.flush()
    db.refresh(o)
    urgent = o.priority == Priority.emergency
    notify(db, new, "new_order", _new_order_title(o, urgent),
           T(f"{_order_line(o)}. {o.description}. Срок: {o.deadline:%H:%M %d.%m}",
             f"{_order_line(o)}. {o.description}. Мерзімі: {o.deadline:%H:%M %d.%m}"),
           order_id=o.id, urgent=urgent)
    if old and old.id != new.id:
        notify(db, old, "reassigned", T(f"Наряд №{o.number} передан другому исполнителю", f"№{o.number} наряд басқа орындаушыға берілді"),
               _order_line(o), order_id=o.id)
        _promote_next_queued(db, old)
    _emit_update(db, o)
    return o


def change_priority(db: Session, o: WorkOrder, master: Employee, priority: Priority,
                    deadline: datetime | None = None) -> WorkOrder:
    old = o.priority
    o.priority = priority
    if deadline:
        o.deadline = deadline
        o.reminded_at = o.overdue_notified_at = None
    log_event(db, o, master, "change_priority",
              comment=f"{priority_text(old)} → {priority_text(priority)}"
              + (T(f", срок {deadline:%H:%M %d.%m}", f", мерзімі {deadline:%H:%M %d.%m}") if deadline else ""))
    if o.assignee:
        notify(db, o.assignee, "priority", T(f"Наряд №{o.number}: приоритет «{priority_text(priority)}»", f"№{o.number} наряд: басымдығы «{priority_text(priority)}»"),
               _order_line(o), order_id=o.id, urgent=priority == Priority.emergency)
    _emit_update(db, o)
    return o


def set_master_score(db: Session, o: WorkOrder, master: Employee, score: int,
                     comment: str | None) -> WorkOrder:
    a = o.assessment
    if not a:
        raise HTTPException(409, T("У наряда нет оценки ИИ", "Нарядтың ЖИ бағасы жоқ"))
    a.master_score = score
    a.master_comment = comment
    log_event(db, o, master, "master_score", comment=T(f"ИИ: {a.score} → мастер: {score}. {comment or ''}", f"ЖИ: {a.score} → шебер: {score}. {comment or ''}"))
    _emit_update(db, o)
    return o
