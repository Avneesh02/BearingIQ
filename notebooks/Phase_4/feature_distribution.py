from pathlib import Path
import sys

import pandas as pd
import matplotlib.pyplot as plt

# --------------------------------------------------
# Add project root to Python path
# --------------------------------------------------

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# --------------------------------------------------
# Load Training Feature Dataset
# --------------------------------------------------

train_df = pd.read_csv("data/features/train_features.csv")

# --------------------------------------------------
# Display Basic Information
# --------------------------------------------------

print("=" * 80)
print("TRAIN FEATURE DATASET")
print("=" * 80)

print("\nDataset Shape")
print(train_df.shape)

print("\nFirst Five Rows")
print(train_df.head())

print("\nColumn Names")
print(train_df.columns.tolist())

# --------------------------------------------------
# Summary Statistics
# --------------------------------------------------

print("\n" + "=" * 80)
print("SUMMARY STATISTICS")
print("=" * 80)

summary = train_df.describe()

print(summary)

# --------------------------------------------------
# Select Only Feature Columns
# (Exclude the Label column)
# --------------------------------------------------

feature_columns = train_df.drop(columns=["Label"]).columns

# --------------------------------------------------
# Histograms
# --------------------------------------------------

print("\nDisplaying Histograms...")

train_df[feature_columns].hist(
    figsize=(30, 24),
    bins=30,
    edgecolor="black"
)

plt.subplots_adjust(
    left=0.05,
    right=0.98,
    top=0.92,
    bottom=0.06,
    hspace=0.8,
    wspace=0.5
)

plt.show()
# --------------------------------------------------
# Box Plots
# --------------------------------------------------

#we plot individual box plot of all features bcz if we put all in one box then featres look flat because of scaling difference
print("\nDisplaying Individual Box Plots...")

for feature in feature_columns:

    plt.figure(figsize=(6, 4))

    plt.boxplot(
        train_df[feature],
        vert=True,
        patch_artist=True
    )

    plt.title(f"Box Plot - {feature}")

    plt.ylabel(feature)

    plt.grid(True, linestyle="--", alpha=0.5)

    plt.tight_layout()

    plt.show()

# --------------------------------------------------
# Class-wise Box Plots
# --------------------------------------------------

print("\nDisplaying Class-wise Box Plots...")

for feature in feature_columns:

    plt.figure(figsize=(8, 5))

    train_df.boxplot(
        column=feature,
        by="Label",
        grid=True
    )

    plt.title(f"{feature} by Bearing Condition")
    plt.suptitle("")   # Removes the default pandas title

    plt.xlabel("Bearing Condition")
    plt.ylabel(feature)

    plt.tight_layout()

    plt.show()
# --------------------------------------------------
# Feature Variance
# --------------------------------------------------

print("\n" + "=" * 80)
print("FEATURE VARIANCE")
print("=" * 80)

variance = train_df[feature_columns].var()

print(variance.sort_values())

# --------------------------------------------------
# Feature Means
# --------------------------------------------------

print("\n" + "=" * 80)
print("FEATURE MEANS")
print("=" * 80)

means = train_df[feature_columns].mean()

print(means.sort_values())

# --------------------------------------------------
# Feature Standard Deviations
# --------------------------------------------------

print("\n" + "=" * 80)
print("FEATURE STANDARD DEVIATION")
print("=" * 80)

std = train_df[feature_columns].std()

print(std.sort_values())

print("\nFeature Distribution Analysis Completed Successfully!")