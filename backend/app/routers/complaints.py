from __future__ import annotations

import asyncio
import random
import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Complaint, Department, ReasoningStep, SeverityPoint
from app.schemas import (
    ComplaintCreate,
    ComplaintOut,
    FeedbackUpdate,
    StatusUpdate,
)
from app.services.classifier import build_reasoning, build_severity_timeline, classify_text
from app.services.ws_manager import manager

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


def _generate_reference() -> str:
    return f"GRV-{datetime.utcnow().year}-{random.randint(10000, 99999):05d}"


def _eager() -> list:
    return [selectinload(Complaint.reasoning), selectinload(Complaint.severity_timeline)]


@router.get("", response_model=list[ComplaintOut])
async def list_complaints(
    db: AsyncSession = Depends(get_db),
    role: Annotated[str | None, Query()] = None,
    department_id: Annotated[str | None, Query(alias="departmentId")] = None,
    citizen_email: Annotated[str | None, Query(alias="citizenEmail")] = None,
    status: Annotated[str | None, Query()] = None,
    priority: Annotated[str | None, Query()] = None,
) -> list[ComplaintOut]:
    stmt = select(Complaint).options(*_eager()).order_by(Complaint.submitted_at.desc())
    if role == "dept-head" and department_id:
        stmt = stmt.where(Complaint.department_id == department_id)
    elif role == "citizen" and citizen_email:
        stmt = stmt.where(Complaint.citizen_email == citizen_email)
    if status:
        stmt = stmt.where(Complaint.status == status)
    if priority:
        stmt = stmt.where(Complaint.priority == priority)
    rows = (await db.scalars(stmt)).all()
    return [ComplaintOut.model_validate(r) for r in rows]


@router.get("/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(complaint_id: str, db: AsyncSession = Depends(get_db)) -> ComplaintOut:
    stmt = select(Complaint).options(*_eager()).where(Complaint.id == complaint_id)
    complaint = await db.scalar(stmt)
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    return ComplaintOut.model_validate(complaint)


@router.post("", response_model=ComplaintOut, status_code=201)
async def create_complaint(payload: ComplaintCreate, db: AsyncSession = Depends(get_db)) -> ComplaintOut:
    """Submit complaint, run real classification, persist, and broadcast WS events."""
    cid = f"c-{uuid.uuid4().hex[:8]}"
    ref = _generate_reference()

    complaint = Complaint(
        id=cid,
        reference_number=ref,
        citizen_name=payload.citizen_name,
        citizen_email=payload.citizen_email,
        subject=payload.subject,
        body=payload.body,
        language=payload.language,
        location=payload.location,
        submitted_at=datetime.utcnow(),
        status="submitted",
    )
    db.add(complaint)
    await db.flush()
    await manager.broadcast(ref, {"event": "submitted", "referenceNumber": ref, "complaintId": cid})

    classification = await classify_text(payload.body)
    dept = await db.scalar(select(Department).where(Department.id == classification.department_id))

    reasoning = build_reasoning(payload.subject, dept.name if dept else "Public Services")
    severity = build_severity_timeline(classification.priority)

    for pos, step in enumerate(reasoning):
        rs = ReasoningStep(
            complaint_id=cid,
            position=pos,
            step_id=step["step_id"],
            label=step["label"],
            description=step["description"],
            duration_ms=step["duration_ms"],
        )
        db.add(rs)
        await manager.broadcast(
            ref,
            {
                "event": "reasoning_step",
                "step": {
                    "id": step["step_id"],
                    "label": step["label"],
                    "description": step["description"],
                    "durationMs": step["duration_ms"],
                    "position": pos,
                },
            },
        )
        await asyncio.sleep(step["duration_ms"] / 1000.0 / 4)

    for pt in severity:
        db.add(SeverityPoint(complaint_id=cid, t=pt["t"], value=pt["value"]))

    complaint.status = "classified"
    complaint.priority = classification.priority
    complaint.department_id = classification.department_id
    complaint.confidence = classification.confidence
    complaint.sentiment_score = classification.sentiment

    await db.commit()
    await db.refresh(complaint)
    full = await db.scalar(select(Complaint).options(*_eager()).where(Complaint.id == cid))

    await manager.broadcast(
        ref,
        {
            "event": "classified",
            "result": {
                "departmentId": classification.department_id,
                "departmentName": dept.name if dept else "Public Services",
                "priority": classification.priority,
                "confidence": classification.confidence,
                "referenceNumber": ref,
            },
        },
    )

    return ComplaintOut.model_validate(full)


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
async def update_status(
    complaint_id: str, body: StatusUpdate, db: AsyncSession = Depends(get_db)
) -> ComplaintOut:
    complaint = await db.scalar(select(Complaint).options(*_eager()).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    complaint.status = body.status
    await db.commit()
    await db.refresh(complaint)
    await manager.broadcast(
        complaint.reference_number,
        {"event": "status_changed", "status": body.status},
    )
    return ComplaintOut.model_validate(complaint)


@router.patch("/{complaint_id}/feedback", response_model=ComplaintOut)
async def update_feedback(
    complaint_id: str, body: FeedbackUpdate, db: AsyncSession = Depends(get_db)
) -> ComplaintOut:
    complaint = await db.scalar(select(Complaint).options(*_eager()).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    complaint.resolution_feedback = body.feedback
    await db.commit()
    await db.refresh(complaint)
    return ComplaintOut.model_validate(complaint)
