from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Complaint, Department
from app.services.pdf_generator import render_admin_classification, render_citizen_ticket

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


def _eager() -> list:
    return [selectinload(Complaint.reasoning), selectinload(Complaint.severity_timeline)]


@router.get("/ticket/{complaint_id}")
async def ticket_pdf(complaint_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    complaint = await db.scalar(select(Complaint).options(*_eager()).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    dept = (
        await db.scalar(select(Department).where(Department.id == complaint.department_id))
        if complaint.department_id
        else None
    )
    pdf_bytes = render_citizen_ticket(complaint, dept)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{complaint.reference_number}-receipt.pdf"'},
    )


@router.get("/classification/{complaint_id}")
async def classification_pdf(complaint_id: str, db: AsyncSession = Depends(get_db)) -> Response:
    complaint = await db.scalar(select(Complaint).options(*_eager()).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    dept = (
        await db.scalar(select(Department).where(Department.id == complaint.department_id))
        if complaint.department_id
        else None
    )
    pdf_bytes = render_admin_classification(complaint, dept)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{complaint.reference_number}-classification.pdf"'},
    )
