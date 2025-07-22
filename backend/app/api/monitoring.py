from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from app.models.schemas import MonitorConfigRequest, Mention, UpdateMentionStatusRequest, AddKeywordRequest
from app.services.reddit_service import reddit_service
from app.services.storage import storage
from typing import List, Optional, Dict
import asyncio
import time

router = APIRouter(prefix="/monitor", tags=["monitoring"])

@router.post("/config")
async def configure_monitoring(request: MonitorConfigRequest, background_tasks: BackgroundTasks):
    """Configure monitoring with selected subreddits and keywords"""
    if not request.subreddits:
        raise HTTPException(status_code=400, detail="At least one subreddit is required")
    if not request.keywords:
        raise HTTPException(status_code=400, detail="At least one keyword is required")
    
    config = {
        "subreddits": request.subreddits,
        "keywords": request.keywords,
        "configured_at": int(time.time())
    }
    
    storage.set_monitoring_config(config)
    
    # Start background monitoring
    if not storage.is_monitoring_active():
        background_tasks.add_task(start_monitoring)
        storage.set_monitoring_active(True)
    
    return {"message": "Monitoring configured successfully", "config": config}

@router.get("/mentions", response_model=List[Mention])
async def get_mentions(
    status: Optional[str] = Query(None, description="Filter by status: NEW, RESPONDED, IGNORED"),
    priority: Optional[str] = Query(None, description="Filter by priority: high, normal, low"),
    q: Optional[str] = Query(None, description="Search query in snippet or title")
):
    """Get mentions with optional filters"""
    filtered_mentions = storage.get_mentions().copy()
    
    # Apply filters
    if status:
        filtered_mentions = [m for m in filtered_mentions if m.status == status.upper()]
    
    if priority:
        filtered_mentions = [m for m in filtered_mentions if m.priority == priority.lower()]
    
    if q:
        query_lower = q.lower()
        filtered_mentions = [
            m for m in filtered_mentions 
            if query_lower in m.snippet.lower() or (m.title and query_lower in m.title.lower())
        ]
    
    return filtered_mentions

@router.get("/mentions/{mention_id}", response_model=Mention)
async def get_mention(mention_id: str):
    """Get a specific mention by ID"""
    mention = storage.get_mention_by_id(mention_id)
    if not mention:
        raise HTTPException(status_code=404, detail="Mention not found")
    return mention

@router.post("/mentions/status")
async def update_mention_status(request: UpdateMentionStatusRequest):
    """Update mention status"""
    import time
    
    # If marking as responded, add timestamp
    if request.status == "RESPONDED":
        success = storage.update_mention_status_with_timestamp(request.id, request.status, int(time.time()))
    else:
        success = storage.update_mention_status(request.id, request.status)
    
    if not success:
        raise HTTPException(status_code=404, detail="Mention not found")
    return {"message": "Status updated successfully"}

@router.post("/keywords")
async def add_keyword(request: AddKeywordRequest):
    """Add a new keyword to monitoring"""
    config = storage.get_monitoring_config()
    if not config:
        raise HTTPException(status_code=400, detail="Monitoring not configured. Please configure monitoring first.")
    
    if request.keyword not in config["keywords"]:
        config["keywords"].append(request.keyword)
        storage.set_monitoring_config(config)
    
    return {"keywords": config["keywords"]}

@router.delete("/keywords/{keyword}")
async def remove_keyword(keyword: str):
    """Remove a keyword from monitoring"""
    config = storage.get_monitoring_config()
    if not config:
        raise HTTPException(status_code=400, detail="Monitoring not configured. Please configure monitoring first.")
    
    if keyword in config["keywords"]:
        config["keywords"].remove(keyword)
        storage.set_monitoring_config(config)
    
    return {"keywords": config["keywords"]}

@router.get("/status")
async def get_monitoring_status():
    """Get current monitoring status"""
    return {
        "active": storage.is_monitoring_active(),
        "config": storage.get_monitoring_config(),
        "mention_count": len(storage.get_mentions())
    }

async def start_monitoring():
    """Background task to fetch mentions periodically"""
    while storage.is_monitoring_active():
        config = storage.get_monitoring_config()
        if not config:
            break
            
        try:
            print("Fetching new mentions...")
            new_mentions = await reddit_service.fetch_recent_posts(
                config["subreddits"],
                config["keywords"],
                limit=50
            )
            
            storage.add_mentions(new_mentions)
            
            print(f"Found {len(new_mentions)} new mentions. Total: {len(storage.get_mentions())}")
            
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
        
        # Wait 3 minutes before next poll (180 seconds as per PDR)
        await asyncio.sleep(180) 