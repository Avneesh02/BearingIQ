"""
==========================================================
BearingIQ
Authentication API
==========================================================
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    Request,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
    RefreshTokenRequest,
    LogoutRequest,
)

from app.services.auth_service import AuthService

# ==========================================================
# Router
# ==========================================================

router = APIRouter()

# ==========================================================
# Register
# ==========================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    """
    Register a new user.
    """

    return AuthService.register_user(
        db=db,
        user_data=user_data,
    )


# ==========================================================
# Login
# ==========================================================

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login user",
)
def login_user(
    request: Request,
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    """
    Authenticate a user.
    """

    ip_address = None

    if request.client:
        ip_address = request.client.host

    user_agent = request.headers.get("User-Agent")

    # Simple device information
    device_name = "Web Browser"

    return AuthService.login_user(
        db=db,
        login_data=login_data,
        device_name=device_name,
        ip_address=ip_address,
        user_agent=user_agent,
    )
# ==========================================================
# Refresh Access Token
# ==========================================================

@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a new access token",
)
def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a new access token using a valid refresh token.
    """

    return AuthService.refresh_access_token(
        db=db,
        refresh_token=refresh_data.refresh_token,
    )


# ==========================================================
# Logout
# ==========================================================

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
)
def logout_user(
    logout_data: LogoutRequest,
    db: Session = Depends(get_db),
):
    """
    Logout the current user by revoking the refresh token.
    """

    return AuthService.logout_user(
        db=db,
        refresh_token=logout_data.refresh_token,
    )