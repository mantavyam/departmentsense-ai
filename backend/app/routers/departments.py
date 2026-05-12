"""Department CRUD + verification-code generation."""

from __future__ import annotations

import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Department, User
from app.schemas import DepartmentCreate, DepartmentOut, DepartmentUpdate, GeneratedCode
from app.services.dept_loader import slugify

router = APIRouter(prefix="/api/departments", tags=["departments"])


def _new_id(slug: str) -> str:
    return f"dept-{slug}-{uuid.uuid4().hex[:6]}"


async def _generate_unique_code(db: AsyncSession) -> str:
    """6-digit numeric, globally unique across departments."""
    for _ in range(50):
        candidate = f"{secrets.randbelow(900000) + 100000}"
        clash = await db.scalar(
            select(Department).where(Department.verification_code == candidate)
        )
        if clash is None:
            return candidate
    raise HTTPException(500, "Failed to allocate a unique verification code; try again")


@router.get("", response_model=list[DepartmentOut])
async def list_departments(db: AsyncSession = Depends(get_db)) -> list[DepartmentOut]:
    rows = (await db.scalars(select(Department).order_by(Department.name))).all()
    return [DepartmentOut.model_validate(r) for r in rows]


@router.post("", response_model=DepartmentOut, status_code=201)
async def create_department(
    payload: DepartmentCreate, db: AsyncSession = Depends(get_db)
) -> DepartmentOut:
    slug = slugify(payload.name)
    # ensure slug uniqueness with suffix if needed
    base = slug
    n = 1
    while await db.scalar(select(Department).where(Department.slug == slug)):
        n += 1
        slug = f"{base}-{n}"

    dept = Department(
        id=_new_id(slug),
        slug=slug,
        name=payload.name.strip(),
        description=payload.description,
        head_name=payload.head_name,
        officer_address=payload.officer_address,
        officer_contact=payload.officer_contact,
        officer_email=payload.officer_email.lower(),
        icon=payload.icon,
        color=payload.color,
        verification_code=None,
    )
    db.add(dept)

    # Auto-create dept-head user if an officer email is provided.
    if payload.officer_email:
        clash = await db.scalar(
            select(User).where(User.email == payload.officer_email.lower())
        )
        if clash is None:
            db.add(
                User(
                    id=f"user-dept-{uuid.uuid4().hex[:10]}",
                    name=payload.head_name or "Department Head",
                    email=payload.officer_email.lower(),
                    role="dept-head",
                    department_id=dept.id,
                    password_hash=None,
                )
            )
    await db.commit()
    await db.refresh(dept)
    return DepartmentOut.model_validate(dept)


@router.patch("/{department_id}", response_model=DepartmentOut)
async def update_department(
    department_id: str, payload: DepartmentUpdate, db: AsyncSession = Depends(get_db)
) -> DepartmentOut:
    dept = await db.scalar(select(Department).where(Department.id == department_id))
    if not dept:
        raise HTTPException(404, "Department not found")

    data = payload.model_dump(exclude_unset=True)
    new_officer_email = data.get("officer_email")
    for field, value in data.items():
        if field == "officer_email" and value is not None:
            setattr(dept, field, value.lower())
        else:
            setattr(dept, field, value)

    # If officer email changed: detach old dept-head user, attach/create new one.
    if new_officer_email is not None:
        # Remove previous dept-head linkage
        prev = (
            await db.scalars(
                select(User).where(
                    User.role == "dept-head", User.department_id == dept.id
                )
            )
        ).all()
        for u in prev:
            if u.email != new_officer_email.lower():
                u.department_id = None

        if new_officer_email:
            existing = await db.scalar(
                select(User).where(User.email == new_officer_email.lower())
            )
            if existing is not None:
                existing.role = "dept-head"
                existing.department_id = dept.id
            else:
                db.add(
                    User(
                        id=f"user-dept-{uuid.uuid4().hex[:10]}",
                        name=data.get("head_name") or dept.head_name or "Department Head",
                        email=new_officer_email.lower(),
                        role="dept-head",
                        department_id=dept.id,
                        password_hash=None,
                    )
                )

    await db.commit()
    await db.refresh(dept)
    return DepartmentOut.model_validate(dept)


@router.delete("/{department_id}", status_code=204)
async def delete_department(
    department_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    dept = await db.scalar(select(Department).where(Department.id == department_id))
    if not dept:
        raise HTTPException(404, "Department not found")

    # Orphan dept-head users (do not delete them).
    heads = (
        await db.scalars(
            select(User).where(User.department_id == department_id, User.role == "dept-head")
        )
    ).all()
    for u in heads:
        u.department_id = None

    await db.delete(dept)
    await db.commit()


@router.post("/{department_id}/generate-code", response_model=GeneratedCode)
async def generate_code(
    department_id: str, db: AsyncSession = Depends(get_db)
) -> GeneratedCode:
    dept = await db.scalar(select(Department).where(Department.id == department_id))
    if not dept:
        raise HTTPException(404, "Department not found")
    code = await _generate_unique_code(db)
    dept.verification_code = code
    await db.commit()
    return GeneratedCode(department_id=dept.id, verification_code=code)
