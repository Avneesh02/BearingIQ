from pathlib import Path
import sys
import joblib

import pandas as pd
import matplotlib.pyplot as plt

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Load Training Dataset
# ==========================================================

train_df = pd.read_csv(
    "data/features/train_features_encoded.csv"
)

X_train = train_df.drop(columns=["Label"])

# ==========================================================
# Load Final Tuned Model
# ==========================================================

model = joblib.load(
    "models/tuned/random_forest_tuned.pkl"
)

# ==========================================================
# Calculate Feature Importance
# ==========================================================

importance = model.feature_importances_

feature_importance = pd.DataFrame({

    "Feature": X_train.columns,

    "Importance": importance

})

feature_importance = feature_importance.sort_values(

    by="Importance",

    ascending=False

)

print("\n")

print("=" * 70)

print("FEATURE IMPORTANCE")

print("=" * 70)

print(feature_importance)

# ==========================================================
# Save CSV
# ==========================================================

Path("results").mkdir(

    exist_ok=True

)

feature_importance.to_csv(

    "results/feature_importance.csv",

    index=False

)

print("\nFeature Importance Saved Successfully")

# ==========================================================
# Plot
# ==========================================================

plt.figure(figsize=(10,7))

plt.barh(

    feature_importance["Feature"],

    feature_importance["Importance"]

)

plt.gca().invert_yaxis()

plt.xlabel("Importance")

plt.ylabel("Feature")

plt.title("Random Forest Feature Importance")

plt.tight_layout()

plt.show()