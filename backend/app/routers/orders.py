"""Наряды: создание, список, карточка, действия, фото."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from ..auth import _bearer, current_user, decode_token, require_roles
from ..db import get_db
from ..models import (
    PRIORITY_ORDER,
    Employee,
    Photo,
    PhotoKind,
    Priority,
    Role,
    Status,
    WorkOrder,
)
from ..schemas import ActionIn, MasterScoreIn, OrderCreate, PriorityIn, ReassignIn, SuggestIn, SuggestFaultCodeIn
from ..serializers import order_brief, order_full, photo_out
from ..services import orders as svc
from ..services.ai_nlp import suggest_fault_code
from ..services.events import broadcast
from ..services.export import generate_order_print_html
from ..services.photos import save_photo
from ..services.workers import suggest_assignees

router = APIRouter(prefix="/api/orders", tags=["orders"])
master_only = require_roles(Role.master, Role.admin)

DEFAULT_HOURS = {Priority.emergency: 2, Priority.high: 4, Priority.normal: 8, Priority.planned: 24}
MAX_PHOTOS = 5


def _load(db: Session, order_id: int) -> WorkOrder:
    o = db.scalar(select(WorkOrder).where(WorkOrder.id == order_id).options(
        selectinload(WorkOrder.events), selectinload(WorkOrder.photos),
        selectinload(WorkOrder.materials), selectinload(WorkOrder.assessments)))
    if not o:
        raise HTTPException(404, "Наряд не найден")
    return o


def _check_access(o: WorkOrder, user: Employee) -> None:
    if user.role == Role.worker and o.assignee_id != user.id:
        raise HTTPException(403, "Это не ваш наряд")


@router.get("")
def list_orders(
    status: list[str] | None = Query(None),
    section_id: int | None = None,
    equipment_id: int | None = None,
    assignee_id: int | None = None,
    priority: str | None = None,
    scope: str = Query("active", description="active | today | all"),
    limit: int = 300,
    db: Session = Depends(get_db),
    user: Employee = Depends(current_user),
):
    q = select(WorkOrder).options(selectinload(WorkOrder.photos), selectinload(WorkOrder.assessments))
    if user.role == Role.worker:
        q = q.where(WorkOrder.assignee_id == user.id)
    if status:
        q = q.where(WorkOrder.status.in_(status))
    elif scope == "active":
        # активные + закрытые/выполненные за последние 24 ч (для доски)
        since = datetime.now() - timedelta(hours=24)
        q = q.where(or_(
            WorkOrder.status.in_([s.value for s in (Status.issued, Status.queued, Status.accepted,
                                                    Status.in_progress, Status.paused, Status.done,
                                                    Status.ai_review, Status.rework, Status.rejected)]),
            WorkOrder.done_at >= since, WorkOrder.closed_at >= since))
    elif scope == "today":
        q = q.where(WorkOrder.created_at >= datetime.now().replace(hour=0, minute=0, second=0))
    for col, val in ((WorkOrder.section_id, section_id), (WorkOrder.equipment_id, equipment_id),
                     (WorkOrder.assignee_id, assignee_id), (WorkOrder.priority, priority)):
        if val is not None:
            q = q.where(col == val)
    orders = db.scalars(q.order_by(WorkOrder.created_at.desc()).limit(limit)).all()
    orders.sort(key=lambda o: (PRIORITY_ORDER[Priority(o.priority)], o.deadline))
    return [order_brief(o) for o in orders]


@router.post("")
def create(data: OrderCreate, db: Session = Depends(get_db), user: Employee = Depends(master_only)):
    if not data.deadline:
        hours = data.norm_hours or DEFAULT_HOURS[data.priority]
        data.deadline = datetime.now() + timedelta(hours=hours)
    o = svc.create_order(db, user, data)
    db.commit()
    return order_full(_load(db, o.id))


@router.post("/suggest-assignee")
def suggest(data: SuggestIn, db: Session = Depends(get_db), user: Employee = Depends(master_only)):
    return suggest_assignees(db, data.equipment_id, data.description)


@router.post("/suggest-fault-code")
def suggest_code(data: SuggestFaultCodeIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    res = suggest_fault_code(db, data.description)
    return res or {}


@router.get("/meta/reasons")
def reasons(user: Employee = Depends(current_user)):
    return {"reject": svc.VALID_REJECT_REASONS, "pause": svc.PAUSE_REASONS}


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    o = _load(db, order_id)
    _check_access(o, user)
    return order_full(o)


@router.get("/{order_id}/print")
def print_order(
    order_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
    creds = Depends(_bearer),
):
    from fastapi.responses import HTMLResponse
    user_id = None
    if creds and creds.credentials:
        user_id = decode_token(creds.credentials)
    if not user_id and token:
        user_id = decode_token(token)
    if not user_id:
        raise HTTPException(401, "Требуется авторизация")
    user = db.get(Employee, user_id)
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    o = _load(db, order_id)
    _check_access(o, user)
    html = generate_order_print_html(o)
    return HTMLResponse(content=html)


@router.post("/{order_id}/action")
def action(order_id: int, data: ActionIn, db: Session = Depends(get_db),
           user: Employee = Depends(current_user)):
    o = _load(db, order_id)
    svc.apply_action(db, o, user, data.action, reason=data.reason, comment=data.comment,
                     closing=data.closing)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/reassign")
def reassign(order_id: int, data: ReassignIn, db: Session = Depends(get_db),
             user: Employee = Depends(master_only)):
    svc.reassign(db, _load(db, order_id), user, data.assignee_id, data.comment)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/priority")
def priority(order_id: int, data: PriorityIn, db: Session = Depends(get_db),
             user: Employee = Depends(master_only)):
    svc.change_priority(db, _load(db, order_id), user, data.priority, data.deadline)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/master-score")
def master_score(order_id: int, data: MasterScoreIn, db: Session = Depends(get_db),
                 user: Employee = Depends(master_only)):
    svc.set_master_score(db, _load(db, order_id), user, data.score, data.comment)
    db.commit()
    return order_full(_load(db, order_id))


@router.post("/{order_id}/photos")
def upload_photo(
    order_id: int,
    kind: PhotoKind = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Employee = Depends(current_user),
):
    o = _load(db, order_id)
    _check_access(o, user)
    if kind == PhotoKind.before and user.role == Role.worker:
        raise HTTPException(403, "Фото неисправности добавляет мастер")
    if sum(1 for p in o.photos if p.kind == kind) >= MAX_PHOTOS:
        raise HTTPException(400, f"Не более {MAX_PHOTOS} фото")
    data = file.file.read()
    try:
        rel_path, taken_at, phash = save_photo(data, o.id)
    except Exception:
        raise HTTPException(400, "Не удалось прочитать изображение")
    p = Photo(order_id=o.id, kind=kind, file_path=rel_path, taken_at=taken_at,
              author_id=user.id, phash=phash)
    db.add(p)
    db.flush()
    broadcast(db, {"type": "order_photo", "order_id": o.id})
    db.commit()
    return photo_out(p)


@router.delete("/{order_id}/photos/{photo_id}")
def delete_photo(order_id: int, photo_id: int, db: Session = Depends(get_db),
                 user: Employee = Depends(current_user)):
    p = db.get(Photo, photo_id)
    if not p or p.order_id != order_id:
        raise HTTPException(404, "Фото не найдено")
    if p.author_id != user.id and user.role not in (Role.master, Role.admin):
        raise HTTPException(403, "Можно удалить только своё фото")
    db.delete(p)
    db.commit()
    return {"ok": True}
