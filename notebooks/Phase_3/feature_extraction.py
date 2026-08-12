print("Feature Extraction Started...")
from pathlib import Path
import sys

import numpy as np
import pandas as pd
from scipy.stats import skew, kurtosis
from scipy.fft import rfft, rfftfreq

# Add project root to Python path
project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

from src.data_loader.loader import BearingDataLoader


# -------------------------------------------------
# Sampling Frequency (CWRU Dataset)
# -------------------------------------------------

SAMPLING_FREQUENCY = 12000


# -------------------------------------------------
# Sliding Window Function
# -------------------------------------------------

def create_sliding_windows(signal, window_size=2048, overlap=1024):

    windows = []

    step = window_size - overlap

    for start in range(0, len(signal) - window_size + 1, step):

        windows.append(signal[start:start + window_size])

    return windows


# -------------------------------------------------
# Time Domain Feature Extraction
# -------------------------------------------------

def extract_time_features(window):

    mean = np.mean(window)

    std = np.std(window)

    variance = np.var(window)

    rms = np.sqrt(np.mean(window ** 2))

    maximum = np.max(window)

    minimum = np.min(window)

    peak = np.max(np.abs(window))

    peak_to_peak = np.ptp(window)

    skewness = skew(window)

    kurt = kurtosis(window)

    mean_abs = np.mean(np.abs(window))

    crest_factor = peak / rms

    shape_factor = rms / mean_abs

    impulse_factor = peak / mean_abs

    clearance_factor = peak / (np.mean(np.sqrt(np.abs(window))) ** 2)

    return {

        "Mean": mean,

        "Standard_Deviation": std,

        "Variance": variance,

        "RMS": rms, #overall energy of the vibration signal.

        "Maximum": maximum,

        "Minimum": minimum,

        "Peak": peak,  #Peak measures the largest vibration regardless of direction.

        "Peak_to_Peak": peak_to_peak,  #Maximum − Minimum

        "Skewness": skewness,

        "Kurtosis": kurt,  #Measures how "spiky" the signal is.

        "Crest_Factor": crest_factor,

        "Shape_Factor": shape_factor,

        "Impulse_Factor": impulse_factor,

        "Clearance_Factor": clearance_factor

    }


# -------------------------------------------------
# Frequency Domain Feature Extraction
# -------------------------------------------------

def extract_frequency_features(window,
                               sampling_frequency=SAMPLING_FREQUENCY):

    fft_values = np.abs(rfft(window))  #time to frequency

    frequencies = rfftfreq(len(window),
                           d=1 / sampling_frequency)  #create freq corresponding to each fft value

    # Remove DC Component
    fft_values = fft_values[1:]
    frequencies = frequencies[1:]

    dominant_frequency = frequencies[np.argmax(fft_values)]

    maximum_fft = np.max(fft_values)

    spectral_energy = np.sum(fft_values ** 2)

    mean_frequency = np.sum(frequencies * fft_values) / np.sum(fft_values)

    spectral_centroid = mean_frequency

    power = fft_values ** 2

    power = power / np.sum(power)

    spectral_entropy = -np.sum(power * np.log2(power + 1e-12))

    return {

        "Dominant_Frequency": dominant_frequency,

        "Maximum_FFT_Magnitude": maximum_fft,

        "Spectral_Energy": spectral_energy,

        "Mean_Frequency": mean_frequency,

        "Spectral_Centroid": spectral_centroid,

        "Spectral_Entropy": spectral_entropy

    }


# -------------------------------------------------
# Complete Feature Extraction
# -------------------------------------------------

def extract_features(window):

    features = {}

    features.update(extract_time_features(window))

    features.update(extract_frequency_features(window))

    return features

# -------------------------------------------------
# Test
# -------------------------------------------------

loader = BearingDataLoader()

train_df = pd.read_csv("data/metadata/train_files.csv")

signal = loader.load_signal(train_df.iloc[0]["filepath"])

windows = create_sliding_windows(signal)

print(f"\nTotal Windows : {len(windows)}")


# -------------------------------------------------
# Time Domain Features
# -------------------------------------------------

print("\n" + "=" * 60)
print("TIME DOMAIN FEATURES")
print("=" * 60)

time_features = extract_time_features(windows[0])

for key, value in time_features.items():

    print(f"{key:30} : {value:.5f}")


# -------------------------------------------------
# Frequency Domain Features
# -------------------------------------------------

print("\n" + "=" * 60)
print("FREQUENCY DOMAIN FEATURES")
print("=" * 60)

frequency_features = extract_frequency_features(windows[0])

for key, value in frequency_features.items():

    print(f"{key:30} : {value:.5f}")


# -------------------------------------------------
# Combined Features (Optional)
# -------------------------------------------------

print("\n" + "=" * 60)
print("TOTAL FEATURES EXTRACTED")
print("=" * 60)

all_features = extract_features(windows[0])

print(f"Total Number of Features : {len(all_features)}")