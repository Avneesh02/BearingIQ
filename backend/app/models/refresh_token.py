"""
==========================================================
BearingIQ
Refresh Token ORM Model
==========================================================
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
    text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class RefreshToken(Base):
    """
    SQLAlchemy ORM model for the refresh_tokens table.

    Stores hashed refresh tokens issued to authenticated users.
    """

    __tablename__ = "refresh_tokens"

    # ======================================================
    # Table Constraints
    # ======================================================

    __table_args__ = (

        # Token expiry must always be after creation time
        CheckConstraint(
            "expires_at > created_at",
            name="chk_refresh_token_expiry",
        ),

        # Revocation consistency
        CheckConstraint(
            "(is_revoked = FALSE AND revoked_at IS NULL) "
            "OR "
            "(is_revoked = TRUE AND revoked_at IS NOT NULL)",
            name="chk_revoked_consistency",
        ),

    )

    # ======================================================
    # Primary Key
    # ======================================================

    refresh_token_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ======================================================
    # User
    # ======================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ======================================================
    # Refresh Token Hash
    # ======================================================

    token_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    # ======================================================
    # JWT ID = jti
    # ======================================================

    jti: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    # ======================================================
    # Expiry
    # ======================================================

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    # ======================================================
    # Token Status
    # ======================================================

    is_revoked: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("FALSE"),
        nullable=False,
        index=True,
    )

    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ======================================================
    # Device Information
    # ======================================================

    device_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    user_agent: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # ======================================================
    # Timestamp
    # ======================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ======================================================
    # Relationship
    # ======================================================

    user: Mapped["User"] = relationship(
        back_populates="refresh_tokens",
    )

    # ======================================================
    # String Representation
    # ======================================================

    def __repr__(self) -> str:

        return (
            f"RefreshToken("
            f"id={self.refresh_token_id}, "
            f"user_id={self.user_id}, "
            f"jti='{self.jti}', "
            f"revoked={self.is_revoked}"
            f")"
        )