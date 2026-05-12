from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(32))  # admin | dept-head | citizen
    department_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # citizen + admin store bcrypt hash; dept-head logs in via dept verification_code only.
    password_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
