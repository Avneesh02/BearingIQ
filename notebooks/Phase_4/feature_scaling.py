from pathlib import Path
import sys

import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Train and Test Datasets
# ==========================================================

train_df = pd.read_csv("data/features/train_features_selected.csv")
test_df = pd.read_csv("data/features/test_features_selected.csv")

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_train = train_df.drop(columns=["Label"])
y_train = train_df["Label"]

X_test = test_df.drop(columns=["Label"])
y_test = test_df["Label"]

# ==========================================================
# Create StandardScaler
# ==========================================================

scaler = StandardScaler()

# ==========================================================
# Fit ONLY on Training Data
# ==========================================================

X_train_scaled = scaler.fit_transform(X_train)

# ==========================================================
# Transform Test Data
# ==========================================================

X_test_scaled = scaler.transform(X_test)

# ==========================================================
# Convert Back to DataFrames
# ==========================================================

train_scaled_df = pd.DataFrame(
    X_train_scaled,
    columns=X_train.columns
)

test_scaled_df = pd.DataFrame(
    X_test_scaled,
    columns=X_test.columns
)

# ==========================================================
# Add Labels Back
# ==========================================================

train_scaled_df["Label"] = y_train.values
test_scaled_df["Label"] = y_test.values

# ==========================================================
# Display Results
# ==========================================================

print("=" * 70)
print("TRAIN DATASET")
print("=" * 70)

print("Shape :", train_scaled_df.shape)

print("\nFirst Five Rows")

print(train_scaled_df.head())

print("\n")

print("=" * 70)
print("TEST DATASET")
print("=" * 70)

print("Shape :", test_scaled_df.shape)

print("\nFirst Five Rows")

print(test_scaled_df.head())

# ==========================================================
# Save Scaled Datasets
# ==========================================================

train_scaled_df.to_csv(
    "data/features/train_features_scaled.csv",
    index=False
)

test_scaled_df.to_csv(
    "data/features/test_features_scaled.csv",
    index=False
)

# ==========================================================
# Save StandardScaler
# ==========================================================

joblib.dump(
    scaler,
    "models/standard_scaler.pkl"
)

# ==========================================================
# Success Message
# ==========================================================

print("\n")
print("=" * 70)
print("FILES SAVED SUCCESSFULLY")
print("=" * 70)

print("Train Dataset : data/features/train_features_scaled.csv")
print("Test Dataset  : data/features/test_features_scaled.csv")
print("Scaler        : models/standard_scaler.pkl")