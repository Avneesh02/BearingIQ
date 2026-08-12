# ==========================================================
# BearingIQ
# Configuration File
# ==========================================================

import os

from dotenv import load_dotenv
from sqlalchemy.engine import URL

# ==========================================================
# Load Environment Variables
# ==========================================================

load_dotenv()

# ==========================================================
# Application Information
# ==========================================================

PROJECT_NAME = "BearingIQ"

PROJECT_VERSION = "1.0.0"

# ==========================================================
# PostgreSQL Configuration
# ==========================================================

DATABASE_HOST = os.getenv("DATABASE_HOST")

DATABASE_PORT = int(
    os.getenv("DATABASE_PORT", 5432)
)

DATABASE_NAME = os.getenv("DATABASE_NAME")

DATABASE_USER = os.getenv("DATABASE_USER")

DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")

# ==========================================================
# JWT Configuration
# ==========================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
)

REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7)
)

# ==========================================================
# Machine Learning Model Configuration
# ==========================================================

MODEL_PATH = os.getenv("MODEL_PATH")

FEATURE_PATH = os.getenv("FEATURE_PATH")

SCALER_PATH = os.getenv("SCALER_PATH")

# ==========================================================
# Validate Required Variables
# ==========================================================

required_settings = {

    "DATABASE_HOST": DATABASE_HOST,
    "DATABASE_NAME": DATABASE_NAME,
    "DATABASE_USER": DATABASE_USER,
    "DATABASE_PASSWORD": DATABASE_PASSWORD,
    "SECRET_KEY": SECRET_KEY,
    "MODEL_PATH": MODEL_PATH,
    "FEATURE_PATH": FEATURE_PATH,
    "SCALER_PATH": SCALER_PATH,

}

missing_settings = [

    key

    for key, value in required_settings.items()

    if not value

]

if missing_settings:

    raise ValueError(

        "Missing environment variables: "

        + ", ".join(missing_settings)

    )

# ==========================================================
# SQLAlchemy Database URL
# ==========================================================

DATABASE_URL = URL.create(

    drivername="postgresql+psycopg2",

    username=DATABASE_USER,

    password=DATABASE_PASSWORD,

    host=DATABASE_HOST,

    port=DATABASE_PORT,

    database=DATABASE_NAME

)

# ==========================================================
# Debug
# ==========================================================

if __name__ == "__main__":

    print("=" * 60)
    print("Configuration Loaded Successfully")
    print("=" * 60)

    print(f"Database Name      : {DATABASE_NAME}")
    print(f"Database Host      : {DATABASE_HOST}")
    print(f"Database Port      : {DATABASE_PORT}")
    print(f"Database User      : {DATABASE_USER}")

    print(f"JWT Algorithm      : {ALGORITHM}")
    print(f"Access Token (min) : {ACCESS_TOKEN_EXPIRE_MINUTES}")
    print(f"Refresh Token(days): {REFRESH_TOKEN_EXPIRE_DAYS}")

    print(f"Model Path         : {MODEL_PATH}")
    print(f"Feature Path       : {FEATURE_PATH}")

    print("=" * 60)
    print("Configuration Loaded Successfully")
    print("=" * 60)

LABEL_ENCODER_PATH = os.getenv("LABEL_ENCODER_PATH")