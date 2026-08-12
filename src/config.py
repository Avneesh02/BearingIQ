from pathlib import Path

# ---------------------------------------------------------
# Project Paths
# ---------------------------------------------------------

# Absolute path of this file
CURRENT_FILE = Path(__file__).resolve()

# src/
SRC_DIR = CURRENT_FILE.parent

# BearingIQ/
PROJECT_ROOT = SRC_DIR.parent

# ---------------------------------------------------------
# Data Directories
# ---------------------------------------------------------

DATA_DIR = PROJECT_ROOT / "data"

RAW_DATA_DIR = DATA_DIR / "raw"

PROCESSED_DATA_DIR = DATA_DIR / "processed"

FEATURE_DATA_DIR = DATA_DIR / "features"

METADATA_DIR = DATA_DIR / "metadata"

# ---------------------------------------------------------
# Reports
# ---------------------------------------------------------

REPORTS_DIR = PROJECT_ROOT / "reports"

FIGURES_DIR = REPORTS_DIR / "figures"

RESULTS_DIR = REPORTS_DIR / "results"

# ---------------------------------------------------------
# Saved Models
# ---------------------------------------------------------

MODEL_DIR = PROJECT_ROOT / "models"

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

RANDOM_STATE = 42  #evey run produces same split

SAMPLING_FREQUENCY = 12000

WINDOW_SIZE = 2048

WINDOW_OVERLAP = 1024