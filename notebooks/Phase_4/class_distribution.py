from pathlib import Path
import sys

import pandas as pd
import matplotlib.pyplot as plt

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))


# --------------------------------------------------
# Load Training Dataset
# --------------------------------------------------

train_df = pd.read_csv("data/features/train_features.csv")


# --------------------------------------------------
# Class Distribution
# --------------------------------------------------

class_counts = train_df["Label"].value_counts()

print("=" * 60)
print("CLASS DISTRIBUTION")
print("=" * 60)

print(class_counts)


# --------------------------------------------------
# Percentage Distribution
# --------------------------------------------------

class_percentage = (
    train_df["Label"]
    .value_counts(normalize=True)
    * 100
)

print("\nPercentage Distribution\n")
print(class_percentage.round(2))


# --------------------------------------------------
# Bar Chart
# --------------------------------------------------

plt.figure(figsize=(8,5))

class_counts.plot(kind="bar")

plt.title("Training Dataset Class Distribution")
plt.xlabel("Bearing Condition")
plt.ylabel("Number of Samples")

plt.tight_layout()

plt.show()



'''#Note - The data is biased , it has more of normal samples but to fix that we will
use class weights .It tells the algorithm to pay 
more attention to minority clases .''' 