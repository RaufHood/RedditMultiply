from fastapi import APIRouter, HTTPException, Query, Body
from app.models.schemas import DraftReplyRequest, ReplyDraft
from app.services.storage import storage
from app.services.ai_service import ai_service
from app.services.reddit_service import reddit_service
from typing import Optional
import uuid
import time

router = APIRouter(prefix="/replies", tags=["replies"])

@router.post("/draft", response_model=ReplyDraft)
async def create_reply_draft(request: DraftReplyRequest):
    """Generate AI-powered reply draft for a mention"""
    
    # Find the mention
    mention = storage.get_mention_by_id(request.mention_id)
    if not mention:
        raise HTTPException(status_code=404, detail="Mention not found")
    
    brand_context = storage.get_brand_context()
    if not brand_context:
        raise HTTPException(status_code=400, detail="Brand context not configured. Please complete onboarding first.")
    
    try:
        # Get thread data for context
        thread_data = reddit_service.get_post_with_comments(request.mention_id, comment_limit=5)
        
        # Analyze the thread first
        if thread_data:
            thread_analysis = await ai_service.analyze_thread_with_sentiment(
                thread_data["post"], 
                thread_data["comments"]
            )
        else:
            # Fallback analysis for mention only
            thread_analysis = {
                "summary": mention.snippet,
                "sentiment": mention.sentiment or "neutral",
                "opportunities": ["Engage with community"],
                "main_points": [mention.snippet[:100]]
            }
        
        # Generate AI draft
        draft_result = await ai_service.generate_reply_draft(
            thread_analysis, 
            brand_context.model_dump() if hasattr(brand_context, 'model_dump') else brand_context.__dict__
        )
        
        draft_text = draft_result["draft_text"]
        compliance_result = draft_result["compliance"]
        
    except Exception as ai_error:
        print(f"AI draft generation failed: {ai_error}")
        # Fallback to template-based draft
        draft_text = create_template_draft(mention, brand_context)
        compliance_result = check_basic_compliance(draft_text, brand_context)
    
    draft = ReplyDraft(
        id=str(uuid.uuid4()),
        mention_id=request.mention_id,
        original_prompt=f"Draft reply for mention: {mention.snippet[:100]}...",
        draft_text=draft_text,
        compliance=compliance_result,
        created_utc=int(time.time())
    )
    
    storage.add_reply_draft(draft)
    
    # Update mention with draft reference
    mention.reply_draft_id = draft.id
    
    return draft

@router.get("/draft/{draft_id}", response_model=ReplyDraft)
async def get_reply_draft(draft_id: str):
    """Get a specific reply draft"""
    draft = storage.get_reply_draft_by_id(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.post("/compliance/check")
async def check_compliance(
    draft_text: str = Query(..., description="The draft text to check"),
    subreddit: str = Query("general", description="Subreddit name for context")
):
    """Check compliance of a draft reply"""
    brand_context = storage.get_brand_context()
    if not brand_context:
        raise HTTPException(status_code=400, detail="Brand context not configured")
    
    compliance_result = check_basic_compliance(draft_text, brand_context)
    return compliance_result

def create_template_draft(mention, brand_context) -> str:
    """Create a template-based draft reply (placeholder for AI)"""
    
    brand_name = brand_context.brand_name
    disclosure = brand_context.disclosure_template.replace("{{brandName}}", brand_name)
    
    # Determine reply type based on mention content
    snippet_lower = mention.snippet.lower()
    
    if "?" in mention.snippet:
        # Question - provide helpful response
        draft = f"Hi there! I noticed your question and wanted to help.\n\n"
        draft += f"At {brand_name}, we've seen similar situations. "
        
        if brand_context.value_props:
            draft += f"Our approach focuses on {', '.join(brand_context.value_props[:2])}.\n\n"
        
        draft += f"Feel free to reach out if you'd like more specific guidance!\n\n"
        
    elif any(word in snippet_lower for word in ["problem", "issue", "broken", "not working"]):
        # Problem - offer support
        draft = f"Sorry to hear you're experiencing this issue! "
        draft += f"At {brand_name}, we understand how frustrating this can be.\n\n"
        
        draft += f"Have you tried [relevant troubleshooting step]? We've found this helps in many cases.\n\n"
        draft += f"Happy to help further if needed!\n\n"
        
    else:
        # General engagement
        draft = f"Thanks for sharing this! "
        draft += f"This aligns well with what we see at {brand_name}.\n\n"
        
        if brand_context.value_props:
            draft += f"We've found that {brand_context.value_props[0]} really makes a difference in these situations.\n\n"
        
        draft += f"Would love to hear your thoughts!\n\n"
    
    # Add disclosure
    draft += f"*{disclosure}*"
    
    return draft

def check_basic_compliance(draft_text: str, brand_context) -> dict:
    """Basic compliance checking (placeholder for advanced rules)"""
    
    issues = []
    score = 100
    
    # Check disclosure
    brand_name = brand_context.brand_name.lower()
    if brand_name not in draft_text.lower():
        issues.append({"severity": "ERROR", "message": "Missing brand disclosure"})
        score -= 40
    
    # Check length
    if len(draft_text) > 220:
        issues.append({"severity": "WARN", "message": f"Draft is {len(draft_text)} characters (recommended: <220)"})
        score -= 10
    
    # Check for prohibited words
    if brand_context.prohibited:
        for word in brand_context.prohibited:
            if word.lower() in draft_text.lower():
                issues.append({"severity": "ERROR", "message": f"Contains prohibited word: '{word}'"})
                score -= 15
    
    # Check for excessive links
    link_count = draft_text.count("http://") + draft_text.count("https://")
    if link_count > 1:
        issues.append({"severity": "WARN", "message": f"Contains {link_count} links (recommended: ≤1)"})
        score -= 10
    
    # Check for aggressive sales language
    sales_words = ["buy now", "purchase", "discount", "sale", "offer"]
    sales_count = sum(1 for word in sales_words if word in draft_text.lower())
    if sales_count > 0:
        issues.append({"severity": "WARN", "message": "Contains sales language - ensure it's helpful, not promotional"})
        score -= 5
    
    return {
        "issues": issues,
        "score": max(0, score)
    } 