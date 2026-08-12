"""
==========================================================
BearingIQ
Machine Learning Model ORM
==========================================================
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, List
from app.models.prediction import Prediction

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class MLModel(Base):
    """
    SQLAlchemy ORM model for the models table.
    """

    __tablename__ = "models"

    # ======================================================
    # Table Constraints
    # ======================================================

    __table_args__ = (

        # --------------------------------------------------
        # One model can have multiple versions
        # Example:
        # Random Forest v1
        # Random Forest v2
        # --------------------------------------------------

        UniqueConstraint(
            "model_name",
            "version",
            name="uq_model_name_version",
        ),

        # --------------------------------------------------
        # Metric Validation
        # --------------------------------------------------

        CheckConstraint(
            "accuracy BETWEEN 0 AND 100",
            name="chk_accuracy",
        ),

        CheckConstraint(
            "precision_score BETWEEN 0 AND 100",
            name="chk_precision",
        ),

        CheckConstraint(
            "recall_score BETWEEN 0 AND 100",
            name="chk_recall",
        ),

        CheckConstraint(
            "f1_score BETWEEN 0 AND 100",
            name="chk_f1",
        ),

        CheckConstraint(
            "cross_validation_accuracy IS NULL "
            "OR cross_validation_accuracy BETWEEN 0 AND 100",
            name="chk_cv_accuracy",
        ),

        # --------------------------------------------------
        # Only ONE active model
        # (PostgreSQL Partial Unique Index)
        # --------------------------------------------------

        Index(
            "idx_one_active_model",
            "is_active",
            unique=True,
            postgresql_where=text("is_active = TRUE"),
        ),
    )

    # ======================================================
    # Primary Key
    # ======================================================

    model_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # ======================================================
    # Model Information
    # ======================================================

    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    algorithm: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ======================================================
    # Performance Metrics
    # ======================================================

    accuracy: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    precision_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    recall_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    f1_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )

    cross_validation_accuracy: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )

    # ======================================================
    # Hyperparameters
    # ======================================================

    hyperparameters: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    # ======================================================
    # Active Model
    # ======================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("FALSE"),
        nullable=False,
    )

    # ======================================================
    # Model File
    # ======================================================

    model_path: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ======================================================
    # Timestamps
    # ======================================================

    trained_on: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ======================================================
    # Relationships
    # ======================================================

    predictions: Mapped[List["Prediction"]] = relationship(
        back_populates="model",
        cascade="all, delete-orphan",
    )

    # ======================================================
    # String Representation
    # ======================================================

    def __repr__(self) -> str:

        return (
            f"MLModel("
            f"id={self.model_id}, "
            f"name='{self.model_name}', "
            f"version='{self.version}', "
            f"algorithm='{self.algorithm}', "
            f"accuracy={self.accuracy}, "
            f"active={self.is_active}"
            f")"
        )