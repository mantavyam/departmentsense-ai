from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel

Role = Literal["admin", "dept-head", "citizen"]
Priority = Literal["low", "medium", "high", "urgent"]
Status = Literal["submitted", "classified", "assigned", "in-progress", "resolved", "closed"]
Feedback = Literal["UNSATISFIED", "AVERAGE", "SATISFIED"]


class CamelModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )


class DepartmentOut(CamelModel):
    id: str
    slug: str
    name: str
    description: str
    head_name: str
    officer_address: str
    officer_contact: str
    officer_email: str
    icon: str
    color: str
    verification_code: str | None = None


class DepartmentCreate(CamelModel):
    name: str = Field(min_length=2)
    description: str = ""
    head_name: str = ""
    officer_address: str = ""
    officer_contact: str = ""
    officer_email: str = ""
    icon: str = "Building2"
    color: str = "#64748b"


class DepartmentUpdate(CamelModel):
    name: str | None = None
    description: str | None = None
    head_name: str | None = None
    officer_address: str | None = None
    officer_contact: str | None = None
    officer_email: str | None = None
    icon: str | None = None
    color: str | None = None


class ReasoningStepOut(CamelModel):
    id: str = Field(validation_alias="step_id", serialization_alias="id")
    label: str
    description: str
    status: Literal["complete", "active", "pending"] = "complete"
    duration_ms: int


class SeverityPointOut(CamelModel):
    t: int
    value: float


class ComplaintOut(CamelModel):
    id: str
    reference_number: str
    citizen_name: str
    citizen_email: str
    subject: str
    body: str
    language: str
    location: str
    submitted_at: datetime
    status: Status
    priority: Priority
    department_id: str | None
    confidence: float
    sentiment_score: float
    resolution_feedback: Feedback | None = None
    reasoning: list[ReasoningStepOut] = []
    severity_timeline: list[SeverityPointOut] = []


class ComplaintCreate(CamelModel):
    citizen_name: str
    citizen_email: EmailStr
    subject: str
    body: str = Field(min_length=10)
    language: str = "en"
    location: str


class StatusUpdate(CamelModel):
    status: Status


class FeedbackUpdate(CamelModel):
    feedback: Feedback


class SignupRequest(CamelModel):
    name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=8)


class LoginRequest(CamelModel):
    role: Role
    email: EmailStr | None = None
    password: str | None = None
    verification_code: str | None = None


class LoginUser(CamelModel):
    id: str
    name: str
    email: str
    role: Role
    department_id: str | None = None


class LoginResponse(CamelModel):
    token: str
    user: LoginUser


class GeneratedCode(CamelModel):
    department_id: str
    verification_code: str
