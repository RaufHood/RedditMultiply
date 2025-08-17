from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

# Ensure our loggers are at INFO level
logging.getLogger('app.services.ai_service').setLevel(logging.INFO)
logging.getLogger('app.api.suggest_edit').setLevel(logging.INFO)

# Load environment variables
load_dotenv()

# Test logging
logger = logging.getLogger(__name__)
logger.info("🚀 Starting RedditPro AI API server...")

app = FastAPI(
    title="RedditPro AI API",
    description="Backend API for RedditPro AI - Reddit monitoring and engagement tool",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
allowed_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:3001",  # Current frontend port
    "http://localhost:3002",  # Alternative port
    "https://reddit-frontend-qnvv7u984-raufhoods-projects.vercel.app",  # Production frontend
    "https://*.vercel.app",  # All Vercel deployments
    "https://reddit-frontend-theta.vercel.app"
]

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

# Import routers
from app.api.brand import router as brand_router
from app.api.subreddits import router as subreddits_router
from app.api.monitoring import router as monitoring_router
from app.api.analytics import router as analytics_router
from app.api.threads import router as threads_router
from app.api.replies import router as replies_router
from app.api.suggest_edit import router as suggest_edit_router

# Include routers
app.include_router(brand_router)
app.include_router(subreddits_router)
app.include_router(monitoring_router)
app.include_router(analytics_router)
app.include_router(threads_router)
app.include_router(replies_router)
app.include_router(suggest_edit_router)

@app.get("/")
async def root():
    return {"message": "RedditPro AI API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RedditPro AI API"}

@app.get("/test-llm")
async def test_llm():
    """Test endpoint to trigger an LLM call and see logging"""
    from app.services.ai_service import ai_service
    
    try:
        # Test a simple sentiment analysis
        sentiment, confidence = await ai_service.detect_sentiment("This is a great product!")
        return {
            "message": "LLM test completed",
            "sentiment": sentiment,
            "confidence": confidence,
            "check_logs": "Look at the console/logs for LLM call details"
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/test-suggest-edit")
async def test_suggest_edit():
    """Test endpoint to trigger suggest-edit functionality and see logging"""
    from app.services.ai_service import ai_service
    
    logger.info("🧪 Testing suggest-edit functionality...")
    
    try:
        # Test document analysis
        test_docs = {
            "competitor-analysis": "# Competitor Analysis\n\n## Direct Competitors\n- Add your insights here",
            "customer-sentiment": "# Customer Sentiment Analysis\n\n## Overall Sentiment Trends\n- Add your insights here"
        }
        
        result = await ai_service.analyze_document_update("Our main competitor launched a new pricing strategy", test_docs)
        
        return {
            "message": "Suggest-edit test completed",
            "result": result,
            "check_logs": "Look at the console/logs for detailed LLM call information"
        }
    except Exception as e:
        logger.error(f"Test suggest-edit failed: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
