import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

#check whether bearing data is working correctly by loading a sample .mat file'
from pathlib import Path

from src.data_loader.loader import BearingDataLoader


# Create an object of the data loader
loader = BearingDataLoader()

# Path to a sample MATLAB file
sample_file = Path("data/raw/Normal/97_0.mat")

# Load the drive-end vibration signal
signal = loader.load_signal(sample_file)

# Display the shape of the signal
print("Signal Shape:", signal.shape)

# Display the first 10 values
print("First 10 Samples:")
print(signal[:10])