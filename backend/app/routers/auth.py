"""Authentication: citizen signup/signin, admin signin, dept-head signin via dept code."""

from __future__ import annotations

import re
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Department, User
from app.schemas import LoginRequest, LoginResponse, LoginUser, SignupRequest
from app.services.security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PASSWORD_RULE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")


def _validate_password(pw: str) -> None:
    if not PASSWORD_RULE.match(pw):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 chars and contain a letter and a digit.",
        )


@router.post("/signup", response_model=LoginResponse, status_code=201)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    """Citizen-only signup. Admin + dept-head accounts are seeded, not registered."""
    if not EMAIL_RE.match(req.email):
        raise HTTPException(400, "Invalid email address")
    _validate_password(req.password)

    existing = await db.scalar(select(User).where(User.email == req.email.lower()))
    if existing is not None:
        raise HTTPException(409, "An account with that email already exists")

    user = User(
        id=f"user-citizen-{uuid.uuid4().hex[:10]}",
        name=req.name.strip(),
        email=req.email.lower(),
        role="citizen",
        department_id=None,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token(user.id, user.role, user.department_id)
    return LoginResponse(token=token, user=LoginUser.model_validate(user))


@router.post("/dept-head/check-email", status_code=204)
async def check_dept_head_email(
    payload: dict, db: AsyncSession = Depends(get_db)
) -> None:
    """Confirm an email belongs to a seeded/known department head before prompting for the code."""
    email = (payload.get("email") or "").strip().lower()
    if not email or not EMAIL_RE.match(email):
        raise HTTPException(400, "Valid email required")
    user = await db.scalar(
        select(User).where(User.email == email, User.role == "dept-head")
    )
    if not user:
        raise HTTPException(404, "No department head is registered with that email")
    if not user.department_id:
        raise HTTPException(409, "This officer is not currently assigned to a department")


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    if req.role == "dept-head":
        if not req.email or not req.verification_code:
            raise HTTPException(400, "Email and verification code required")
        code = req.verification_code.strip()
        if not (code.isdigit() and len(code) == 6):
            raise HTTPException(400, "Verification code must be a 6-digit number")
        dept = await db.scalar(select(Department).where(Department.verification_code == code))
        if not dept:
            raise HTTPException(401, "Invalid verification code")
        user = await db.scalar(
            select(User).where(
                User.role == "dept-head",
                User.email == req.email.lower(),
                User.department_id == dept.id,
            )
        )
        if not user:
            raise HTTPException(
                401,
                "Email is not registered as the head of the department that this code unlocks.",
            )
        token = create_token(user.id, user.role, user.department_id)
        return LoginResponse(token=token, user=LoginUser.model_validate(user))

    # admin or citizen
    if not req.email or not req.password:
        raise HTTPException(400, "Email and password required")
    user = await db.scalar(
        select(User).where(User.email == req.email.lower(), User.role == req.role)
    )
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user.id, user.role, user.department_id)
    return LoginResponse(token=token, user=LoginUser.model_validate(user))
