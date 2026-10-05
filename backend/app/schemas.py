"""Входные схемы API (pydantic)."""
from datetime import datetime

from pydantic import BaseModel, Field

from .models import Priority, WorkType


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
    deadline: datetime | None = None
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
    deadline: datetime | None = None


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

