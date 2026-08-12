"""
==========================================================
BearingIQ
Prediction Service
==========================================================
"""

from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
import shap
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import (
    FEATURE_PATH,
    LABEL_ENCODER_PATH,
    MODEL_PATH,
    SCALER_PATH,
)
from app.models.ml_model import MLModel
from app.models.prediction import Prediction
from app.schemas.prediction import (
    PredictionHistoryResponse,
    PredictionRequest,
    PredictionResponse,
)


class PredictionService:
    """
    Handles all prediction related operations.
    """

    # ======================================================
    # Initialize
    # ======================================================

    def __init__(self) -> None:
        self.model = joblib.load(MODEL_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        self.feature_list = pd.read_csv(FEATURE_PATH)["Feature"].tolist()
        self.explainer = shap.TreeExplainer(self.model)

    # ======================================================
    # Prepare Features
    # ======================================================

    def _prepare_features(
        self,
        request: PredictionRequest,
    ) -> pd.DataFrame:
        """
        Validate, reorder, and scale features using the
        StandardScaler fitted during training.
        """
        received = request.features

        missing = [
            feature for feature in self.feature_list if feature not in received
        ]

        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing features: {missing}",
            )

        # Reorder to match training column order
        ordered = {
            feature: received[feature] for feature in self.feature_list
        }

        raw_df = pd.DataFrame([ordered])

        # Apply the same StandardScaler used during training
        scaled_array = self.scaler.transform(raw_df)
        scaled_df = pd.DataFrame(scaled_array, columns=self.feature_list)

        return scaled_df

    # ======================================================
    # Predict
    # ======================================================

    def predict(
        self,
        db: Session,
        user_id: int,
        request: PredictionRequest,
    ) -> PredictionResponse:
        """
        Perform prediction using the trained model.
        """
        # --------------------------------------------------
        # Prepare Input
        # --------------------------------------------------
        input_df = self._prepare_features(request)

        # --------------------------------------------------
        # Predict Class
        # --------------------------------------------------
        predicted_class = int(self.model.predict(input_df)[0])
        prediction = self.label_encoder.inverse_transform([predicted_class])[0]

        # --------------------------------------------------
        # Prediction Probability
        # --------------------------------------------------
        probabilities = self.model.predict_proba(input_df)[0]
        confidence = round(float(probabilities.max() * 100), 2)

        class_names = self.label_encoder.inverse_transform(self.model.classes_)
        probability_dict = {
            str(label): round(float(prob) * 100, 2)
            for label, prob in zip(class_names, probabilities)
        }

        # --------------------------------------------------
        # SHAP Values
        # --------------------------------------------------
        shap_result = self.explainer(input_df)
        predicted_index = predicted_class
        shap_vector = shap_result.values[0, :, predicted_index]

        shap_dict = {
            feature: round(float(value), 4)
            for feature, value in zip(self.feature_list, shap_vector)
        }

        # --------------------------------------------------
        # Active Model
        # --------------------------------------------------
        active_model = self.get_active_model(db)

        # --------------------------------------------------
        # Save Prediction
        # --------------------------------------------------
        top_features = dict(
            sorted(
                shap_dict.items(),
                key=lambda item: abs(item[1]),
                reverse=True,
            )[:5]
        )
        
        
        prediction_row = Prediction(
            user_id=user_id,
            model_id=active_model.model_id,
            predicted_label=prediction,
            prediction_confidence=confidence,
            class_probabilities=probability_dict,
            input_features=request.features,
            shap_values=shap_dict,
            top_features=top_features,
        )

        db.add(prediction_row)
        db.commit()
        db.refresh(prediction_row)

        # --------------------------------------------------
        # Top 5 Important Features
        # --------------------------------------------------
        # top_features = dict(
        #     sorted(
        #         shap_dict.items(),
        #         key=lambda item: abs(item[1]),
        #         reverse=True,
        #     )[:5]
        # )

        # --------------------------------------------------
        # Return Response
        # --------------------------------------------------
        return PredictionResponse(
            prediction_id=prediction_row.prediction_id,
            prediction=prediction,
            prediction_class=predicted_class,
            confidence=confidence,
            probabilities=probability_dict,
            shap_values=shap_dict,
            top_features=top_features,
            prediction_time=prediction_row.prediction_time,
        )

    # ======================================================
    # Random Demo Prediction
    # ======================================================

    def predict_random(
        self,
        db: Session,
        user_id: int,
    ) -> PredictionResponse:
        """
        Pick a random feature row from the test dataset and predict.
        Used by the frontend random demo CSV upload.
        """
        test_data_path = (
            Path(__file__).resolve().parents[3]
            / "data"
            / "features"
            / "test_features_selected.csv"
        )

        if not test_data_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test feature dataset not found on server.",
            )

        test_df = pd.read_csv(test_data_path)
        row = test_df.sample(n=1).iloc[0]
        features = {name: float(row[name]) for name in self.feature_list}

        return self.predict(
            db=db,
            user_id=user_id,
            request=PredictionRequest(features=features),
        )

    # ======================================================
    # Prediction History
    # ======================================================

    def get_prediction_history(
        self,
        db: Session,
        user_id: int,
    ) -> list[PredictionHistoryResponse]:
        """
        Return prediction history of the user.
        """
        predictions = (
            db.query(Prediction)
            .filter(Prediction.user_id == user_id)
            .order_by(Prediction.prediction_time.desc())
            .all()
        )

        return [
            PredictionHistoryResponse(
                prediction_id=item.prediction_id,
                prediction=item.predicted_label,
                confidence=float(item.prediction_confidence),
                prediction_time=item.prediction_time,
            )
            for item in predictions
        ]

    def clear_prediction_history(
        self,
        db: Session,
        user_id: int,
    ) -> dict[str, int]:
        """
        Delete all predictions for the user.
        """
        deleted_count = (
            db.query(Prediction)
            .filter(Prediction.user_id == user_id)
            .delete(synchronize_session=False)
        )
        db.commit()
        return {"deleted_count": deleted_count}

    # ======================================================
    # Prediction Details
    # ======================================================

    def get_prediction_details(
        self,
        db: Session,
        user_id: int,
        prediction_id: int,
    ):
        """
        Return complete details of a single prediction.
        """

        prediction = (
            db.query(Prediction)
            .filter(
                Prediction.prediction_id == prediction_id,
                Prediction.user_id == user_id,
            )
            .first()
        )

        if prediction is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prediction not found.",
            )

        return PredictionResponse(
            prediction_id=prediction.prediction_id,
            prediction=prediction.predicted_label,
            prediction_class=0,
            confidence=float(prediction.prediction_confidence),
            probabilities=prediction.class_probabilities,
            shap_values=prediction.shap_values,
            top_features=prediction.top_features,
            prediction_time=prediction.prediction_time,
        )

    # ======================================================
    # Active Model
    # ======================================================

    def get_active_model(
        self,
        db: Session,
    ) -> MLModel:

        model = (
            db.query(MLModel)
            .filter(MLModel.is_active.is_(True))
            .first()
        )

        if model is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active model found.",
            )

        return model


# ======================================================
# Prediction Service Instance
# ======================================================

prediction_service = PredictionService()
    