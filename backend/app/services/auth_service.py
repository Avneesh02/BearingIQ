"""
==========================================================
BearingIQ
Authentication Service
==========================================================
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserResponse,
)
from app.core.security import hash_password , verify_token

from datetime import datetime, timedelta, timezone

from sqlalchemy import delete

from app.core.config import REFRESH_TOKEN_EXPIRE_DAYS
from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_jti,
    hash_refresh_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
)

class AuthService:
    """
    Service class responsible for authentication logic.
    """

    @staticmethod
    def register_user(
        db: Session,
        user_data: UserRegister,
    ) -> UserResponse:
        """
        Register a new user.

        Steps:
        1. Check email uniqueness
        2. Check username uniqueness
        3. Hash password
        4. Save user
        5. Return user details
        """

        # ==================================================
        # Check Email
        # ==================================================

        existing_email = db.scalar(
            select(User).where(
                User.email == user_data.email
            )
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )

        # ==================================================
        # Check Username
        # ==================================================

        existing_username = db.scalar(
            select(User).where(
                User.username == user_data.username
            )
        )

        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists.",
            )

        # ==================================================
        # Hash Password
        # ==================================================

        password_hash = hash_password(
            user_data.password
        )

        # ==================================================
        # Create User Object
        # ==================================================

        new_user = User(

            full_name=user_data.full_name,

            username=user_data.username,

            email=user_data.email,

            password_hash=password_hash,

        )

        # ==================================================
        # Save User
        # ==================================================

        try:

            db.add(new_user)

            db.commit()

            db.refresh(new_user)

        except IntegrityError:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists.",
            )

        # ==================================================
        # Return User
        # ==================================================

        return UserResponse.model_validate(
            new_user
        )
    # ======================================================
    # Login User
    # ======================================================

    @staticmethod
    def login_user(
        db: Session,
        login_data: UserLogin,
        device_name: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> TokenResponse:
        """
        Authenticate user and generate JWT tokens.
        """

        # ==================================================
        # Find User
        # ==================================================

        user = db.scalar(
            select(User).where(
                User.email == login_data.email
            )
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # ==================================================
        # Check Password
        # ==================================================

        if not verify_password(
            login_data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # ==================================================
        # Account Status Checks
        # ==================================================

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive.",
            )

        # ==================================================
        # Remove Expired Refresh Tokens
        # ==================================================

        db.execute(
            delete(RefreshToken).where(
                RefreshToken.user_id == user.user_id,
                RefreshToken.expires_at < datetime.now(timezone.utc),
            )
        )

        # ==================================================
        # Generate Tokens
        # ==================================================

        jti = generate_jti()

        access_token = create_access_token(
            user_id=user.user_id,
            email=user.email,
            role=user.role,
        )

        refresh_token = create_refresh_token(
            user_id=user.user_id,
            jti=jti,
        )

        refresh_token_hash = hash_refresh_token(
            refresh_token
        )

        # ==================================================
        # Store Refresh Token
        # ==================================================

        refresh_token_db = RefreshToken(

            user_id=user.user_id,

            token_hash=refresh_token_hash,

            jti=jti,

            expires_at=datetime.now(timezone.utc)
            + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),

            device_name=device_name,

            ip_address=ip_address,

            user_agent=user_agent,

        )

        db.add(refresh_token_db)

        # ==================================================
        # Update Last Login
        # ==================================================

        user.last_login = datetime.now(timezone.utc)

        # ==================================================
        # Save Changes
        # ==================================================

        db.commit()

        # ==================================================
        # Return Tokens
        # ==================================================

        return TokenResponse(

            access_token=access_token,

            refresh_token=refresh_token,

            token_type="bearer",

        )
    # ======================================================
    # Refresh Access Token
    # ======================================================

    @staticmethod
    def refresh_access_token(
        db: Session,
        refresh_token: str,
    ) -> TokenResponse:
        """
        Generate a new access token using a valid refresh token.
        """

        # ==================================================
        # Verify JWT
        # ==================================================

        try:
            payload = verify_token(
                refresh_token,
                token_type="refresh",
            )

        except Exception:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        # ==================================================
        # Hash Refresh Token
        # ==================================================

        refresh_token_hash = hash_refresh_token(
            refresh_token
        )

        # ==================================================
        # Find Token in Database
        # ==================================================

        db_token = db.scalar(

            select(RefreshToken).where(

                RefreshToken.token_hash == refresh_token_hash

            )

        )

        if not db_token:

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Refresh token not found.",

            )

        # ==================================================
        # Check Revocation
        # ==================================================

        if db_token.is_revoked:

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Refresh token has been revoked.",

            )

        # ==================================================
        # Check Expiry
        # ==================================================

        if db_token.expires_at <= datetime.now(timezone.utc):

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Refresh token has expired.",

            )

        # ==================================================
        # Find User
        # ==================================================

        user = db.scalar(

            select(User).where(

                User.user_id == db_token.user_id

            )

        )

        if not user:

            raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

                detail="User not found.",

            )

        # ==================================================
        # Check Account Status
        # ==================================================

        if not user.is_active:

            raise HTTPException(

                status_code=status.HTTP_403_FORBIDDEN,

                detail="Account is inactive.",

            )

        # ==================================================
        # Generate New Access Token
        # ==================================================

        access_token = create_access_token(

            user_id=user.user_id,

            email=user.email,

            role=user.role,

        )

        # ==================================================
        # Return Tokens
        # ==================================================

        return TokenResponse(

            access_token=access_token,

            refresh_token=refresh_token,

            token_type="bearer",

        )

    # ======================================================
    # Logout User
    # ======================================================

    @staticmethod
    def logout_user(
        db: Session,
        refresh_token: str,
    ) -> dict[str, str]:
        """
        Logout a user by revoking the refresh token.
        """

        # ==================================================
        # Hash Refresh Token
        # ==================================================

        refresh_token_hash = hash_refresh_token(
            refresh_token
        )

        # ==================================================
        # Find Refresh Token
        # ==================================================

        db_token = db.scalar(

            select(RefreshToken).where(

                RefreshToken.token_hash == refresh_token_hash

            )

        )

        if not db_token:

            raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

                detail="Refresh token not found.",

            )

        # ==================================================
        # Already Revoked?
        # ==================================================

        if db_token.is_revoked:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="Refresh token is already revoked.",

            )

        # ==================================================
        # Revoke Token
        # ==================================================

        db_token.is_revoked = True

        db_token.revoked_at = datetime.now(
            timezone.utc
        )

        # ==================================================
        # Save Changes
        # ==================================================

        db.commit()

        # ==================================================
        # Return Success
        # ==================================================

        return {

            "message": "Logout successful."

        }