from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.recommendation import router as recommendation_router


app = FastAPI(
    title="SmartCart AI Service",
    description="AI and ML service for SmartCart AI",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================
#
# Customer Frontend runs on:
# http://localhost:5173
#
# AI Service runs on:
# http://localhost:8000
#
# Because these are different origins, the browser requires
# the AI Service to explicitly allow the Customer Frontend.
#
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AI ROUTES
# ============================================================

app.include_router(recommendation_router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "smartcart-ai"
    }