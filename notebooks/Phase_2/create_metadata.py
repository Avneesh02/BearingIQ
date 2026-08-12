# ==========================================================
# CREATE DATASET METADATA
# ==========================================================

from pathlib import Path
import sys

# ----------------------------------------------------------
# Add Project Root to Python Path
# ----------------------------------------------------------

project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

# ----------------------------------------------------------
# Imports
# ----------------------------------------------------------

import numpy as np
import pandas as pd

from src.data_loader.loader import BearingDataLoader
from src.validation.validator import SignalValidator

# ----------------------------------------------------------
# Create Loader
# ----------------------------------------------------------

loader = BearingDataLoader()

# ----------------------------------------------------------
# Dataset Folder
# ----------------------------------------------------------

data_folder = Path("data/raw")

# ----------------------------------------------------------
# Store Metadata
# ----------------------------------------------------------

metadata = []

# ==========================================================
# Iterate Through Every Class Folder
# ==========================================================

for class_folder in sorted(data_folder.iterdir()):

    if not class_folder.is_dir():
        continue

    label = class_folder.name

    print(f"\nProcessing {label}...")

    # ------------------------------------------------------
    # Read Every MAT File
    # ------------------------------------------------------

    for file_path in sorted(class_folder.glob("*.mat")):

        try:

            # --------------------------------------------------
            # Load Signal
            # --------------------------------------------------

            signal = loader.load_signal(file_path)

            # --------------------------------------------------
            # Validate Signal
            # --------------------------------------------------

            is_valid, status = SignalValidator.validate(signal)

            # --------------------------------------------------
            # Extract File Information
            # --------------------------------------------------

            filename = file_path.stem

            # Remove @6 if present
            filename = filename.replace("@6", "")

            parts = filename.split("_")

            file_id = int(parts[0])

            load = int(parts[1])

            # --------------------------------------------------
            # Determine Fault Size
            # --------------------------------------------------

            if label == "Normal":

                fault_size = "Healthy"

            elif file_id in range(105, 109) or \
                 file_id in range(118, 122) or \
                 file_id in range(130, 134):

                fault_size = "0.007"

            elif file_id in range(169, 173) or \
                 file_id in range(185, 189) or \
                 file_id in range(197, 201):

                fault_size = "0.014"

            elif file_id in range(209, 213) or \
                 file_id in range(222, 226) or \
                 file_id in range(234, 238):

                fault_size = "0.021"

            else:

                fault_size = "Unknown"

            # --------------------------------------------------
            # Store Metadata
            # --------------------------------------------------

            metadata.append({

                "filename": file_path.name,

                "file_id": file_id,

                "label": label,

                "fault_size": fault_size,

                "load": load,

                "samples": len(signal),

                "min": np.min(signal),

                "max": np.max(signal),

                "mean": np.mean(signal),

                "std": np.std(signal),

                "status": status

            })

        except Exception as e:

            metadata.append({

                "filename": file_path.name,

                "file_id": None,

                "label": label,

                "fault_size": None,

                "load": None,

                "samples": 0,

                "min": None,

                "max": None,

                "mean": None,

                "std": None,

                "status": str(e)

            })

# ==========================================================
# Convert to DataFrame
# ==========================================================

metadata_df = pd.DataFrame(metadata)

# ==========================================================
# Sort Metadata
# ==========================================================

metadata_df = metadata_df.sort_values(
    by=["label", "file_id"]
).reset_index(drop=True)

# ==========================================================
# Create Output Folder
# ==========================================================

output_folder = Path("data/metadata")
output_folder.mkdir(parents=True, exist_ok=True)

# ==========================================================
# Save Metadata
# ==========================================================

output_file = output_folder / "dataset_metadata.csv"

metadata_df.to_csv(
    output_file,
    index=False
)

# ==========================================================
# Display Summary
# ==========================================================

print("\n")
print("=" * 70)
print("FIRST FIVE ROWS")
print("=" * 70)

print(metadata_df.head())

print("\n")
print("=" * 70)
print("LABEL DISTRIBUTION")
print("=" * 70)

print(metadata_df["label"].value_counts())

print("\n")
print("=" * 70)
print("FAULT SIZE DISTRIBUTION")
print("=" * 70)

print(metadata_df["fault_size"].value_counts())

print("\n")
print("=" * 70)
print("LOAD DISTRIBUTION")
print("=" * 70)

print(metadata_df["load"].value_counts().sort_index())

print("\n")
print("=" * 70)
print("SIGNAL STATUS")
print("=" * 70)

print(metadata_df["status"].value_counts())

print("\n")
print("=" * 70)
print("TOTAL FILES")
print("=" * 70)

print(len(metadata_df))

print(f"\nMetadata saved successfully at:\n{output_file}")