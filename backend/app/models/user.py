"""
==========================================================
BearingIQ
User ORM Model
==========================================================
"""

from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import func
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.prediction import Prediction
from app.models.refresh_token import RefreshToken




class User(Base):
    """
    SQLAlchemy ORM model for the users table.
    """

    __tablename__ = "users"

    # ======================================================
    # Primary Key
    # ======================================================

    user_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # ======================================================
    # User Information
    # ======================================================

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # ======================================================
    # User Role
    # ======================================================

    role: Mapped[str] = mapped_column(
        String(20),
        server_default="user",
        nullable=False
    )

    # ======================================================
    # Account Status
    # ======================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # ======================================================
    # Login Information
    # ======================================================

    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # ======================================================
    # Timestamps
    # ======================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # ======================================================
    # Relationships
    # ======================================================

    predictions: Mapped[List["Prediction"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # ======================================================
    # Representation
    # ======================================================

    def __repr__(self) -> str:

        return (
            f"User("
            f"user_id={self.user_id}, "
            f"username='{self.username}', "
            f"email='{self.email}', "
            f"role='{self.role}'"
            f")"
        )