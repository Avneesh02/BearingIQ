"""
==========================================================
BearingIQ
Create Database Tables
==========================================================
"""

from app.database.base import Base
from app.database.connection import engine

# Import all models so SQLAlchemy knows about them
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.ml_model import MLModel
from app.models.prediction import Prediction

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")