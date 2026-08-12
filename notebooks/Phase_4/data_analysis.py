from pathlib import Path
import sys

import pandas as pd

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))


# --------------------------------------------------
# Load Feature Datasets
# --------------------------------------------------

train_df = pd.read_csv("data/features/train_features.csv")

test_df = pd.read_csv("data/features/test_features.csv")

# --------------------------------------------------
# Training Dataset
# --------------------------------------------------

print("=" * 60)
print("TRAINING DATASET")
print("=" * 60)

print("\nFirst Five Rows")
print(train_df.head())

print("\nShape")
print(train_df.shape)

print("\nColumn Names")
print(train_df.columns.tolist())

print("\nData Types")
print(train_df.dtypes)


# --------------------------------------------------
# Testing Dataset
# --------------------------------------------------

print("\n" + "=" * 60)
print("TESTING DATASET")
print("=" * 60)

print("\nFirst Five Rows")
print(test_df.head())

print("\nShape")
print(test_df.shape)

print("\nColumn Names")
print(test_df.columns.tolist())

print("\nData Types")
print(test_df.dtypes)