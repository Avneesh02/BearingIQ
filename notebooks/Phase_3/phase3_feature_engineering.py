from pathlib import Path
import sys

import pandas as pd

# Add project root to Python path
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from src.data_loader.loader import BearingDataLoader


# -------------------------------
# Load Training and Testing Files
# -------------------------------

train_df = pd.read_csv("data/metadata/train_files.csv")
test_df = pd.read_csv("data/metadata/test_files.csv")

print("Training Files :", len(train_df))
print("Testing Files  :", len(test_df))


# Create Data Loader
loader = BearingDataLoader()


# Lists to store loaded signals
train_signals = []
train_labels = []

test_signals = []
test_labels = []


# -------------------------------
# Load Training Signals
# -------------------------------

for _, row in train_df.iterrows():

    signal = loader.load_signal(row["filepath"])

    train_signals.append(signal)
    train_labels.append(row["label"])


# -------------------------------
# Load Testing Signals
# -------------------------------

for _, row in test_df.iterrows():

    signal = loader.load_signal(row["filepath"])

    test_signals.append(signal)
    test_labels.append(row["label"])


print("\nSignals Loaded Successfully\n")

print("\nTraining Signals\n")

for i in range(len(train_signals)):

    print(f"File   : {train_df.iloc[i]['filename']}")
    print(f"Label  : {train_labels[i]}")
    print(f"Shape  : {train_signals[i].shape}")
    print("-" * 40)


print("\nTesting Signals\n")

for i in range(len(test_signals)):

    print(f"File   : {test_df.iloc[i]['filename']}")
    print(f"Label  : {test_labels[i]}")
    print(f"Shape  : {test_signals[i].shape}")
    print("-" * 40)