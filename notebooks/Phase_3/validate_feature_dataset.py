from pathlib import Path
import pandas as pd
import numpy as np


def validate_feature_dataset(file_path):

    print("=" * 60)
    print(f"Validating : {Path(file_path).name}")
    print("=" * 60)

    df = pd.read_csv(file_path)

    # --------------------------------------------------
    # Dataset Shape
    # --------------------------------------------------

    print(f"\nRows    : {df.shape[0]}")
    print(f"Columns : {df.shape[1]}")

    # --------------------------------------------------
    # Missing Values
    # --------------------------------------------------

    missing_values = df.isnull().sum().sum()

    print(f"\nMissing Values : {missing_values}")

    # --------------------------------------------------
    # Infinite Values
    # --------------------------------------------------

    numeric_df = df.select_dtypes(include=[np.number])

    infinite_values = np.isinf(numeric_df).sum().sum()

    print(f"Infinite Values : {infinite_values}")

    # --------------------------------------------------
    # Duplicate Rows
    # --------------------------------------------------

    duplicate_rows = df.duplicated().sum()

    print(f"Duplicate Rows : {duplicate_rows}")

    # --------------------------------------------------
    # Label Distribution
    # --------------------------------------------------

    print("\nLabel Distribution")

    print(df["Label"].value_counts())

    # --------------------------------------------------
    # Feature Information
    # --------------------------------------------------

    print("\nFeature Columns")

    print(df.columns.tolist())

    # --------------------------------------------------
    # Validation Result
    # --------------------------------------------------

    if (
        missing_values == 0
        and infinite_values == 0
    ):
        print("\nDataset Validation : PASSED")
    else:
        print("\nDataset Validation : FAILED")

    print("\n")


# --------------------------------------------------
# Validate Training Dataset
# --------------------------------------------------

validate_feature_dataset(
    "data/features/train_features.csv"
)

# --------------------------------------------------
# Validate Testing Dataset
# --------------------------------------------------

validate_feature_dataset(
    "data/features/test_features.csv"
)