from fastapi import APIRouter, Request
from typing import List, Dict, Any
from ..services.ai_service import ai_service

router = APIRouter(prefix="/suggest-edit", tags=["suggest-edit"])


def load_document_content(document_name: str, storage_content: Dict[str, str] = None) -> str:
    """Load document content from provided storage or generate minimal default templates"""
    
    # If storage content is provided and has content, use it
    if storage_content and document_name in storage_content and storage_content[document_name].strip():
        return storage_content[document_name]
    
    # Generate minimal default templates dynamically
    document_configs = {
        "competitor-analysis": {
            "title": "Competitor Analysis",
            "sections": ["## Direct Competitors", "## Competitive Advantages", "## Threat Assessment", "## Action Items"]
        },
        "customer-sentiment": {
            "title": "Customer Sentiment Analysis", 
            "sections": ["## Overall Sentiment Trends", "## Key Feedback Categories", "## Recent Insights", "## Action Items"]
        },
        "market-trends": {
            "title": "Market Trends Analysis",
            "sections": ["## Industry Overview", "## Emerging Trends", "## Future Outlook", "## Action Items"]
        },
        "product-intelligence": {
            "title": "Product Intelligence",
            "sections": ["## Feature Performance Analysis", "## User Experience Insights", "## Product Roadmap Intelligence", "## Action Items"]
        }
    }
    
    # Generate minimal template
    config = document_configs.get(document_name)
    if config:
        template = f"# {config['title']}\n\n"
        for section in config['sections']:
            template += f"{section}\n- Add your insights here\n\n"
        return template.strip()
    
    return f"# {document_name.replace('-', ' ').title()}\n\n## Overview\n- Add your content here"

@router.post("/")
async def suggest_edit(request: Request):
    try:
        body = await request.json()
        user_input = body.get("input", "")
        storage_content = body.get("storage", {})  # Frontend can pass current document state
        
        if not user_input.strip():
            return {"error": "No input provided"}
        
        # Load all documents with current state from frontend
        docs = {
            "competitor-analysis": load_document_content("competitor-analysis", storage_content),
            "customer-sentiment": load_document_content("customer-sentiment", storage_content), 
            "market-trends": load_document_content("market-trends", storage_content),
            "product-intelligence": load_document_content("product-intelligence", storage_content)
        }
        
        # Use LLM-based intelligent document analysis
        try:
            result = await ai_service.analyze_document_update(user_input, docs)
            if "error" in result:
                # Fallback to simple approach if LLM fails
                suggestions = analyze_input_and_suggest_edits_fallback(user_input, docs)
            else:
                suggestions = result.get("suggestions", [])
        except Exception as e:
            print(f"LLM analysis failed: {e}")
            # Fallback to simple approach
            suggestions = analyze_input_and_suggest_edits_fallback(user_input, docs)
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        return {"error": str(e)}

def analyze_input_and_suggest_edits_fallback(user_input: str, docs: Dict[str, str]) -> List[Dict[str, Any]]:
    """Fallback method: Analyze user input and suggest document edits using keyword matching"""
    
    lower_input = user_input.lower()
    suggestions = []
    
    # Enhanced keyword matching with scoring
    categories = {
        "competitor-analysis": {
            "keywords": ["competitor", "competition", "rival", "market share", "competitive", "threat", "pricing strategy", "benchmark"],
            "sections": ["## Direct Competitors", "## Competitive Advantages", "## Threat Assessment"],
            "icon": "Target",
            "color": "text-blue-600",
            "title": "Competitor Analysis"
        },
        "customer-sentiment": {
            "keywords": ["customer", "feedback", "review", "sentiment", "satisfaction", "complaint", "happy", "unhappy", "user experience", "support", "survey", "rating"],
            "sections": ["## Overall Sentiment Trends", "## Recent Insights", "## Key Feedback Categories"],
            "icon": "Heart", 
            "color": "text-pink-600",
            "title": "Customer Sentiment"
        },
        "market-trends": {
            "keywords": ["trend", "market", "industry", "growth", "emerging", "future", "prediction", "forecast", "opportunity", "disruption", "innovation"],
            "sections": ["## Industry Overview", "## Emerging Trends", "## Future Outlook"],
            "icon": "TrendingUp",
            "color": "text-green-600", 
            "title": "Market Trends"
        },
        "product-intelligence": {
            "keywords": ["product", "feature", "functionality", "bug", "enhancement", "usability", "performance", "integration", "roadmap", "development"],
            "sections": ["## Feature Performance Analysis", "## User Experience Insights", "## Product Roadmap Intelligence"],
            "icon": "Search",
            "color": "text-purple-600",
            "title": "Product Intelligence"
        }
    }
    
    # Score each category
    for category, config in categories.items():
        score = sum(1 for keyword in config["keywords"] if keyword in lower_input)
        
        if score > 0:
            # Determine best section to add content to
            best_section = config["sections"][0]  # Default to first section
            
            # Create suggestion
            current_content = docs[category]
            new_content = f"\n\n## Recent Update\n{user_input.strip()}"
            
            suggestions.append({
                "document": category,
                "section": best_section,
                "action": "add_after",
                "content": new_content,
                "confidence": min(score * 20, 95),
                "reason": f"Detected {score} relevant keywords for {config['title']}",
                "icon": config["icon"],
                "color": config["color"],
                "title": config["title"],
                "before_content": current_content,
                "after_content": current_content + new_content
            })
    
    # If no matches, default to most likely category based on generic business terms
    if not suggestions:
        suggestions.append({
            "document": "market-trends",
            "section": "## Industry Overview", 
            "action": "add_after",
            "content": f"\n\n## Recent Update\n{user_input.strip()}",
            "confidence": 30,
            "reason": "General business insight - defaulting to Market Trends",
            "icon": "TrendingUp",
            "color": "text-green-600",
            "title": "Market Trends",
            "before_content": docs["market-trends"],
            "after_content": docs["market-trends"] + f"\n\n## Recent Update\n{user_input.strip()}"
        })
    
    # Sort by confidence score
    suggestions.sort(key=lambda x: x["confidence"], reverse=True)
    
    return suggestions[:2]  # Return top 2 suggestions max 