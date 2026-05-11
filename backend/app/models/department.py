from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(512))
    head_name: Mapped[str] = mapped_column(String(128))
    icon: Mapped[str] = mapped_column(String(32))
    color: Mapped[str] = mapped_column(String(16))
    verification_code: Mapped[str] = mapped_column(String(32), unique=True)
