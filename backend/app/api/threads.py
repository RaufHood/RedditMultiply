from fastapi import APIRouter, HTTPException
from app.services.reddit_service import reddit_service
from app.services.ai_service import ai_service
from typing import Dict

router = APIRouter(prefix="/threads", tags=["threads"])

@router.post("/{thread_id}/summary")
async def get_thread_summary(thread_id: str):
    """Get AI-powered thread summary with post and comments"""
    try:
        thread_data = reddit_service.get_post_with_comments(thread_id, comment_limit=30)
        
        if not thread_data:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        post = thread_data["post"]
        comments = thread_data["comments"]
        
        # Use AI service for analysis
        try:
            analysis = await ai_service.analyze_thread_with_sentiment(post, comments)
            
            return {
                "summary": analysis.get("summary", ""),
                "main_points": analysis.get("main_points", []),
                "sentiment": analysis.get("sentiment", "neutral"),
                "opportunities": analysis.get("opportunities", []),
                "risks": analysis.get("risks", []),
                "confidence": analysis.get("confidence", 0.8),
                "post": post,
                "comments": comments[:10],  # Return top 10 comments
                "comment_count": len(comments)
            }
        except Exception as ai_error:
            print(f"AI analysis failed: {ai_error}")
            # Fallback to simple analysis
            simple_summary = create_simple_summary(post, comments)
            return {
                "summary": simple_summary,
                "main_points": ["Analysis temporarily unavailable"],
                "sentiment": detect_simple_sentiment(post["title"] + " " + post["body"]),
                "opportunities": ["Engage with community"],
                "risks": ["None identified"],
                "confidence": 0.3,
                "post": post,
                "comments": comments[:10],
                "comment_count": len(comments)
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting thread summary: {str(e)}")

def create_simple_summary(post: Dict, comments: list) -> str:
    """Create a simple summary without LLM (MVP version)"""
    
    title = post["title"]
    body = post["body"][:300] + "..." if len(post["body"]) > 300 else post["body"]
    
    # Count question marks and exclamation points
    question_count = (title + body).count("?")
    excitement_count = (title + body).count("!")
    
    # Analyze top comments
    top_comments = sorted(comments, key=lambda x: x["score"], reverse=True)[:5]
    avg_comment_score = sum(c["score"] for c in comments) / len(comments) if comments else 0
    
    summary_parts = []
    
    # Overview
    summary_parts.append(f"**Overview:** {title}")
    if body.strip():
        summary_parts.append(f"The post describes: {body[:200]}...")
    
    # Main Points
    points = []
    if question_count > 0:
        points.append(f"Contains {question_count} question(s) - user seeking help/information")
    if excitement_count > 0:
        points.append(f"High emotion/excitement indicated by {excitement_count} exclamation mark(s)")
    if len(comments) > 0:
        points.append(f"{len(comments)} community responses with average score of {avg_comment_score:.1f}")
    
    if points:
        summary_parts.append("**Main Points:**")
        for point in points:
            summary_parts.append(f"• {point}")
    
    # Opportunities
    opportunities = []
    if question_count > 0:
        opportunities.append("User is asking questions - opportunity to provide helpful information")
    if avg_comment_score < 2 and len(comments) > 0:
        opportunities.append("Low engagement in comments - opportunity to add valuable insight")
    
    if opportunities:
        summary_parts.append("**Opportunities:**")
        for opp in opportunities:
            summary_parts.append(f"• {opp}")
    
    return "\n".join(summary_parts)

def detect_simple_sentiment(text: str) -> str:
    """Simple sentiment detection without LLM"""
    text_lower = text.lower()
    
    positive_words = ["great", "awesome", "amazing", "love", "excellent", "fantastic", "good", "happy", "thanks", "helpful"]
    negative_words = ["bad", "terrible", "awful", "hate", "worst", "horrible", "broken", "problem", "issue", "frustrated", "angry"]
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if negative_count > positive_count:
        return "negative"
    elif positive_count > negative_count:
        return "positive"
    else:
        return "neutral"
