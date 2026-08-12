#check nan , empty and valid signals

import numpy as np


class SignalValidator:
    """
    Validates vibration signals before they are used for
    preprocessing, feature extraction, or machine learning.
    """

    @staticmethod
    def has_nan(signal):
        """
        Check whether the signal contains any NaN values.
        """
        return np.isnan(signal).any()

    @staticmethod
    def is_empty(signal):
        """
        Check whether the signal is empty.
        """
        return len(signal) == 0

    @staticmethod
    def has_constant_values(signal):
        """
        Check whether all values in the signal are the same.
        """
        return np.all(signal == signal[0])

    @staticmethod
    def validate(signal):
        """
        Run all validation checks and return
        whether the signal is valid.
        """

        if SignalValidator.is_empty(signal):
            return False, "Empty signal"

        if SignalValidator.has_nan(signal):
            return False, "NaN values found"

        if SignalValidator.has_constant_values(signal):
            return False, "Constant signal"

        return True, "Valid"