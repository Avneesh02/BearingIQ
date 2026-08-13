"""
==========================================================
BearingIQ
Main FastAPI Application
==========================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import PROJECT_NAME, PROJECT_VERSION

# Import Routers
# (We'll create these next)
from app.api import auth
from app.api import prediction


# ==========================================================
# Create FastAPI App
# ==========================================================

app = FastAPI(
    title=PROJECT_NAME,
    version=PROJECT_VERSION,
    description="BearingIQ - Bearing Fault Diagnosis API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ==========================================================
# CORS Configuration
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bearingiq-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Include Routers
# ==========================================================

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"],
)

app.include_router(
    prediction.router,
    prefix="/api/prediction",
    tags=["Prediction"],
)

# ==========================================================
# Root Endpoint
# ==========================================================

@app.get("/")
def root():
    """
    Root endpoint.
    """

    return {
        "project": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "status": "Running",
        "docs": "/docs",
    }


# ==========================================================
# Health Check
# ==========================================================

@app.get("/health")
def health():
    """
    Health check endpoint.
    """

    return {
        "status": "Healthy",
        "application": PROJECT_NAME,
        "version": PROJECT_VERSION,
    }