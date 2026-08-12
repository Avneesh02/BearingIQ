from pathlib import Path
import sys

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# --------------------------------------------------
# Add Project Root
# --------------------------------------------------

project_root = Path(__file__).resolve().parents[2]
sys.path.append(str(project_root))

# --------------------------------------------------
# Load Dataset
# --------------------------------------------------

train_df = pd.read_csv("data/features/train_features.csv")

# --------------------------------------------------
# Select Important Features
# --------------------------------------------------

selected_features = [

    "RMS",

    "Kurtosis",

    "Peak_to_Peak",

    "Dominant_Frequency",

    "Spectral_Energy",

    "Label"
]

# --------------------------------------------------
# Pair Plot
# --------------------------------------------------

sns.pairplot(

    train_df[selected_features],

    hue="Label",

    diag_kind="hist"

)

plt.show()