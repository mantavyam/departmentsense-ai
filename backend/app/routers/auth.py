from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import Department, User
from app.schemas import LoginRequest, LoginResponse, LoginUser

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["auth"])


def create_token(user_id: str, role: str, department_id: str | None) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "department_id": department_id,
        "exp": datetime.utcnow() + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    if req.role == "dept-head":
        if not req.verification_code:
            raise HTTPException(status_code=400, detail="Verification code required for dept-head login")
        dept = await db.scalar(select(Department).where(Department.verification_code == req.verification_code.upper()))
        if not dept:
            raise HTTPException(status_code=401, detail="Invalid department verification code")
        user = await db.scalar(select(User).where(User.role == "dept-head", User.department_id == dept.id))
        if not user:
            raise HTTPException(status_code=404, detail="No dept-head user seeded for that department")
        token = create_token(user.id, user.role, user.department_id)
        return LoginResponse(token=token, user=LoginUser.model_validate(user))

    user = await db.scalar(select(User).where(User.role == req.role))
    if not user:
        raise HTTPException(status_code=404, detail="No demo user for that role")
    token = create_token(user.id, user.role, user.department_id)
    return LoginResponse(token=token, user=LoginUser.model_validate(user))
