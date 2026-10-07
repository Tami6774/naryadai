"""Входные схемы API (pydantic)."""
from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, Field

from .models import Priority, WorkType


def _to_local_naive(value: datetime) -> datetime:
    """Клиенты присылают время с поясом (toISOString → UTC «Z»), а БД и все расчёты сроков
    работают в локальном времени сервера без пояса. Без приведения SQLite отбрасывал пояс,
    и срок «через 2 часа» на ПК с UTC+5 сразу считался просроченным на 3 часа."""
    if value.tzinfo is not None:
        return value.astimezone().replace(tzinfo=None)
    return value


LocalDatetime = Annotated[datetime, AfterValidator(_to_local_naive)]


class LoginIn(BaseModel):
    login: str
    pin: str


class OrderCreate(BaseModel):
    work_type: WorkType = WorkType.unplanned
    description: str = Field(min_length=3)
    equipment_id: int
    assignee_id: int | None = None
    brigade_id: int | None = None
    priority: Priority = Priority.normal
    deadline: LocalDatetime | None = None
    norm_hours: float | None = Field(default=None, gt=0, description="Срок как норматив в часах")
    comment: str | None = None


class MaterialItem(BaseModel):
    material_id: int
    qty: float = Field(gt=0)


class ClosingForm(BaseModel):
    work_done: str = ""
    fault_code_id: int | None = None
    materials: list[MaterialItem] = []
    comment: str | None = None


class ActionIn(BaseModel):
    action: str
    reason: str | None = None
    comment: str | None = None
    closing: ClosingForm | None = None


class ReassignIn(BaseModel):
    assignee_id: int
    comment: str | None = None


class PriorityIn(BaseModel):
    priority: Priority
    deadline: LocalDatetime | None = None


class MasterScoreIn(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: str | None = None


class SuggestIn(BaseModel):
    equipment_id: int
    description: str = ""


class OnShiftIn(BaseModel):
    on_shift: bool


class PushTokenIn(BaseModel):
    push_token: str | None = None
    telegram_chat_id: str | None = None


class SuggestFaultCodeIn(BaseModel):
    description: str


class AssistantIn(BaseModel):
    query: str

