"""Вход, профиль, справочники, сотрудники, уведомления, отчёты."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from ..auth import create_token, current_user, require_roles, verify_pin
from ..config import DEMO_MODE
from ..db import get_db
from ..models import (
    Brigade,
    Employee,
    Equipment,
    FaultCode,
    Material,
    MaterialNorm,
    Notification,
    Role,
    Section,
)
from ..schemas import AssistantIn, LoginIn, OnShiftIn, PushTokenIn
from ..serializers import employee_out, equipment_out
from ..services import reports
from ..services.events import broadcast
from ..services.workers import workers_with_status

import time
from collections import defaultdict

router = APIRouter(prefix="/api", tags=["core"])
staff_view = require_roles(Role.master, Role.manager, Role.admin)

# In-memory защита от подбора ПИН-кода: не более 5 попыток за 60 секунд на один логин
_login_failures: dict[str, list[float]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_WINDOW_SEC = 60


# ---------------------------------------------------------------- auth

@router.post("/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    clean_login = data.login.strip().lower()
    now_ts = time.time()
    
    # Очищаем устаревшие попытки
    attempts = [t for t in _login_failures[clean_login] if now_ts - t < LOCKOUT_WINDOW_SEC]
    _login_failures[clean_login] = attempts
    
    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        wait_sec = int(LOCKOUT_WINDOW_SEC - (now_ts - attempts[0])) + 1
        raise HTTPException(
            429, 
            f"Слишком много неудачных попыток входа. Подождите {wait_sec} сек."
        )
    
    user = db.scalar(select(Employee).where(Employee.login == clean_login))
    if not user or not verify_pin(data.pin, user.pin_hash):
        _login_failures[clean_login].append(now_ts)
        raise HTTPException(401, "Неверный логин или ПИН-код")
        
    # Сброс счетчика при успешном входе
    _login_failures.pop(clean_login, None)
    return {"token": create_token(user), "user": employee_out(user)}


@router.get("/auth/me")
def me(user: Employee = Depends(current_user)):
    return employee_out(user)


@router.post("/auth/push-token")
def push_token(data: PushTokenIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    if data.push_token is not None:
        user.push_token = data.push_token
    if data.telegram_chat_id is not None:
        user.telegram_chat_id = data.telegram_chat_id
    db.add(user)
    db.commit()
    return {"ok": True}


@router.get("/auth/demo-users")
def demo_users(db: Session = Depends(get_db)):
    """Список тестовых учёток для экрана входа (только для демо)."""
    if not DEMO_MODE:
        raise HTTPException(404, "Демо-режим отключен в конфигурации сервера")
    users = db.scalars(select(Employee).order_by(Employee.role, Employee.full_name)).all()
    return [{"login": u.login, "full_name": u.full_name, "role": u.role, "specialty": u.specialty}
            for u in users]


# ---------------------------------------------------------------- справочники

@router.get("/dictionaries")
def dictionaries(db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    eq = db.scalars(select(Equipment).options(selectinload(Equipment.section))
                    .order_by(Equipment.name)).all()
    return {
        "sections": [{"id": s.id, "name": s.name} for s in db.scalars(select(Section).order_by(Section.id))],
        "equipment": [equipment_out(e) for e in eq],
        "brigades": [{"id": b.id, "name": b.name} for b in db.scalars(select(Brigade).order_by(Brigade.id))],
        "fault_codes": [{"id": f.id, "code": f.code, "category": f.category, "name": f.name,
                         "norm_hours": f.norm_hours}
                        for f in db.scalars(select(FaultCode).order_by(FaultCode.code))],
        "materials": [{"id": m.id, "name": m.name, "unit": m.unit}
                      for m in db.scalars(select(Material).order_by(Material.name))],
        "material_norms": [{"fault_code_id": n.fault_code_id, "material_id": n.material_id,
                            "typical_qty": n.typical_qty} for n in db.scalars(select(MaterialNorm))],
    }


# ---------------------------------------------------------------- сотрудники

@router.get("/workers")
def workers(db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    return workers_with_status(db)


@router.post("/workers/me/on-shift")
def set_on_shift(data: OnShiftIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    user.on_shift = data.on_shift
    db.add(user)
    broadcast(db, {"type": "worker_updated", "worker_id": user.id})
    db.commit()
    return employee_out(user)


@router.post("/workers/{worker_id}/on-shift")
def set_worker_on_shift(worker_id: int, data: OnShiftIn, db: Session = Depends(get_db),
                        user: Employee = Depends(require_roles(Role.master, Role.admin))):
    w = db.get(Employee, worker_id)
    if not w:
        raise HTTPException(404, "Сотрудник не найден")
    w.on_shift = data.on_shift
    broadcast(db, {"type": "worker_updated", "worker_id": w.id})
    db.commit()
    return employee_out(w)


# ---------------------------------------------------------------- уведомления

@router.get("/notifications")
def notifications(limit: int = 50, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    rows = db.scalars(select(Notification).where(Notification.user_id == user.id)
                      .order_by(Notification.created_at.desc()).limit(limit)).all()
    return [{"id": n.id, "kind": n.kind, "title": n.title, "text": n.text, "order_id": n.order_id,
             "urgent": n.urgent, "read": n.read, "created_at": n.created_at} for n in rows]


@router.post("/notifications/read-all")
def read_all(db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    db.execute(update(Notification).where(Notification.user_id == user.id).values(read=True))
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- отчёты

def _period(start: datetime | None, end: datetime | None, days: int) -> tuple[datetime, datetime]:
    end = end or datetime.now()
    return start or end - timedelta(days=days), end


@router.get("/reports/shift")
def shift_report(start: datetime | None = None, end: datetime | None = None,
                 db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    if not start:
        start, end, _ = reports.current_shift()
    return reports.shift_report(db, start, end or datetime.now())


@router.get("/reports/rating")
def rating(start: datetime | None = None, end: datetime | None = None, days: int = 30,
           brigade_id: int | None = None, db: Session = Depends(get_db),
           user: Employee = Depends(current_user)):
    s, e = _period(start, end, days)
    rows = reports.compute_rating(db, s, e, brigade_id)
    if user.role == Role.worker:  # исполнитель видит место в рейтинге и свою расшифровку
        return [{k: r[k] for k in ("id", "short_name", "rating", "place", "specialty")}
                | ({"components": r["components"], "explanation": r["explanation"]}
                   if r["id"] == user.id else {}) for r in rows]
    return {"weights": reports.WEIGHTS, "weight_labels": reports.WEIGHT_LABELS, "rows": rows}


@router.get("/reports/brigades")
def brigades_rating(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                    db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    s, e = _period(start, end, days)
    return reports.compute_brigade_rating(db, s, e)


@router.get("/reports/shift/export/excel")
def export_shift_excel(start: datetime | None = None, end: datetime | None = None,
                       db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    if not start:
        start, end, _ = reports.current_shift()
    end = end or datetime.now()
    bio = export_svc.export_shift_report_excel(db, start, end)
    filename = f"shift_report_{start.strftime('%Y%m%d_%H%M')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/reports/rating/export/excel")
def export_rating_excel(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                        brigade_id: int | None = None, db: Session = Depends(get_db),
                        user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    bio = export_svc.export_rating_excel(db, s, e, brigade_id)
    filename = f"worker_rating_{s.strftime('%Y%m%d')}_{e.strftime('%Y%m%d')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/reports/materials")
def materials_report(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                     db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    return export_svc.get_materials_report(db, s, e)


@router.get("/reports/materials/export/excel")
def export_materials_excel(start: datetime | None = None, end: datetime | None = None, days: int = 30,
                           db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from fastapi.responses import Response
    from ..services import export as export_svc
    s, e = _period(start, end, days)
    bio = export_svc.export_materials_excel(db, s, e)
    filename = f"materials_report_{s.strftime('%Y%m%d')}_{e.strftime('%Y%m%d')}.xlsx"
    return Response(
        content=bio.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/dashboard/counters")
def counters(db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    start, end, shift = reports.current_shift()
    r = reports.shift_report(db, start, end)
    from ..models import Status, WorkOrder
    down = db.scalars(select(WorkOrder).where(
        WorkOrder.work_type == "unplanned",
        WorkOrder.status.in_([Status.issued, Status.queued, Status.accepted, Status.in_progress,
                              Status.paused, Status.rework, Status.rejected]))).all()
    return {"shift": shift, "issued": r["issued"], "done": r["done"], "overdue": r["overdue"],
            "equipment_down": len({o.equipment_id for o in down})}


@router.get("/analytics/anomalies")
def anomalies(days: int = 90, db: Session = Depends(get_db), user: Employee = Depends(staff_view)):
    from ..services.analytics import detect_anomalies
    return detect_anomalies(db, days)


@router.post("/assistant/ask")
def assistant_ask(data: AssistantIn, db: Session = Depends(get_db), user: Employee = Depends(current_user)):
    from ..services.assistant import ask_assistant
    return ask_assistant(db, data.query)
