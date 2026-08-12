"""
==========================================================
BearingIQ
Database Session
==========================================================
"""

from typing import Generator

from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

from app.database.connection import engine


# ==========================================================
# Session Factory
# ==========================================================

SessionLocal = sessionmaker(

    bind=engine,

    autoflush=False,

    autocommit=False,

    expire_on_commit=False

)


# ==========================================================
# Dependency
# ==========================================================

def get_db() -> Generator[Session, None, None]:
    """
    Creates a database session.

    FastAPI automatically opens
    and closes this session for every request.
    """

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()