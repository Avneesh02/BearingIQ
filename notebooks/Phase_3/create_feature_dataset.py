from pathlib import Path
import sys

import pandas as pd

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

from src.data_loader.loader import BearingDataLoader
from notebooks.Phase_3.feature_extraction import (
    create_sliding_windows,
    extract_features,
)


loader = BearingDataLoader()


def create_feature_dataset(metadata_file):

    metadata = pd.read_csv(metadata_file)

    feature_dataset = []

    for _, row in metadata.iterrows():

        file_path = row["filepath"]
        label = row["label"]

        print(f"Processing : {Path(file_path).name}")

        signal = loader.load_signal(file_path)

        windows = create_sliding_windows(signal)

        for window in windows:

            features = extract_features(window)

            features["Label"] = label

            feature_dataset.append(features)

    return pd.DataFrame(feature_dataset)


# -----------------------------------------------------
# Create Training Feature Dataset
# -----------------------------------------------------

train_features = create_feature_dataset(
    "data/metadata/train_files.csv"
)

Path("data/features").mkdir(parents=True, exist_ok=True)

train_features.to_csv(
    "data/features/train_features.csv",
    index=False,
)

print("\nTraining Feature Dataset Created")
print(train_features.head())

print(f"\nTraining Samples : {len(train_features)}")


# -----------------------------------------------------
# Create Testing Feature Dataset
# -----------------------------------------------------

test_features = create_feature_dataset(
    "data/metadata/test_files.csv"
)

test_features.to_csv(
    "data/features/test_features.csv",
    index=False,
)

print("\nTesting Feature Dataset Created")
print(test_features.head())

print(f"\nTesting Samples : {len(test_features)}")