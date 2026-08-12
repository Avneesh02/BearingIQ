from pathlib import Path
import sys
import joblib

import pandas as pd
import matplotlib.pyplot as plt

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from sklearn.model_selection import GridSearchCV

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

from sklearn.utils.class_weight import compute_sample_weight

from xgboost import XGBClassifier

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Create Folder
# ==========================================================

models_path = Path("models/tuned")

models_path.mkdir(
    parents=True,
    exist_ok=True
)

# ==========================================================
# Load Dataset
# ==========================================================

train_df = pd.read_csv("data/features/train_features_encoded.csv")
test_df = pd.read_csv("data/features/test_features_encoded.csv")

# ==========================================================
# Separate Features & Labels
# ==========================================================

X_train = train_df.drop(columns=["Label"])
y_train = train_df["Label"]

X_test = test_df.drop(columns=["Label"])
y_test = test_df["Label"]

# ==========================================================
# Sample Weight
# ==========================================================

sample_weights = compute_sample_weight(
    class_weight="balanced",
    y=y_train
)

# ==========================================================
# Models
# ==========================================================

models = {
    "Decision Tree": (
        DecisionTreeClassifier(
            class_weight="balanced",
            random_state=42
        ),
        {
            "criterion": ["gini", "entropy"],
            "max_depth": [None, 5, 10, 15, 20, 30],
            "min_samples_split": [2, 5, 10, 20],
            "min_samples_leaf": [1, 2, 4, 8],
            "max_features": [None, "sqrt", "log2"]
        }
    ),
    "Random Forest": (
        RandomForestClassifier(
            class_weight="balanced",
            random_state=42
        ),
        {
            "n_estimators": [100, 200, 300, 500],
            "max_depth": [None, 10, 20, 30, 40],
            "min_samples_split": [2, 5, 10],
            "min_samples_leaf": [1, 2, 4],
            "max_features": ["sqrt", "log2", None],
            "bootstrap": [True, False]
        }
    ),
    "Support Vector Machine": (
        SVC(
            class_weight="balanced",
            random_state=42
        ),
        {
        "C": [0.01, 0.1, 1, 10, 100],
        "kernel": ["linear", "rbf"],
        "gamma": ["scale", "auto", 0.01, 0.001]
        }
    ),
    "XGBoost": (
        XGBClassifier(
            objective="multi:softprob",
            num_class=len(y_train.unique()),
            random_state=42,
            eval_metric="mlogloss"
        ),
        {
            "n_estimators": [100, 200,300],
            "max_depth": [3, 5, 7, 9],
            "learning_rate": [0.01, 0.05, 0.1, 0.2],
            "subsample": [0.8, 0.9, 1.0],
            "colsample_bytree": [0.8, 1.0]
        }
    )
}

results = []

print("\n")
print("=" * 70)
print("HYPERPARAMETER TUNING")
print("=" * 70)

# ==========================================================
# Tune Models
# ==========================================================

for model_name, (model, parameters) in models.items():

    print("\n")

    print("=" * 70)

    print(model_name)

    print("=" * 70)

    grid_search = GridSearchCV(

        estimator=model,

        param_grid=parameters,

        scoring="accuracy",

        cv=5,

        n_jobs=-1,

        verbose=2

    )

    # ------------------------------------------------------
    # Train Model
    # ------------------------------------------------------

    if model_name == "XGBoost":

        grid_search.fit(

            X_train,

            y_train,

            sample_weight=sample_weights

        )

    else:

        grid_search.fit(

            X_train,

            y_train

        )

    # ------------------------------------------------------
    # Best Model
    # ------------------------------------------------------

    best_model = grid_search.best_estimator_

    print("\nBest Parameters")

    print(grid_search.best_params_)

    print(f"\nBest Cross Validation Accuracy : {grid_search.best_score_:.4f}")

    # ------------------------------------------------------
    # Prediction
    # ------------------------------------------------------

    y_pred = best_model.predict(X_test)

    # ------------------------------------------------------
    # Evaluation Metrics
    # ------------------------------------------------------

    accuracy = accuracy_score(

        y_test,

        y_pred

    )

    precision = precision_score(

        y_test,

        y_pred,

        average="weighted"

    )

    recall = recall_score(

        y_test,

        y_pred,

        average="weighted"

    )

    f1 = f1_score(

        y_test,

        y_pred,

        average="weighted"

    )

    # ------------------------------------------------------
    # Print Metrics
    # ------------------------------------------------------

    print("\n")

    print(f"Test Accuracy  : {accuracy:.4f}")

    print(f"Precision      : {precision:.4f}")

    print(f"Recall         : {recall:.4f}")

    print(f"F1 Score       : {f1:.4f}")

    # ------------------------------------------------------
    # Classification Report
    # ------------------------------------------------------

    print("\nClassification Report\n")

    print(

        classification_report(

            y_test,

            y_pred

        )

    )

    # ------------------------------------------------------
    # Confusion Matrix
    # ------------------------------------------------------

    cm = confusion_matrix(

        y_test,

        y_pred

    )

    disp = ConfusionMatrixDisplay(

        confusion_matrix=cm

    )

    disp.plot(

        cmap="Blues",

        values_format="d"

    )

    plt.title(

        model_name + " (Tuned)"

    )

    plt.show()

    # ------------------------------------------------------
    # Save Tuned Model
    # ------------------------------------------------------

    filename = (

        model_name.lower()

        .replace(" ", "_")

        .replace("-", "")

        + "_tuned.pkl"

    )

    joblib.dump(

        best_model,

        models_path / filename

    )

    print("\nModel Saved Successfully")

    # ------------------------------------------------------
    # Store Results
    # ------------------------------------------------------

    results.append(

        {

            "Model": model_name,

            "Accuracy": accuracy,

            "Precision": precision,

            "Recall": recall,

            "F1 Score": f1,

            "Best Parameters": str(

                grid_search.best_params_

            )

        }

    )

    # ==========================================================
# Model Comparison
# ==========================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(

    by="Accuracy",

    ascending=False

)

print("\n")

print("=" * 70)

print("TUNED MODEL COMPARISON")

print("=" * 70)

print(results_df)

# ==========================================================
# Save Comparison Table
# ==========================================================

results_df.to_csv(

    "models/tuned/tuned_model_results.csv",

    index=False

)

print("\nComparison Table Saved Successfully")

# ==========================================================
# Best Tuned Model
# ==========================================================

best_model = results_df.iloc[0]

print("\n")

print("=" * 70)

print("BEST TUNED MODEL")

print("=" * 70)

print(f"Model      : {best_model['Model']}")

print(f"Accuracy   : {best_model['Accuracy']:.4f}")

print(f"Precision  : {best_model['Precision']:.4f}")

print(f"Recall     : {best_model['Recall']:.4f}")

print(f"F1 Score   : {best_model['F1 Score']:.4f}")

print("\nBest Hyperparameters")

print(best_model["Best Parameters"])

print("\n")

print("=" * 70)

print("HYPERPARAMETER TUNING COMPLETED SUCCESSFULLY")

print("=" * 70)