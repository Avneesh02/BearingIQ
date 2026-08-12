"""
==========================================================
BearingIQ
Common Dependencies
==========================================================
"""

from __future__ import annotations

from fastapi import (
    Depends,
    HTTPException,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import verify_token
from app.database.session import get_db
from app.models.user import User

# ==========================================================
# OAuth2 Scheme
# ==========================================================

oauth2_scheme = HTTPBearer()

# ==========================================================
# Get Current User
# ==========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Validate JWT access token and return
    the currently authenticated user.
    """
    token  = credentials.credentials
    # ------------------------------------------------------
    # Verify Access Token
    # ------------------------------------------------------

    try:
        print("=" * 60)
        print("TOKEN RECEIVED")
        print(token)
        print("=" * 60)

        payload = verify_token(
            token,
            token_type="access",
        )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # ------------------------------------------------------
    # Extract User ID
    # ------------------------------------------------------

    user_id = payload.get("sub")

    if user_id is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        )

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.user_id == int(user_id)
        )
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return user