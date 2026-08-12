"""
==========================================================
BearingIQ
Security Utilities
==========================================================
"""

from __future__ import annotations

import hashlib  #used fo hash refresh token
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
)

# ==========================================================
# Password Hashing Configuration
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# ==========================================================
# Password Functions
# ==========================================================

def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain password against a bcrypt hash.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )

# ==========================================================
# JWT ID
# ==========================================================

def generate_jti() -> str:
    """
    Generate a unique JWT ID.
    """
    return str(uuid.uuid4())

# ==========================================================
# Refresh Token Hash
# ==========================================================

def hash_refresh_token(token: str) -> str:
    """
    Hash refresh token using SHA-256 before storing in DB.
    """
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

# ==========================================================
# Internal Token Generator
# ==========================================================

def _create_token(
    data: dict[str, Any],
    expires_delta: timedelta,
) -> str:
    """
    Generic JWT creator.
    """

    payload = data.copy()

    expire = datetime.now(timezone.utc) + expires_delta

    payload.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

# ==========================================================
# Access Token
# ==========================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str,
) -> str:
    """
    Create JWT access token.
    """

    payload = {

        "sub": str(user_id),

        "email": email,

        "role": role,

        "type": "access",

    }

    return _create_token(
        payload,
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )

# ==========================================================
# Refresh Token
# ==========================================================

def create_refresh_token(
    user_id: int,
    jti: str,
) -> str:
    """
    Create JWT refresh token.
    """

    payload = {

        "sub": str(user_id),

        "jti": jti,

        "type": "refresh",

    }

    return _create_token(
        payload,
        timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        ),
    )

# ==========================================================
# Decode Token
# ==========================================================

def decode_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate JWT.
    Raises JWTError if invalid.
    """

    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )

# ==========================================================
# Verify Token
# ==========================================================

def verify_token(
    token: str,
    token_type: str | None = None,
) -> dict[str, Any]:
    """
    Verify JWT validity and optionally check token type.
    """

    try:

        payload = decode_token(token)

        print("=" * 60)
        print("JWT Payload:")
        print(payload)
        print("=" * 60)

        if (
            token_type is not None
            and payload.get("type") != token_type
        ):
            raise JWTError(
                f"Invalid token type. Expected '{token_type}', got '{payload.get('type')}'."
            )

        return payload

    except JWTError as e:

        print("=" * 60)
        print("JWT ERROR:")
        print(e)
        print("=" * 60)

        raise