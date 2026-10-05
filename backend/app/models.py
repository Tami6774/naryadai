"""Модель данных «НарядAI» — 8 сущностей кейса (раздел 8) + справочники."""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def now() -> datetime:
    return datetime.now()


# ---------------------------------------------------------------- перечисления

class Role(str, enum.Enum):
    master = "master"      # мастер смены
    worker = "worker"      # исполнитель
    manager = "manager"    # руководитель
    admin = "admin"        # администратор


class WorkType(str, enum.Enum):
    planned = "planned"        # плановый
    unplanned = "unplanned"    # внеплановый (аварийный)


class Priority(str, enum.Enum):
    emergency = "emergency"    # Аварийный — срочно в работу
    high = "high"              # Высокий
    normal = "normal"          # Обычный — в порядке очереди
    planned = "planned"        # Плановый


PRIORITY_ORDER = {Priority.emergency: 0, Priority.high: 1, Priority.normal: 2, Priority.planned: 3}


class Status(str, enum.Enum):
    """10 статусов жизненного цикла наряда (раздел 4) + «отменён» мастером."""
    issued = "issued"            # Выдан
    queued = "queued"            # В очереди
    accepted = "accepted"        # Принят в работу
    rejected = "rejected"        # Отклонён
    in_progress = "in_progress"  # В работе
    paused = "paused"            # Приостановлен
    done = "done"                # Исполнено
    ai_review = "ai_review"      # Проверка ИИ
    rework = "rework"            # На доработке
    closed = "closed"            # Закрыт
    cancelled = "cancelled"      # Отменён мастером


ACTIVE_STATUSES = {
    Status.issued, Status.queued, Status.accepted, Status.in_progress,
    Status.paused, Status.rework,
}


class Verdict(str, enum.Enum):
    accepted = "accepted"                    # принято
    accepted_with_remarks = "accepted_with_remarks"  # принято с замечаниями
    needs_rework = "needs_rework"            # требует доработки


class PhotoKind(str, enum.Enum):
    before = "before"
    after = "after"


# ---------------------------------------------------------------- справочники

class Section(Base):
    __tablename__ = "sections"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)

    equipment: Mapped[list[Equipment]] = relationship(back_populates="section")


class Equipment(Base):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    inv_no: Mapped[str] = mapped_column(String(40), unique=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    type: Mapped[str] = mapped_column(String(60))           # конвейер, дробилка, насос…
    criticality: Mapped[int] = mapped_column(Integer, default=2)  # 1 — высокая, 3 — низкая
    qr_code: Mapped[str | None] = mapped_column(String(80), nullable=True)

    section: Mapped[Section] = relationship(back_populates="equipment")


class Brigade(Base):
    __tablename__ = "brigades"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)


class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    specialty: Mapped[str] = mapped_column(String(60))      # слесарь, электрик, сварщик…
    grade: Mapped[int] = mapped_column(Integer, default=4)  # разряд
    brigade_id: Mapped[int | None] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    role: Mapped[Role] = mapped_column(String(20))
    shift: Mapped[str] = mapped_column(String(10), default="day")  # day / night
    on_shift: Mapped[bool] = mapped_column(Boolean, default=True)
    login: Mapped[str] = mapped_column(String(40), unique=True)
    pin_hash: Mapped[str] = mapped_column(String(200))
    push_token: Mapped[str | None] = mapped_column(String(300), nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(40), nullable=True)

    brigade: Mapped[Brigade | None] = relationship()


class FaultCode(Base):
    """Шифры неисправностей: М — механ., Э — электр., Г — гидравл., П — пневм., С — смазка."""
    __tablename__ = "fault_codes"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(10), unique=True)   # «М-02»
    category: Mapped[str] = mapped_column(String(2))              # «М»
    name: Mapped[str] = mapped_column(String(160))
    norm_hours: Mapped[float] = mapped_column(Float, default=2.0)  # норматив времени


class Material(Base):
    __tablename__ = "materials"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    unit: Mapped[str] = mapped_column(String(20))   # шт, кг, л, м


class MaterialNorm(Base):
    """Обычный расход материала на один ремонт по шифру — для проверки «завышения»."""
    __tablename__ = "material_norms"
    __table_args__ = (UniqueConstraint("fault_code_id", "material_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    fault_code_id: Mapped[int] = mapped_column(ForeignKey("fault_codes.id"))
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"))
    typical_qty: Mapped[float] = mapped_column(Float)

    material: Mapped[Material] = relationship()


# ---------------------------------------------------------------- наряды

class WorkOrder(Base):
    __tablename__ = "work_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    work_type: Mapped[WorkType] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), index=True)
    assignee_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), index=True, nullable=True)
    brigade_id: Mapped[int | None] = mapped_column(ForeignKey("brigades.id"), nullable=True)
    master_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    priority: Mapped[Priority] = mapped_column(String(20))
    deadline: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[Status] = mapped_column(String(20), index=True, default=Status.issued)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # форма закрытия
    work_done: Mapped[str | None] = mapped_column(Text, nullable=True)
    fault_code_id: Mapped[int | None] = mapped_column(ForeignKey("fault_codes.id"), nullable=True)
    close_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # времена переходов
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    queued_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    paused_minutes: Mapped[float] = mapped_column(Float, default=0)   # накопленное время на паузе
    paused_since: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # служебные флаги контроля сроков (чтобы не спамить)
    reminded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    overdue_notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    escalated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    manager_notified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    section: Mapped[Section] = relationship()
    equipment: Mapped[Equipment] = relationship()
    assignee: Mapped[Employee | None] = relationship(foreign_keys=[assignee_id])
    master: Mapped[Employee] = relationship(foreign_keys=[master_id])
    brigade: Mapped[Brigade | None] = relationship()
    fault_code: Mapped[FaultCode | None] = relationship()
    events: Mapped[list[WorkOrderEvent]] = relationship(
        back_populates="order", order_by="WorkOrderEvent.created_at", cascade="all, delete-orphan"
    )
    photos: Mapped[list[Photo]] = relationship(back_populates="order", cascade="all, delete-orphan")
    materials: Mapped[list[MaterialWriteOff]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    assessments: Mapped[list[AIAssessment]] = relationship(
        back_populates="order", order_by="AIAssessment.created_at", cascade="all, delete-orphan"
    )

    @property
    def assessment(self) -> AIAssessment | None:
        return self.assessments[-1] if self.assessments else None


class WorkOrderEvent(Base):
    """Журнал: кто, что, когда (раздел 5.5)."""
    __tablename__ = "work_order_events"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)  # None = ИИ/система
    action: Mapped[str] = mapped_column(String(40))
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    order: Mapped[WorkOrder] = relationship(back_populates="events")
    actor: Mapped[Employee | None] = relationship()


class Photo(Base):
    __tablename__ = "photos"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    kind: Mapped[PhotoKind] = mapped_column(String(10))
    file_path: Mapped[str] = mapped_column(String(300))
    taken_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)  # из EXIF
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    author_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    phash: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)

    order: Mapped[WorkOrder] = relationship(back_populates="photos")


class MaterialWriteOff(Base):
    __tablename__ = "material_writeoffs"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"))
    qty: Mapped[float] = mapped_column(Float)

    order: Mapped[WorkOrder] = relationship(back_populates="materials")
    material: Mapped[Material] = relationship()


class AIAssessment(Base):
    __tablename__ = "ai_assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("work_orders.id"), index=True)
    verdict: Mapped[Verdict] = mapped_column(String(30))
    score: Mapped[int] = mapped_column(Integer)              # 0–100
    photo_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1–5
    explanation: Mapped[str] = mapped_column(Text)
    worker_report: Mapped[str | None] = mapped_column(Text, nullable=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)  # результаты отдельных проверок
    needs_master_check: Mapped[bool] = mapped_column(Boolean, default=False)
    master_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    master_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

    order: Mapped[WorkOrder] = relationship(back_populates="assessments")

    @property
    def final_score(self) -> int:
        return self.master_score if self.master_score is not None else self.score


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("work_orders.id"), nullable=True)
    kind: Mapped[str] = mapped_column(String(30))  # new_order, reminder, overdue, escalation, ai_result…
    title: Mapped[str] = mapped_column(String(200))
    text: Mapped[str] = mapped_column(Text)
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)
