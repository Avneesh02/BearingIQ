from pathlib import Path
import sys

import pandas as pd

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Train and Test Feature Datasets
# ==========================================================

train_df = pd.read_csv("data/features/train_features.csv")
test_df = pd.read_csv("data/features/test_features.csv")

# ==========================================================
# Features to Remove
# ==========================================================

features_to_remove = [
    "Variance",
    "Peak",
    "Spectral_Centroid"
]

# ==========================================================
# Remove Redundant Features
# ==========================================================

train_selected_df = train_df.drop(columns=features_to_remove)

test_selected_df = test_df.drop(columns=features_to_remove)

# ==========================================================
# Display Information
# ==========================================================

print("=" * 70)
print("TRAIN DATASET")
print("=" * 70)

print("\nOriginal Shape")
print(train_df.shape)

print("\nSelected Shape")
print(train_selected_df.shape)

print("\nRemaining Features")

for feature in train_selected_df.columns:
    print(feature)

print("\nTotal Remaining Features (excluding Label):")

print(len(train_selected_df.columns) - 1)

print("\n")

print("=" * 70)
print("TEST DATASET")
print("=" * 70)

print("\nOriginal Shape")
print(test_df.shape)

print("\nSelected Shape")
print(test_selected_df.shape)

print("\nRemaining Features")

for feature in test_selected_df.columns:
    print(feature)

print("\nTotal Remaining Features (excluding Label):")

print(len(test_selected_df.columns) - 1)

# ==========================================================
# Save Selected Datasets
# ==========================================================

train_selected_df.to_csv(
    "data/features/train_features_selected.csv",
    index=False
)

test_selected_df.to_csv(
    "data/features/test_features_selected.csv",
    index=False
)

# ==========================================================
# Success Message
# ==========================================================

print("\n")
print("=" * 70)
print("FILES SAVED SUCCESSFULLY")
print("=" * 70)

print("Train Dataset : data/features/train_features_selected.csv")
print("Test Dataset  : data/features/test_features_selected.csv")