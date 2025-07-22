from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="RedditPro AI API",
    description="Backend API for RedditPro AI - Reddit monitoring and engagement tool",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.api.brand import router as brand_router
from app.api.subreddits import router as subreddits_router
from app.api.monitoring import router as monitoring_router
from app.api.analytics import router as analytics_router
from app.api.threads import router as threads_router
from app.api.replies import router as replies_router

# Include routers
app.include_router(brand_router)
app.include_router(subreddits_router)
app.include_router(monitoring_router)
app.include_router(analytics_router)
app.include_router(threads_router)
app.include_router(replies_router)

@app.get("/")
async def root():
    return {"message": "RedditPro AI API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RedditPro AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
