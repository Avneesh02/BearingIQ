"""
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

# ==========================================================
# Prediction Request
# ==========================================================

class PredictionRequest(BaseModel):
    """
    Request schema for model prediction.
    The frontend sends all extracted features.
    """

    features: dict[str, float] = Field(
        ...,
        description="Dictionary containing extracted feature values."
    )


# ==========================================================
# Prediction Response
# ==========================================================

class PredictionResponse(BaseModel):
    """
    Response returned after prediction.
    """

    prediction_id: int

    prediction: str

    prediction_class: int

    confidence: float

    probabilities: dict[str, float]

    shap_values: dict[str, float]

    top_features: dict[str, float]

    prediction_time: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# Prediction History
# ==========================================================

class PredictionHistoryResponse(BaseModel):
    """
    Response for prediction history.
    """

    prediction_id: int

    prediction: str

    confidence: float

    prediction_time: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# Prediction Details
# ==========================================================

class PredictionDetailsResponse(BaseModel):
    """
    Response returned when fetching
    a prediction by its ID.
    """

    prediction_id: int

    prediction: str

    prediction_class: int

    confidence: float

    probabilities: dict[str, float]

    shap_values: dict[str, float]

    top_features: dict[str, float]

    prediction_time: datetime

    model_config = ConfigDict(
        from_attributes=True
    )