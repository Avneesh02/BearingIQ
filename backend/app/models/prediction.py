"""
==========================================================
BearingIQ
Prediction ORM Model
==========================================================
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.ml_model import MLModel


class Prediction(Base):
    """
    SQLAlchemy ORM model for the predictions table.
    Stores every prediction made by the system.
    """

    __tablename__ = "predictions"

    # ======================================================
    # Table Constraints
    # ======================================================

    __table_args__ = (

        CheckConstraint(
            "prediction_confidence BETWEEN 0 AND 100",
            name="chk_prediction_confidence",
        ),

    )

    # ======================================================
    # Primary Key
    # ======================================================

    prediction_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ======================================================
    # Foreign Keys
    # ======================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.user_id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    model_id: Mapped[int] = mapped_column(
        ForeignKey(
            "models.model_id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    # ======================================================
    # Prediction Result
    # ======================================================

    predicted_label: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    prediction_confidence: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    # ======================================================
    # Probability Distribution
    # ======================================================

    class_probabilities: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )

    # ======================================================
    # Input Features
    # ======================================================

    input_features: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
    )

    # ======================================================
    # SHAP Explainability
    # ======================================================

    shap_values: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )

    top_features: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )

    # ======================================================
    # Timestamps
    # ======================================================

    prediction_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ======================================================
    # Relationships
    # ======================================================

    user: Mapped["User"] = relationship(
        back_populates="predictions",
    )

    model: Mapped["MLModel"] = relationship(
        back_populates="predictions",
    )

    # ======================================================
    # String Representation
    # ======================================================

    def __repr__(self) -> str:

        return (

            f"Prediction("

            f"id={self.prediction_id}, "

            f"user_id={self.user_id}, "

            f"model_id={self.model_id}, "

            f"label='{self.predicted_label}', "

            f"confidence={self.prediction_confidence}"

            f")"

        )