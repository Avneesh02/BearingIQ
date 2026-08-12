from pathlib import Path
import sys
import joblib

import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from sklearn.utils.class_weight import compute_sample_weight

from xgboost import XGBClassifier

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Create Models Directory
# ==========================================================

models_path = Path("models/baseline")
models_path.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Load Train and Test Datasets
# ==========================================================

train_df = pd.read_csv("data/features/train_features_encoded.csv")
test_df = pd.read_csv("data/features/test_features_encoded.csv")

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_train = train_df.drop(columns=["Label"])
y_train = train_df["Label"]

X_test = test_df.drop(columns=["Label"])
y_test = test_df["Label"]

# ==========================================================
# Display Dataset Information
# ==========================================================

print("=" * 70)
print("TRAIN DATASET")
print("=" * 70)

print(f"X_train Shape : {X_train.shape}")
print(f"y_train Shape : {y_train.shape}")

print("\nLabel Distribution")

print(y_train.value_counts().sort_index())

print("\n")

print("=" * 70)
print("TEST DATASET")
print("=" * 70)

print(f"X_test Shape : {X_test.shape}")
print(f"y_test Shape : {y_test.shape}")

print("\nLabel Distribution")

print(y_test.value_counts().sort_index())

# ==========================================================
# Compute Sample Weights for XGBoost
# ==========================================================

sample_weights = compute_sample_weight(
    class_weight="balanced",
    y=y_train
)

# ==========================================================
# Create Baseline Models
# ==========================================================

models = {

    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        random_state=42,
        max_iter=1000
    ),

    "K-Nearest Neighbors": KNeighborsClassifier(
        n_neighbors=5
    ),

    "Support Vector Machine": SVC(
        class_weight="balanced",
        random_state=42
    ),

    "Decision Tree": DecisionTreeClassifier(
        class_weight="balanced",
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42
    ),

    "XGBoost": XGBClassifier(
        objective="multi:softprob",
        num_class=len(y_train.unique()),
        random_state=42,
        eval_metric="mlogloss"
    )

}

# ==========================================================
# Store Trained Models
# ==========================================================

trained_models = {}

# ==========================================================
# Train Models
# ==========================================================

print("\n")
print("=" * 70)
print("TRAINING BASELINE MODELS")
print("=" * 70)

for model_name, model in models.items():

    print(f"\nTraining {model_name}...")

    if model_name == "XGBoost":

        model.fit(
            X_train,
            y_train,
            sample_weight=sample_weights
        )

    else:

        model.fit(
            X_train,
            y_train
        )

    trained_models[model_name] = model

    # ======================================================
    # Save Baseline Model
    # ======================================================

    filename = (
        model_name.lower()
        .replace(" ", "_")
        .replace("-", "")
        + "_baseline.pkl"
    )

    joblib.dump(
        model,
        models_path / filename
    )

    print(f"{model_name} trained successfully.")

print("\n")
print("=" * 70)
print("ALL MODELS TRAINED SUCCESSFULLY")
print("=" * 70)

# ==========================================================
# Verify Models (Temporary Debugging)
# ==========================================================

print("\n")
print("=" * 70)
print("MODEL VERIFICATION")
print("=" * 70)

for model_name, model in trained_models.items():

    prediction = model.predict(X_test)

    print(f"\n{model_name}")

    print("-" * 40)

    print("First 10 Predictions")

    print(prediction[:10])

    print("\nPrediction Distribution")

    print(pd.Series(prediction).value_counts().sort_index())

    print("\nUnique Predicted Classes")

    print(sorted(pd.Series(prediction).unique()))