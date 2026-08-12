from pathlib import Path
import sys

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --------------------------------------------------
# Add Project Root
# --------------------------------------------------

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# --------------------------------------------------
# Load Training Dataset
# --------------------------------------------------

train_df = pd.read_csv("data/features/train_features.csv")

# --------------------------------------------------
# Remove Label Column
# --------------------------------------------------

feature_df = train_df.drop(columns=["Label"])

# --------------------------------------------------
# Correlation Matrix
# --------------------------------------------------

correlation_matrix = feature_df.corr()

print("=" * 80)
print("CORRELATION MATRIX")
print("=" * 80)

print(correlation_matrix)

# --------------------------------------------------
# Correlation Heatmap
# --------------------------------------------------

plt.figure(figsize=(15,12))

sns.heatmap(
    correlation_matrix,
    annot=True,
    fmt=".2f",
    cmap="coolwarm",
    linewidths=0.5
)

plt.title("Feature Correlation Heatmap")

plt.tight_layout()

plt.show()