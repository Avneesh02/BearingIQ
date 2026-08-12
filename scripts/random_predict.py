"""
BearingIQ — Random Prediction Demo

Generates different feature values on every run and prints the model prediction.

Usage (from project root):
  python scripts/random_predict.py
  python scripts/random_predict.py --runs 5
  python scripts/random_predict.py --mode random
  python scripts/random_predict.py --output random_input.csv
"""

from __future__ import annotations

import argparse
import random
import sys
from pathlib import Path

import joblib
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]

MODEL_PATH = PROJECT_ROOT / "models" / "final" / "final_random_forest.pkl"
LABEL_ENCODER_PATH = PROJECT_ROOT / "models" / "label_encoder.pkl"
SCALER_PATH = PROJECT_ROOT / "models" / "standard_scaler.pkl"
FEATURE_PATH = PROJECT_ROOT / "artifacts" / "feature_list.csv"
TEST_DATA_PATH = PROJECT_ROOT / "data" / "features" / "test_features_selected.csv"
TRAIN_DATA_PATH = PROJECT_ROOT / "data" / "features" / "train_features_selected.csv"


def load_artifacts():
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_list = pd.read_csv(FEATURE_PATH)["Feature"].tolist()
    return model, label_encoder, scaler, feature_list


def predict(model, label_encoder, scaler, feature_list, features: dict[str, float]):
    ordered = {name: features[name] for name in feature_list}
    raw_df = pd.DataFrame([ordered])
    scaled_df = pd.DataFrame(scaler.transform(raw_df), columns=feature_list)

    predicted_class = int(model.predict(scaled_df)[0])
    prediction = label_encoder.inverse_transform([predicted_class])[0]
    probabilities = model.predict_proba(scaled_df)[0]
    confidence = round(float(probabilities.max() * 100), 2)

    class_names = label_encoder.inverse_transform(model.classes_)
    probability_dict = {
        str(label): round(float(prob) * 100, 2)
        for label, prob in zip(class_names, probabilities)
    }

    return prediction, confidence, probability_dict


def sample_from_test_data(feature_list: list[str]) -> tuple[dict[str, float], str | None]:
    test_df = pd.read_csv(TEST_DATA_PATH)
    row = test_df.sample(n=1).iloc[0]
    true_label = row.get("Label")
    features = {name: float(row[name]) for name in feature_list}
    return features, None if pd.isna(true_label) else str(true_label)


def sample_random_values(feature_list: list[str]) -> dict[str, float]:
    train_df = pd.read_csv(TRAIN_DATA_PATH)
    features = {}

    for name in feature_list:
        low = float(train_df[name].min())
        high = float(train_df[name].max())
        features[name] = random.uniform(low, high)

    return features


def generate_features(feature_list: list[str], mode: str) -> tuple[dict[str, float], str | None, str]:
    if mode == "sample":
        features, true_label = sample_from_test_data(feature_list)
        source = "random test row"
    else:
        features = sample_random_values(feature_list)
        true_label = None
        source = "random values (training min/max)"

    return features, true_label, source


def write_frontend_csv(features: dict[str, float], feature_list: list[str], output_path: Path) -> None:
    """Write a one-row CSV compatible with the frontend CSV upload."""
    row = {name: features[name] for name in feature_list}
    pd.DataFrame([row]).to_csv(output_path, index=False)


def run_once(
    model,
    label_encoder,
    scaler,
    feature_list,
    mode: str,
    show_features: bool,
    output_path: Path | None = None,
):
    features, true_label, source = generate_features(feature_list, mode)

    prediction, confidence, probabilities = predict(
        model, label_encoder, scaler, feature_list, features
    )

    if output_path is not None:
        write_frontend_csv(features, feature_list, output_path)

    print("-" * 60)
    print(f"Input source : {source}")
    if true_label:
        print(f"True label   : {true_label}")
    if output_path is not None:
        print(f"CSV saved    : {output_path.resolve()}")
    print(f"Prediction   : {prediction} ({confidence}%)")
    print("Probabilities:")
    for label, prob in sorted(probabilities.items(), key=lambda item: item[1], reverse=True):
        print(f"  {label:<12} {prob:>6.2f}%")

    if show_features:
        print("Features:")
        for name in feature_list:
            print(f"  {name:<24} {features[name]:.6f}")

    return features


def main():
    parser = argparse.ArgumentParser(description="Run BearingIQ predictions with random inputs.")
    parser.add_argument(
        "--mode",
        choices=("sample", "random"),
        default="sample",
        help="sample = pick a random test row (recommended), random = uniform random in train range",
    )
    parser.add_argument(
        "--runs",
        type=int,
        default=1,
        help="How many random predictions to run",
    )
    parser.add_argument(
        "--show-features",
        action="store_true",
        help="Print all 17 feature values",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional random seed for reproducible runs",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Save frontend-ready CSV to this path (e.g. random_input.csv)",
    )
    args = parser.parse_args()

    if args.runs < 1:
        print("Error: --runs must be at least 1", file=sys.stderr)
        sys.exit(1)

    if args.seed is not None:
        random.seed(args.seed)

    model, label_encoder, scaler, feature_list = load_artifacts()

    print("=" * 60)
    print("BearingIQ Random Prediction Demo")
    print(f"Mode: {args.mode} | Runs: {args.runs}")
    print("=" * 60)

    output_path = Path(args.output) if args.output else None

    if output_path is not None and args.runs > 1:
        print(
            "Note: --output saves only the last run's CSV "
            "(frontend reads one row per file).",
        )

    for run_index in range(args.runs):
        run_output = output_path
        if output_path is not None and args.runs > 1:
            run_output = output_path.with_name(
                f"{output_path.stem}_{run_index + 1}{output_path.suffix}"
            )

        run_once(
            model,
            label_encoder,
            scaler,
            feature_list,
            args.mode,
            args.show_features,
            run_output,
        )

    print("-" * 60)


if __name__ == "__main__":
    main()
