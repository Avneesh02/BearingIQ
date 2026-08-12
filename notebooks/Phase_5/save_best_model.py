from pathlib import Path
import shutil

# ==========================================================
# Create Final Model Folder
# ==========================================================

final_folder = Path("models/final")

final_folder.mkdir(

    parents=True,

    exist_ok=True

)

# ==========================================================
# Copy Best Tuned Model
# ==========================================================

source = Path(

    "models/tuned/random_forest_tuned.pkl"

)

destination = final_folder / "final_random_forest.pkl"

shutil.copy(

    source,

    destination

)

print("\n")

print("=" * 70)

print("FINAL MODEL SAVED")

print("=" * 70)

print(f"Source      : {source}")

print(f"Destination : {destination}")