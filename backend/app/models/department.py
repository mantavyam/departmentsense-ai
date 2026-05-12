from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(String(512), default="")
    head_name: Mapped[str] = mapped_column(String(256), default="")
    officer_address: Mapped[str] = mapped_column(String(512), default="")
    officer_contact: Mapped[str] = mapped_column(String(64), default="")
    officer_email: Mapped[str] = mapped_column(String(256), default="")
    icon: Mapped[str] = mapped_column(String(32), default="Building2")
    color: Mapped[str] = mapped_column(String(16), default="#64748b")
    verification_code: Mapped[str | None] = mapped_column(String(16), unique=True, nullable=True)
