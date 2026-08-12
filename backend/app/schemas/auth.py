"""
==========================================================
BearingIQ
Authentication Schemas
==========================================================
"""

from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field


# ==========================================================
# User Registration Request
# ==========================================================

class UserRegister(BaseModel):
    """
    Schema used while registering a new user.
    """

    full_name: str = Field(
        ...,
        min_length=3,
        max_length=150,
        examples=["Avneesh Pagare"]
    )

    username: str = Field(
        ...,
        min_length=3,
        max_length=100,
        examples=["avneesh"]
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["StrongPassword@123"]
    )


# ==========================================================
# User Login Request
# ==========================================================

class UserLogin(BaseModel):
    """
    Schema used while logging in.
    """

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128
    )


# ==========================================================
# User Response
# ==========================================================

class UserResponse(BaseModel):
    """
    User details returned to frontend.
    """

    user_id: int

    full_name: str

    username: str

    email: EmailStr

    role: str

    is_active: bool

    is_verified: bool

    last_login: datetime | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# Token Response
# ==========================================================

class TokenResponse(BaseModel):
    """
    Tokens returned after successful login.
    """

    access_token: str

    refresh_token: str

    token_type: str = "bearer"


# ==========================================================
# Refresh Token Request
# ==========================================================

class RefreshTokenRequest(BaseModel):
    """
    Used to generate a new access token.
    """

    refresh_token: str


# ==========================================================
# Logout Request
# ==========================================================

class LogoutRequest(BaseModel):
    """
    Used while logging out.
    """

    refresh_token: str