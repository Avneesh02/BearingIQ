from pathlib import Path
import sys
import joblib

import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Test Dataset
# ==========================================================

test_df = pd.read_csv(
    "data/features/test_features_encoded.csv"
)

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_test = test_df.drop(columns=["Label"])

y_test = test_df["Label"]

# ==========================================================
# Load Baseline Models
# ==========================================================

models = {

    "Logistic Regression": joblib.load(
        "models/baseline/logistic_regression_baseline.pkl"
    ),

    "K-Nearest Neighbors": joblib.load(
        "models/baseline/knearest_neighbors_baseline.pkl"
    ),

    "Support Vector Machine": joblib.load(
        "models/baseline/support_vector_machine_baseline.pkl"
    ),

    "Decision Tree": joblib.load(
        "models/baseline/decision_tree_baseline.pkl"
    ),

    "Random Forest": joblib.load(
        "models/baseline/random_forest_baseline.pkl"
    ),

    "XGBoost": joblib.load(
        "models/baseline/xgboost_baseline.pkl"
    )

}

# ==========================================================
# Store Evaluation Results
# ==========================================================

results = []

# ==========================================================
# Evaluate Models
# ==========================================================

for model_name, model in models.items():

    print("\n")
    print("=" * 70)
    print(model_name)
    print("=" * 70)

    # ------------------------------------------------------
    # Prediction
    # ------------------------------------------------------

    y_pred = model.predict(X_test)

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

    print(f"Accuracy  : {accuracy:.4f}")

    print(f"Precision : {precision:.4f}")

    print(f"Recall    : {recall:.4f}")

    print(f"F1 Score  : {f1:.4f}")

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

    plt.title(model_name)

    plt.show()

    # ------------------------------------------------------
    # Store Results
    # ------------------------------------------------------

    results.append({

        "Model": model_name,

        "Accuracy": accuracy,

        "Precision": precision,

        "Recall": recall,

        "F1 Score": f1

    })

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
print("MODEL COMPARISON")
print("=" * 70)

print(results_df)

# ==========================================================
# Best Model
# ==========================================================

best_model = results_df.iloc[0]

print("\n")
print("=" * 70)
print("BEST BASELINE MODEL")
print("=" * 70)

print(f"Model      : {best_model['Model']}")
print(f"Accuracy   : {best_model['Accuracy']:.4f}")
print(f"Precision  : {best_model['Precision']:.4f}")
print(f"Recall     : {best_model['Recall']:.4f}")
print(f"F1 Score   : {best_model['F1 Score']:.4f}")