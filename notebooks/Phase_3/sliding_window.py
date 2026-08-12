from pathlib import Path
import sys

import pandas as pd

# Add project root to Python path
project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

from src.data_loader.loader import BearingDataLoader


# ---------------------------------
# Sliding Window Function
# ---------------------------------

def create_sliding_windows(signal, window_size=2048, overlap=512):
    """
    Split one vibration signal into multiple overlapping windows.
    called as DOCSTRING
    """

    windows = []

    step = window_size - overlap

    for start in range(0, len(signal) - window_size + 1, step):

        end = start + window_size

        window = signal[start:end]

        windows.append(window)

    return windows


# ---------------------------------
# Load Train/Test CSV Files
# ---------------------------------

train_df = pd.read_csv("data/metadata/train_files.csv")
test_df = pd.read_csv("data/metadata/test_files.csv")

loader = BearingDataLoader()


# ---------------------------------
# Generate Windows for Training Data
# ---------------------------------

print("\nTraining Data\n")

for _, row in train_df.iterrows():

    signal = loader.load_signal(row["filepath"])

    windows = create_sliding_windows(signal)

    print(f"File              : {row['filename']}")
    print(f"Label             : {row['label']}")
    print(f"Signal Length     : {len(signal)}")
    print(f"Number of Windows : {len(windows)}")
    print(f"Window Shape      : {windows[0].shape}")

    print("-" * 50)


# ---------------------------------
# Generate Windows for Testing Data
# ---------------------------------

print("\nTesting Data\n")

for _, row in test_df.iterrows():

    signal = loader.load_signal(row["filepath"])

    windows = create_sliding_windows(signal)

    print(f"File              : {row['filename']}")
    print(f"Label             : {row['label']}")
    print(f"Signal Length     : {len(signal)}")
    print(f"Number of Windows : {len(windows)}")
    print(f"Window Shape      : {windows[0].shape}")

    print("-" * 50)