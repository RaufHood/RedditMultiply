from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import SubredditProfile, DiscoverSubredditsRequest
from app.services.reddit_service import reddit_service
from typing import List

router = APIRouter(prefix="/subreddits", tags=["subreddits"])

@router.post("/discover", response_model=List[SubredditProfile])
async def discover_subreddits(request: DiscoverSubredditsRequest):
    """Discover relevant subreddits based on keywords"""
    try:
        if not request.keywords:
            raise HTTPException(status_code=400, detail="At least one keyword is required")
        
        subreddits = reddit_service.discover_subreddits_by_keywords(request.keywords)
        return subreddits
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error discovering subreddits: {str(e)}")

@router.get("/search", response_model=List[SubredditProfile])
async def search_subreddits(query: str = Query(..., description="Search query for subreddits")):
    """Search for subreddits by query"""
    try:
        if not query or len(query.strip()) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
        
        subreddits = reddit_service.search_subreddits(query.strip())
        return subreddits
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching subreddits: {str(e)}") 