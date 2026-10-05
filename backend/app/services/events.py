"""Отложенная отправка событий после commit: WebSocket + push.

Уведомления и события копятся в session.info и уходят только после успешного commit,
чтобы клиенты не получили данные, которые потом откатятся.
"""
import logging
import threading

from sqlalchemy import event
from sqlalchemy.orm import Session

from ..db import SessionLocal
from ..models import Employee, Notification
from ..realtime import emit, manager
from . import push

log = logging.getLogger(__name__)


def _pending(db: Session) -> list:
    return db.info.setdefault("pending_events", [])


def broadcast(db: Session, message: dict) -> None:
    """Событие для всех подключённых клиентов (обновление доски, статусов)."""
    _pending(db).append(("broadcast", None, message))


def notify(
    db: Session,
    user: Employee | int,
    kind: str,
    title: str,
    text: str,
    order_id: int | None = None,
    urgent: bool = False,
) -> Notification:
    """Уведомление конкретному пользователю: запись в БД + WebSocket + push."""
    user_obj = user if isinstance(user, Employee) else db.get(Employee, user)
    n = Notification(
        user_id=user_obj.id, order_id=order_id, kind=kind, title=title, text=text, urgent=urgent
    )
    db.add(n)
    db.flush()
    payload = {
        "type": "notification",
        "notification": {
            "id": n.id, "kind": kind, "title": title, "text": text,
            "order_id": order_id, "urgent": urgent, "created_at": n.created_at,
        },
    }
    _pending(db).append(("user", user_obj.id, payload))
    _pending(db).append(("push", user_obj, {"title": title, "text": text, "urgent": urgent,
                                            "order_id": order_id}))
    return n


@event.listens_for(SessionLocal, "after_commit")
def _after_commit(db: Session) -> None:
    items = db.info.pop("pending_events", [])
    pushes = []
    for kind, target, message in items:
        if kind == "broadcast":
            emit(manager.broadcast, message)
        elif kind == "user":
            emit(manager.send_to, target, message)
        elif kind == "push":
            pushes.append((target.push_token, target.telegram_chat_id, message))
    if pushes:
        threading.Thread(target=push.send_many, args=(pushes,), daemon=True).start()


@event.listens_for(SessionLocal, "after_rollback")
def _after_rollback(db: Session) -> None:
    db.info.pop("pending_events", None)
