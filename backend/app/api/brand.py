from fastapi import APIRouter, HTTPException
from app.models.schemas import BrandContext, BrandContextRequest
from app.services.storage import storage
from typing import Optional

router = APIRouter(prefix="/brand", tags=["brand"])

@router.post("/context", response_model=BrandContext)
async def save_brand_context(request: BrandContextRequest):
    """Save or update brand context"""
    current_context = storage.get_brand_context()
    
    # If we have existing context, merge with new data
    if current_context:
        current_data = current_context.model_dump()
        # Update only provided fields
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        current_data.update(update_data)
        new_context = BrandContext(**current_data)
    else:
        # Create new brand context with defaults for missing fields
        brand_data = request.model_dump()
        # Set defaults for required fields if not provided
        if not brand_data.get("brand_name"):
            raise HTTPException(status_code=400, detail="brand_name is required")
        if not brand_data.get("one_line"):
            raise HTTPException(status_code=400, detail="one_line is required")
        
        # Remove None values
        brand_data = {k: v for k, v in brand_data.items() if v is not None}
        new_context = BrandContext(**brand_data)
    
    storage.set_brand_context(new_context)
    return new_context

@router.get("/context", response_model=BrandContext)
async def get_brand_context():
    """Get current brand context"""
    context = storage.get_brand_context()
    if not context:
        raise HTTPException(status_code=404, detail="Brand context not found. Please complete onboarding first.")
    return context
