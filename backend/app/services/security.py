"""Password hashing + JWT helpers."""

from __future__ import annotations

from datetime import datetime, timedelta

import bcrypt
from jose import jwt

from app.config import get_settings

settings = get_settings()


def hash_password(plain: str) -> str:
    # bcrypt has a hard 72-byte limit; truncate (industry-standard handling).
    secret = plain.encode("utf-8")[:72]
    return bcrypt.hashpw(secret, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    secret = plain.encode("utf-8")[:72]
    try:
        return bcrypt.checkpw(secret, hashed.encode("utf-8"))
    except ValueError:
        return False


def create_token(user_id: str, role: str, department_id: str | None) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "department_id": department_id,
        "exp": datetime.utcnow() + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")
