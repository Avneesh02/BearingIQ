"""
==========================================================
BearingIQ
Database Engine
==========================================================
"""

from sqlalchemy import create_engine

from app.core.config import DATABASE_URL


# ==========================================================
# SQLAlchemy Engine
# ==========================================================

engine = create_engine(

    DATABASE_URL,

    echo=False, 

    future=True,

    pool_pre_ping=True,

    pool_size=5,

    max_overflow=10

)