from pathlib import Path
import sys

import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

artifacts_folder = Path("artifacts")
artifacts_folder.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Load Train and Test Datasets
# ==========================================================

train_df = pd.read_csv("data/features/train_features_scaled.csv")
test_df = pd.read_csv("data/features/test_features_scaled.csv")

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_train = train_df.drop(columns=["Label"])
y_train = train_df["Label"]

X_test = test_df.drop(columns=["Label"])
y_test = test_df["Label"]

# ==========================================================
# Create Label Encoder
# ==========================================================

label_encoder = LabelEncoder()

# ==========================================================
# Fit ONLY on Training Labels
# ==========================================================

y_train_encoded = label_encoder.fit_transform(y_train)

# ==========================================================
# Transform Test Labels
# ==========================================================

y_test_encoded = label_encoder.transform(y_test)

# ==========================================================
# Display Label Mapping
# ==========================================================

print("=" * 70)
print("LABEL ENCODING")
print("=" * 70)

print("\nLabel Mapping\n")

for label, value in zip(
        label_encoder.classes_,
        label_encoder.transform(label_encoder.classes_)):

    print(f"{label:<15} ---> {value}")

# ==========================================================
# Create Encoded Training Dataset
# ==========================================================

train_encoded_df = X_train.copy()

train_encoded_df["Label"] = y_train_encoded

# ==========================================================
# Create Encoded Test Dataset
# ==========================================================

test_encoded_df = X_test.copy()

test_encoded_df["Label"] = y_test_encoded

# ==========================================================
# Display Dataset Information
# ==========================================================

print("\n")
print("=" * 70)
print("TRAIN DATASET")
print("=" * 70)

print("Shape :", train_encoded_df.shape)

print("\nFirst Five Rows")

print(train_encoded_df.head())

print("\n")

print("=" * 70)
print("TEST DATASET")
print("=" * 70)

print("Shape :", test_encoded_df.shape)

print("\nFirst Five Rows")

print(test_encoded_df.head())

# ==========================================================
# Save Encoded Datasets
# ==========================================================

train_encoded_df.to_csv(
    "data/features/train_features_encoded.csv",
    index=False
)

test_encoded_df.to_csv(
    "data/features/test_features_encoded.csv",
    index=False
)

# ==========================================================
# Save Label Encoder
# ==========================================================

joblib.dump(
    label_encoder,
    "models/label_encoder.pkl"
)

joblib.dump(
    label_encoder,
    artifacts_folder / "label_encoder.pkl"
)

print("\n")
print("=" * 70)
print("FILES SAVED SUCCESSFULLY")
print("=" * 70)

print("Train Dataset : data/features/train_features_encoded.csv")

print("Test Dataset  : data/features/test_features_encoded.csv")

print("Label Encoder : models/label_encoder.pkl")