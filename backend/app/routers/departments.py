from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Department
from app.schemas import DepartmentOut

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentOut])
async def list_departments(db: AsyncSession = Depends(get_db)) -> list[DepartmentOut]:
    rows = (await db.scalars(select(Department).order_by(Department.name))).all()
    return [DepartmentOut.model_validate(r) for r in rows]
