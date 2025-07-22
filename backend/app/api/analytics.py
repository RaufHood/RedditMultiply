from fastapi import APIRouter
from app.models.schemas import AnalyticsSnapshot
from app.services.storage import storage
import time
from collections import Counter

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsSnapshot)
async def get_analytics():
    """Get current analytics snapshot"""
    
    mentions = storage.get_mentions()
    
    # Calculate metrics
    total_mentions = len(mentions)
    
    # Count by sentiment
    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    for mention in mentions:
        if mention.sentiment:
            sentiment_counts[mention.sentiment] += 1
        else:
            sentiment_counts["neutral"] += 1
    
    # Count by subreddit
    subreddit_counter = Counter(mention.subreddit for mention in mentions)
    by_subreddit = [{"name": name, "count": count} for name, count in subreddit_counter.most_common(5)]
    
    # Calculate response metrics
    responded_mentions = [m for m in mentions if m.status == "RESPONDED"]
    responded_count = len(responded_mentions)
    
    # Calculate real average response time
    avg_response_minutes = 0.0
    if responded_count > 0:
        total_response_time = 0
        valid_responses = 0
        
        for mention in responded_mentions:
            if mention.responded_at:
                response_time = mention.responded_at - mention.created_utc
                total_response_time += response_time
                valid_responses += 1
        
        if valid_responses > 0:
            avg_response_minutes = (total_response_time / valid_responses) / 60  # Convert seconds to minutes
    
    return AnalyticsSnapshot(
        timestamp=int(time.time()),
        mention_totals=total_mentions,
        by_sentiment=sentiment_counts,
        by_subreddit=by_subreddit,
        responded_count=responded_count,
        avg_response_minutes=avg_response_minutes
    ) 