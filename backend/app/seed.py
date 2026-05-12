"""Seed initial departments (92 from external JSON) + dept-head users + admin."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import Department, User
from app.services.dept_loader import load_departments
from app.services.security import hash_password

settings = get_settings()

DEPARTMENTS_JSON = Path(__file__).resolve().parents[2] / "docs" / "92-departments.json"


def _email_to_user_id(email: str, fallback: str) -> str:
    base = email.split("@")[0] if email else fallback
    return f"user-dept-{base[:40]}"


async def seed(session: AsyncSession) -> None:
    existing = await session.scalar(select(Department).limit(1))
    if existing is not None:
        return

    departments = load_departments(DEPARTMENTS_JSON)
    for d in departments:
        session.add(Department(**d))

    # One dept-head user per department, keyed on officer email. No password.
    seen_emails: set[str] = set()
    for d in departments:
        email = d["officer_email"]
        if not email or "@" not in email or email in seen_emails:
            continue
        seen_emails.add(email)
        session.add(
            User(
                id=_email_to_user_id(email, d["slug"]),
                name=d["head_name"] or "Department Head",
                email=email,
                role="dept-head",
                department_id=d["id"],
                password_hash=None,
            )
        )

    session.add(
        User(
            id="user-admin-1",
            name=settings.admin_name,
            email=settings.admin_email,
            role="admin",
            department_id=None,
            password_hash=hash_password(settings.admin_password),
        )
    )

    await session.commit()
