from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import List, Dict, Any

app = FastAPI(
    title="RedditPro AI API",
    description="Backend API for RedditPro AI - Reddit monitoring and engagement tool",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
allowed_origins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]  # Local development

# Add production domains if deployed
if os.getenv("VERCEL_URL"):
    allowed_origins.append(f"https://{os.getenv('VERCEL_URL')}")
if os.getenv("VERCEL_PROJECT_PRODUCTION_URL"):
    allowed_origins.append(f"https://{os.getenv('VERCEL_PROJECT_PRODUCTION_URL')}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "RedditPro AI API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RedditPro AI API"}

# Basic endpoints that don't require complex dependencies for now
@app.get("/brand/context")
async def get_brand_context():
    return {"error": "Brand context not found. Please complete onboarding first.", "status": 404}

@app.post("/subreddits/discover")
async def discover_subreddits():
    # Mock response for testing
    return [
        {
            "name": "r/test",
            "description": "Test subreddit",
            "member_count": 1000,
            "activity_score": 50.0,
            "relevance_score": 1.0,
            "status": "candidate"
        }
    ]

@app.get("/monitor/status")
async def monitor_status():
    return {"status": "active", "monitors": 0}

@app.get("/analytics")
async def get_analytics():
    return {"mentions": 0, "engagement": 0, "reach": 0}

# Import routers
from suggest_edit import router as suggest_edit_router

# Include routers
app.include_router(suggest_edit_router)