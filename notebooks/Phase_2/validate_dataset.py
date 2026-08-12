#Validate entire dataset

from pathlib import Path
import sys

import pandas as pd

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Metadata
# ==========================================================

metadata_path = Path("data/metadata/dataset_metadata.csv")

metadata_df = pd.read_csv(metadata_path)

# ==========================================================
# Dataset Validation Report
# ==========================================================

print("\n")
print("=" * 70)
print("DATASET VALIDATION REPORT")
print("=" * 70)

# ----------------------------------------------------------
# Total Files
# ----------------------------------------------------------

total_files = len(metadata_df)

print(f"\nTotal Files : {total_files}")

# ----------------------------------------------------------
# Duplicate Filenames
# ----------------------------------------------------------

duplicate_filenames = metadata_df["filename"].duplicated().sum()

print(f"Duplicate Filenames : {duplicate_filenames}")

# ----------------------------------------------------------
# Duplicate File IDs
# ----------------------------------------------------------

duplicate_file_ids = metadata_df["file_id"].duplicated().sum()

print(f"Duplicate File IDs : {duplicate_file_ids}")

# ----------------------------------------------------------
# Missing Values
# ----------------------------------------------------------

missing_values = metadata_df.isnull().sum().sum()

print(f"Missing Values : {missing_values}")

# ----------------------------------------------------------
# Signal Status
# ----------------------------------------------------------

print("\n")
print("=" * 70)
print("SIGNAL STATUS")
print("=" * 70)

print(metadata_df["status"].value_counts())

# ----------------------------------------------------------
# Label Distribution
# ----------------------------------------------------------

print("\n")
print("=" * 70)
print("LABEL DISTRIBUTION")
print("=" * 70)

print(metadata_df["label"].value_counts())

# ----------------------------------------------------------
# Fault Size Distribution
# ----------------------------------------------------------

print("\n")
print("=" * 70)
print("FAULT SIZE DISTRIBUTION")
print("=" * 70)

print(metadata_df["fault_size"].value_counts())

# ----------------------------------------------------------
# Load Distribution
# ----------------------------------------------------------

print("\n")
print("=" * 70)
print("LOAD DISTRIBUTION")
print("=" * 70)

print(metadata_df["load"].value_counts().sort_index())

# ----------------------------------------------------------
# Validation Summary
# ----------------------------------------------------------

print("\n")
print("=" * 70)
print("VALIDATION SUMMARY")
print("=" * 70)

validation_passed = True

if total_files != 40:
    print("❌ Expected 40 files.")
    validation_passed = False

if duplicate_filenames > 0:
    print("❌ Duplicate filenames found.")
    validation_passed = False

if duplicate_file_ids > 0:
    print("❌ Duplicate file IDs found.")
    validation_passed = False

if missing_values > 0:
    print("❌ Missing values found.")
    validation_passed = False

if metadata_df["status"].nunique() != 1 or metadata_df["status"].iloc[0] != "Valid":
    print("❌ Some signals are invalid.")
    validation_passed = False

expected_labels = {
    "Ball": 12,
    "Inner_Race": 12,
    "Outer_Race": 12,
    "Normal": 4
}

actual_labels = metadata_df["label"].value_counts().to_dict()

if actual_labels != expected_labels:
    print("❌ Label distribution mismatch.")
    validation_passed = False

expected_fault_sizes = {
    "0.007": 12,
    "0.014": 12,
    "0.021": 12,
    "Healthy": 4
}

actual_fault_sizes = metadata_df["fault_size"].value_counts().to_dict()

if actual_fault_sizes != expected_fault_sizes:
    print("❌ Fault size distribution mismatch.")
    validation_passed = False

expected_loads = {
    0: 10,
    1: 10,
    2: 10,
    3: 10
}

actual_loads = metadata_df["load"].value_counts().sort_index().to_dict()

if actual_loads != expected_loads:
    print("❌ Load distribution mismatch.")
    validation_passed = False

print("\n")

if validation_passed:
    print("✅ DATASET VALIDATION PASSED")
else:
    print("❌ DATASET VALIDATION FAILED")