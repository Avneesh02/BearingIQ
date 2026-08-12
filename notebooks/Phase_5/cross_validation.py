from pathlib import Path
import sys
import joblib

import pandas as pd

from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_score
)

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Encoded Training Dataset
# ==========================================================

train_df = pd.read_csv(
    "data/features/train_features_encoded.csv"
)

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_train = train_df.drop(columns=["Label"])

y_train = train_df["Label"]

# ==========================================================
# Stratified K-Fold
# ==========================================================

skf = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

# ==========================================================
# Load Saved Baseline Models
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
# Store Results
# ==========================================================

results = []

# ==========================================================
# Cross Validation
# ==========================================================

print("\n")
print("=" * 70)
print("5-FOLD STRATIFIED CROSS VALIDATION")
print("=" * 70)

for model_name, model in models.items():

    print(f"\nRunning {model_name}...")

    scores = cross_val_score(

        estimator=model,

        X=X_train,

        y=y_train,

        cv=skf,

        scoring="accuracy",

        n_jobs=-1

    )

    scores = pd.Series(scores)

    print("\nFold Accuracies")

    for i, score in enumerate(scores, start=1):

        print(f"Fold {i} : {score:.4f}")

    print(f"\nMean Accuracy      : {scores.mean():.4f}")

    print(f"Standard Deviation : {scores.std():.4f}")

    results.append({

        "Model": model_name,

        "Mean Accuracy": scores.mean(),

        "Standard Deviation": scores.std()

    })

# ==========================================================
# Model Comparison
# ==========================================================

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="Mean Accuracy",
    ascending=False
)

print("\n")
print("=" * 70)
print("CROSS VALIDATION RESULTS")
print("=" * 70)

print(results_df)







'''"Cross-validation was performed on the training windows, 
while the final evaluation was performed on completely unseen files. 
Since multiple windows are extracted from each vibration signal, 
the windows within the training set are more similar to each other than the independent test files. 
Because of that, the cross-validation score is naturally higher. 
I relied on the held-out file-level test set as the final performance indicator."'''