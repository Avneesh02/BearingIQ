from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

# ==========================================================
# Load Metadata
# ==========================================================

metadata_folder = Path("data/metadata")

metadata_df = pd.read_csv(
    metadata_folder / "dataset_metadata.csv"
)

# ==========================================================
# Keep Only Valid Signals
# ==========================================================

metadata_df = metadata_df[
    metadata_df["status"] == "Valid"
].copy()

# ==========================================================
# Create File Path
# ==========================================================

metadata_df["filepath"] = (
    "data/raw/"
    + metadata_df["label"]
    + "/"
    + metadata_df["filename"]
)

# ==========================================================
# Train-Test Split (File Level)
# ==========================================================

train_df, test_df = train_test_split(

    metadata_df,

    test_size=0.33,

    stratify=metadata_df["label"],

    shuffle=True,

    random_state=42

)

# ==========================================================
# Reset Index
# ==========================================================

train_df = train_df.reset_index(drop=True)

test_df = test_df.reset_index(drop=True)

# ==========================================================
# Sort for Better Readability
# ==========================================================

train_df = train_df.sort_values(
    by=["label", "file_id"]
)

test_df = test_df.sort_values(
    by=["label", "file_id"]
)

# ==========================================================
# Save Files
# ==========================================================

train_df.to_csv(
    metadata_folder / "train_files.csv",
    index=False
)

test_df.to_csv(
    metadata_folder / "test_files.csv",
    index=False
)

# ==========================================================
# Dataset Summary
# ==========================================================

print("\n")
print("=" * 70)
print("DATASET SPLIT COMPLETED")
print("=" * 70)

print(f"\nTraining Files : {len(train_df)}")

print(f"Testing Files  : {len(test_df)}")

print(f"Total Files    : {len(train_df) + len(test_df)}")

# ==========================================================
# Training Distribution
# ==========================================================

print("\n")
print("=" * 70)
print("TRAINING LABEL DISTRIBUTION")
print("=" * 70)

print(train_df["label"].value_counts())

# ==========================================================
# Testing Distribution
# ==========================================================

print("\n")
print("=" * 70)
print("TESTING LABEL DISTRIBUTION")
print("=" * 70)

print(test_df["label"].value_counts())

# ==========================================================
# Verify No Missing Files
# ==========================================================

print("\n")
print("=" * 70)
print("VERIFICATION")
print("=" * 70)

print(
    "Files Preserved :",
    len(train_df) + len(test_df) == len(metadata_df)
)

print(
    "Duplicate Files :",
    pd.concat([train_df, test_df])["filename"].duplicated().sum()
)