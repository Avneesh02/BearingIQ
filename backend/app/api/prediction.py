from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user

from app.models.user import User

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    PredictionHistoryResponse,
    PredictionDetailsResponse,
)

from app.services.prediction_service import prediction_service

# ==========================================================
# Router
# ==========================================================

router = APIRouter()

# ==========================================================
# Predict Bearing Fault
# ==========================================================

@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict bearing fault",
)
def predict(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict the bearing fault using the trained model.
    """
    return prediction_service.predict(
        db=db,
        user_id=current_user.user_id,
        request=request,
    )


@router.post(
    "/predict-random",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict using a random test sample",
)
def predict_random(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Demo endpoint: sample random features server-side and predict.
    """
    return prediction_service.predict_random(
        db=db,
        user_id=current_user.user_id,
    )


# ==========================================================
# Prediction History
# ==========================================================

@router.get(
    "/history",
    response_model=list[PredictionHistoryResponse],
    summary="Prediction history",
)
def prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return prediction history of the logged-in user.
    """
    return prediction_service.get_prediction_history(
        db=db,
        user_id=current_user.user_id,
    )


@router.delete(
    "/history",
    summary="Clear prediction history",
)
def clear_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete all prediction history for the logged-in user.
    """
    return prediction_service.clear_prediction_history(
        db=db,
        user_id=current_user.user_id,
    )


# ==========================================================
# Active ML Model
# ==========================================================

@router.get(
    "/model",
    summary="Active ML model",
)
def active_model(
    db: Session = Depends(get_db),
):
    """
    Return the active ML model.
    """

    model = prediction_service.get_active_model(db)

    return {
        "model_id": model.model_id,
        "model_name": model.model_name,
        "algorithm": model.algorithm,
        "version": model.version,
        "accuracy": float(model.accuracy),
        "precision_score": float(model.precision_score),
        "recall_score": float(model.recall_score),
        "f1_score": float(model.f1_score),
        "cross_validation_accuracy": (
            float(model.cross_validation_accuracy)
            if model.cross_validation_accuracy is not None
            else None
        ),
        "is_active": model.is_active,
        "trained_on": model.trained_on,
        "description": model.description,
        "model_path": model.model_path,
        "created_at": model.created_at,
        "updated_at": model.updated_at,
        "hyperparameters": model.hyperparameters,
    }


# ==========================================================
# Health Check
# ==========================================================

@router.get(
    "/health",
    summary="Prediction API Health",
)
def health():
    """
    Health endpoint.
    """
    return {
        "status": "Healthy",
        "service": "Prediction API",
    }


# ==========================================================
# Prediction Details
# IMPORTANT: Keep this route LAST
# ==========================================================

@router.get(
    "/{prediction_id}",
    response_model=PredictionDetailsResponse,
    summary="Prediction details",
)
def prediction_details(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return complete details of a single prediction.
    """
    return prediction_service.get_prediction_details(
        db=db,
        user_id=current_user.user_id,
        prediction_id=prediction_id,
    )