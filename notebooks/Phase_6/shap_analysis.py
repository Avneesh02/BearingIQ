from pathlib import Path
import sys
import joblib

import pandas as pd
import shap

# ==========================================================
# Add Project Root
# ==========================================================

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# ==========================================================
# Create Results Folder
# ==========================================================

results_folder = Path("results/shap")

results_folder.mkdir(
    parents=True,
    exist_ok=True
)

# ==========================================================
# Load Test Dataset
# ==========================================================

test_df = pd.read_csv(
    "data/features/test_features_encoded.csv"
)

# ==========================================================
# Separate Features and Labels
# ==========================================================

X_test = test_df.drop(
    columns=["Label"]
)

y_test = test_df["Label"]

# ==========================================================
# Load Final Random Forest Model
# ==========================================================

model = joblib.load(
    "models/final/final_random_forest.pkl"
)

print("\n")
print("=" * 70)
print("SHAP ANALYSIS")
print("=" * 70)

print("\nFinal Random Forest Model Loaded Successfully")

print(f"\nTotal Test Samples : {len(X_test)}")

print(f"Total Features     : {X_test.shape[1]}")

# ==========================================================
# Load Label Encoder
# ==========================================================

label_encoder = joblib.load(
    "artifacts/label_encoder.pkl"
)
# ==========================================================
# Select One Sample
# ==========================================================

sample_index = 0

sample = X_test.iloc[[sample_index]]

actual_label = label_encoder.inverse_transform(
    [y_test.iloc[sample_index]]
)[0]

# ==========================================================
# Predict Class
# ==========================================================

predicted_label = label_encoder.inverse_transform(
    model.predict(sample)
)[0]

prediction_probability = model.predict_proba(sample)[0]

classes = label_encoder.inverse_transform(
    model.classes_
)

# ==========================================================
# Display Prediction
# ==========================================================

print("\n")
print("=" * 70)
print("SAMPLE PREDICTION")
print("=" * 70)

print(f"Sample Number      : {sample_index}")

print(f"Actual Label       : {actual_label}")

print(f"Predicted Label    : {predicted_label}")

print("\nPrediction Confidence")

for class_name, probability in zip(classes, prediction_probability):

    print(f"{class_name:<15} : {probability * 100:.2f}%")

# ==========================================================
# Create SHAP Explainer
# ==========================================================

print("\nCreating SHAP Explainer...")

explainer = shap.TreeExplainer(model)

print("SHAP Explainer Created Successfully")

# ==========================================================
# Calculate SHAP Values
# ==========================================================

print("\nCalculating SHAP Values...")

shap_values = explainer(X_test)
print(type(shap_values))
print(shap_values.values.shape)

print("SHAP Values Calculated Successfully")

print("\n")

print("=" * 70)
print("PART 1 COMPLETED")
print("=" * 70)



import matplotlib.pyplot as plt

# ==========================================================
# SHAP Summary Plot (Global Explanation)
# ==========================================================

print("\n")
print("=" * 70)
print("GENERATING SHAP SUMMARY PLOT")
print("=" * 70)

plt.figure(figsize=(12, 8))

# ==========================================================
# Explain Predicted Class
# ==========================================================

predicted_class_index = model.predict(sample)[0]

plt.figure(figsize=(12, 8))

shap.plots.beeswarm(

    shap_values[:, :, predicted_class_index],

    max_display=17,

    show=False

)

plt.tight_layout()

summary_plot_path = results_folder / "shap_summary.png"

plt.savefig(
    summary_plot_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print("\nSHAP Summary Plot Saved Successfully")

print(summary_plot_path)

# ==========================================================
# SHAP Feature Importance (Bar Plot)
# ==========================================================

print("\n")
print("=" * 70)
print("GENERATING SHAP FEATURE IMPORTANCE")
print("=" * 70)

plt.figure(figsize=(10, 8))

plt.figure(figsize=(10, 8))

shap.plots.bar(

    shap_values[:, :, predicted_class_index],

    max_display=17,

    show=False

)

plt.tight_layout()

bar_plot_path = results_folder / "shap_feature_importance.png"

plt.savefig(
    bar_plot_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print("\nSHAP Feature Importance Plot Saved Successfully")

print(bar_plot_path)

print("\n")
print("=" * 70)
print("PART 2 COMPLETED")
print("=" * 70)

import matplotlib.pyplot as plt

# ==========================================================
# SHAP Waterfall Plot (Local Explanation)
# ==========================================================

print("\n")
print("=" * 70)
print("GENERATING SHAP WATERFALL PLOT")
print("=" * 70)

# ----------------------------------------------------------
# Explain the selected sample for the predicted class
# ----------------------------------------------------------

waterfall_explanation = shap_values[
    sample_index, :, predicted_class_index
]

plt.figure(figsize=(10, 8))

shap.plots.waterfall(
    waterfall_explanation,
    max_display=17,
    show=False
)

waterfall_plot_path = results_folder / "shap_waterfall.png"

plt.savefig(
    waterfall_plot_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print("\nSHAP Waterfall Plot Saved Successfully")

print(waterfall_plot_path)

# ==========================================================
# Save Feature List
# ==========================================================

print("\n")
print("=" * 70)
print("SAVING FEATURE LIST")
print("=" * 70)

artifacts_folder = Path("artifacts")

artifacts_folder.mkdir(
    parents=True,
    exist_ok=True
)

feature_list = pd.DataFrame({

    "Feature": X_test.columns

})

feature_list_path = artifacts_folder / "feature_list.csv"

feature_list.to_csv(
    feature_list_path,
    index=False
)

print("\nFeature List Saved Successfully")

print(feature_list_path)

# ==========================================================
# Summary
# ==========================================================

print("\n")
print("=" * 70)
print("PHASE 6 COMPLETED SUCCESSFULLY")
print("=" * 70)

print(f"""
Generated Files

1. SHAP Summary Plot
   {results_folder / "shap_summary.png"}

2. SHAP Feature Importance Plot
   {results_folder / "shap_feature_importance.png"}

3. SHAP Waterfall Plot
   {results_folder / "shap_waterfall.png"}

4. Feature List
   {feature_list_path}
""")