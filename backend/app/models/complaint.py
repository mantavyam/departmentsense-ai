from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    reference_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    citizen_name: Mapped[str] = mapped_column(String(128))
    citizen_email: Mapped[str] = mapped_column(String(128), index=True)
    subject: Mapped[str] = mapped_column(String(256))
    body: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(8), default="en")
    location: Mapped[str] = mapped_column(String(256))
    submitted_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(32), default="submitted", index=True)
    priority: Mapped[str] = mapped_column(String(16), default="medium", index=True)
    department_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("departments.id"), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0)
    resolution_feedback: Mapped[str | None] = mapped_column(String(16), nullable=True)

    reasoning: Mapped[list["ReasoningStep"]] = relationship(
        back_populates="complaint", cascade="all, delete-orphan", order_by="ReasoningStep.position"
    )
    severity_timeline: Mapped[list["SeverityPoint"]] = relationship(
        back_populates="complaint", cascade="all, delete-orphan", order_by="SeverityPoint.t"
    )


class ReasoningStep(Base):
    __tablename__ = "reasoning_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[str] = mapped_column(String(64), ForeignKey("complaints.id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(Integer)
    step_id: Mapped[str] = mapped_column(String(32))
    label: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)

    complaint: Mapped["Complaint"] = relationship(back_populates="reasoning")


class SeverityPoint(Base):
    __tablename__ = "severity_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[str] = mapped_column(String(64), ForeignKey("complaints.id", ondelete="CASCADE"))
    t: Mapped[int] = mapped_column(Integer)
    value: Mapped[float] = mapped_column(Float)

    complaint: Mapped["Complaint"] = relationship(back_populates="severity_timeline")
