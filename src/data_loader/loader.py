#.mat into  numpy array

from pathlib import Path
from scipy.io import loadmat


class BearingDataLoader:
    """
    Loads vibration signals from CWRU MATLAB (.mat) files.

    This loader extracts only the Drive-End (DE) vibration signal,
    which is commonly used for bearing fault diagnosis.
    """

    def load_signal(self, file_path):

        # Read the MATLAB file
        data = loadmat(file_path)

        # Variable to store the drive-end signal name
        signal_key = None

        # Search through all variables inside the .mat file
        for key in data.keys():

            # We only need the Drive-End signal
            if key.endswith("_DE_time"):
                signal_key = key
                break

        # Stop execution if the required signal is missing
        if signal_key is None:
            raise ValueError(f"No drive-end signal found in {file_path.name}")

        # Convert the signal into a 1D NumPy array
        signal = data[signal_key].flatten()

        return signal