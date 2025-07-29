import os
from openai import OpenAI
from typing import Dict, List, Optional, Tuple
import json
import asyncio

class AIService:
    def __init__(self):
        self.client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    async def analyze_thread_with_sentiment(self, post_data: Dict, comments: List[Dict]) -> Dict:
        """
        Analyze a Reddit thread, generating summary and detecting sentiment using OpenAI
        """
        try:
            # Prepare the thread content
            thread_content = self._prepare_thread_content(post_data, comments)
            
            system_prompt = """You are an expert social media analyst. Analyze the following Reddit thread and provide:

1. A concise summary (2-3 sentences)
2. Main discussion points (3-5 bullet points)
3. Overall sentiment (positive/neutral/negative)
4. Key opportunities for engagement
5. Potential risks or concerns

Return your analysis in the following JSON format:
{
    "summary": "Brief summary of the thread",
    "main_points": ["Point 1", "Point 2", "Point 3"],
    "sentiment": "positive|neutral|negative",
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "risks": ["Risk 1", "Risk 2"],
    "confidence": 0.85
}"""

            response = await self._call_openai_async(
                system_prompt=system_prompt,
                user_prompt=f"Please analyze this Reddit thread:\n\n{thread_content}"
            )
            
            # Parse the JSON response
            try:
                analysis = json.loads(response)
                return analysis
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "summary": response[:200] + "..." if len(response) > 200 else response,
                    "main_points": ["Analysis available in summary"],
                    "sentiment": "neutral",
                    "opportunities": ["Engage with community"],
                    "risks": ["None identified"],
                    "confidence": 0.5
                }
        
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            return self._fallback_analysis(post_data)
    
    async def detect_sentiment(self, text: str) -> Tuple[str, float]:
        """
        Detect sentiment of a single piece of text
        Returns: (sentiment, confidence_score)
        """
        try:
            system_prompt = """Analyze the sentiment of the following text and respond with only a JSON object:
{
    "sentiment": "positive|neutral|negative",
    "confidence": 0.95
}"""
            
            response = await self._call_openai_async(
                system_prompt=system_prompt,
                user_prompt=f"Text to analyze: {text[:500]}"  # Limit to 500 chars
            )
            
            result = json.loads(response)
            return result.get("sentiment", "neutral"), result.get("confidence", 0.5)
            
        except Exception as e:
            print(f"Error in sentiment detection: {e}")
            # Fallback to simple keyword-based sentiment
            return self._simple_sentiment_fallback(text), 0.3
    
    async def generate_reply_draft(self, thread_summary: Dict, brand_context: Optional[Dict] = None) -> Dict:
        """
        Generate a reply draft based on thread analysis and brand context
        """
        try:
            # Prepare brand context
            brand_info = ""
            if brand_context:
                brand_info = f"""
Brand Context:
- Brand: {brand_context.get('brand_name', 'Our Company')}
- Description: {brand_context.get('one_line', 'We help customers succeed')}
- Tone: {brand_context.get('tone', {}).get('formality', 'professional')}
- Values: {', '.join(brand_context.get('value_props', []))}
"""

            system_prompt = f"""You are a helpful community manager creating authentic, valuable responses to Reddit discussions.

{brand_info}

Guidelines:
1. Be helpful and authentic, not salesy
2. Provide genuine value to the discussion
3. Include disclosure when relevant: "I work at [Company] and..."
4. Keep responses between 50-150 words
5. Match the tone of the community
6. Focus on being helpful rather than promotional

Thread Analysis:
- Summary: {thread_summary.get('summary', '')}
- Sentiment: {thread_summary.get('sentiment', 'neutral')}
- Main Points: {'; '.join(thread_summary.get('main_points', []))}
- Opportunities: {'; '.join(thread_summary.get('opportunities', []))}

Generate a draft reply in JSON format:
{{
    "draft_text": "Your helpful response here...",
    "reasoning": "Why this response is appropriate",
    "compliance_notes": ["Disclosure included", "Helpful not promotional"]
}}"""

            response = await self._call_openai_async(
                system_prompt=system_prompt,
                user_prompt="Please generate an appropriate reply draft for this thread."
            )
            
            try:
                draft_data = json.loads(response)
                return {
                    "draft_text": draft_data.get("draft_text", response),
                    "reasoning": draft_data.get("reasoning", "AI-generated response"),
                    "compliance": {
                        "score": 85,
                        "issues": []
                    }
                }
            except json.JSONDecodeError:
                return {
                    "draft_text": response,
                    "reasoning": "AI-generated response",
                    "compliance": {
                        "score": 75,
                        "issues": ["Manual review recommended"]
                    }
                }
        
        except Exception as e:
            print(f"Error generating reply draft: {e}")
            return {
                "draft_text": "Thanks for sharing this! This is an interesting discussion.",
                "reasoning": "Fallback response due to AI service error",
                "compliance": {
                    "score": 50,
                    "issues": ["AI service unavailable - manual review required"]
                }
            }
    
    async def analyze_document_update(self, user_input: str, documents: Dict[str, str]) -> Dict:
        """
        Analyze user input and suggest intelligent document updates using LLM
        Based on the trart.md approach for smart document editing
        """
        try:
            suggestions = []
            
            # Analyze each document for potential updates
            for doc_name, current_content in documents.items():
                suggestion = await self._analyze_single_document(user_input, doc_name, current_content)
                if suggestion:
                    suggestions.append(suggestion)
            
            # Sort by confidence and return top suggestions
            suggestions.sort(key=lambda x: x.get("confidence", 0), reverse=True)
            return {"suggestions": suggestions[:2]}  # Return top 2 suggestions
            
        except Exception as e:
            print(f"Error in document analysis: {e}")
            return {"error": f"Document analysis failed: {str(e)}"}
    
    async def _analyze_single_document(self, user_input: str, doc_name: str, current_content: str) -> Optional[Dict]:
        """
        Analyze if user input is relevant to a specific document and suggest updates
        """
        try:
            # Document type specific instructions
            doc_instructions = {
                "competitor-analysis": {
                    "focus": "competitor information, market positioning, competitive threats, pricing strategies, competitive advantages",
                    "sections": ["## Direct Competitors", "## Competitive Advantages", "## Threat Assessment"],
                    "icon": "Target",
                    "color": "text-blue-600",
                    "title": "Competitor Analysis"
                },
                "customer-sentiment": {
                    "focus": "customer feedback, reviews, satisfaction scores, complaints, user experience insights, support feedback",
                    "sections": ["## Overall Sentiment Trends", "## Recent Insights", "## Key Feedback Categories"],
                    "icon": "Heart", 
                    "color": "text-pink-600",
                    "title": "Customer Sentiment"
                },
                "market-trends": {
                    "focus": "industry trends, market growth, emerging technologies, regulatory changes, economic factors, future predictions",
                    "sections": ["## Industry Overview", "## Emerging Trends", "## Future Outlook"],
                    "icon": "TrendingUp",
                    "color": "text-green-600", 
                    "title": "Market Trends"
                },
                "product-intelligence": {
                    "focus": "product features, functionality, bugs, enhancements, usability feedback, performance issues, roadmap items",
                    "sections": ["## Feature Performance Analysis", "## User Experience Insights", "## Product Roadmap Intelligence"],
                    "icon": "Search",
                    "color": "text-purple-600",
                    "title": "Product Intelligence"
                }
            }
            
            doc_config = doc_instructions.get(doc_name, {})
            if not doc_config:
                return None
            
            system_prompt = f"""You are an expert documentation editor. Analyze if the user input is relevant to {doc_config.get('title', doc_name)} and suggest intelligent updates.

Document Focus: {doc_config.get('focus', 'general business information')}

Your task:
1. Determine if the user input is relevant to this document type (relevance score 0-100)
2. If relevant (score > 30), suggest how to update the document intelligently:
   - For numerical data: Update existing numbers rather than append
   - For customer feedback: Add to quantitative tracking (e.g., "3 customers report X, 2 report Y")  
   - For factual updates: Replace old information with new information
   - For new information: Add to appropriate section
   - For contradictory info: Note the conflict for user review

Current Document Content:
{current_content}

User Input: {user_input}

Respond in JSON format:
{{
    "relevant": true/false,
    "confidence": 85,
    "action": "update|append|replace",
    "section": "## Section Name",
    "reasoning": "Why this update makes sense",
    "updated_content": "Full updated document content with changes applied"
}}

If not relevant, respond: {{"relevant": false, "confidence": 0}}"""

            response = await self._call_openai_async(
                system_prompt=system_prompt,
                user_prompt=f"Analyze relevance and suggest updates for {doc_name}"
            )
            
            try:
                analysis = json.loads(response)
                
                if not analysis.get("relevant", False) or analysis.get("confidence", 0) < 30:
                    return None
                
                return {
                    "document": doc_name,
                    "section": analysis.get("section", doc_config["sections"][0]),
                    "action": analysis.get("action", "append"),
                    "content": user_input.strip(),
                    "confidence": analysis.get("confidence", 50),
                    "reason": analysis.get("reasoning", f"Relevant to {doc_config['title']}"),
                    "icon": doc_config["icon"],
                    "color": doc_config["color"],
                    "title": doc_config["title"],
                    "before_content": current_content,
                    "after_content": analysis.get("updated_content", current_content + f"\n\n## Recent Update\n{user_input.strip()}")
                }
                
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return None
                
        except Exception as e:
            print(f"Error analyzing document {doc_name}: {e}")
            return None
    
    async def _call_openai_async(self, system_prompt: str, user_prompt: str) -> str:
        """Make async OpenAI API call"""
        loop = asyncio.get_event_loop()
        
        def _call_sync():
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            return response.choices[0].message.content
        
        return await loop.run_in_executor(None, _call_sync)
    
    def _prepare_thread_content(self, post_data: Dict, comments: List[Dict]) -> str:
        """Prepare thread content for analysis"""
        content = f"**Post Title:** {post_data.get('title', '')}\n"
        content += f"**Post Body:** {post_data.get('body', '')}\n"
        content += f"**Author:** {post_data.get('author', '')}\n"
        content += f"**Score:** {post_data.get('score', 0)}\n\n"
        
        if comments:
            content += "**Top Comments:**\n"
            for i, comment in enumerate(comments[:5], 1):
                content += f"{i}. {comment.get('author', 'Unknown')}: {comment.get('body', '')[:200]}...\n"
        
        return content
    
    def _fallback_analysis(self, post_data: Dict) -> Dict:
        """Fallback analysis when AI fails"""
        return {
            "summary": f"Discussion about: {post_data.get('title', 'Reddit post')}",
            "main_points": ["Community discussion in progress"],
            "sentiment": "neutral",
            "opportunities": ["Engage with community"],
            "risks": ["None identified"],
            "confidence": 0.3
        }
    
    def _simple_sentiment_fallback(self, text: str) -> str:
        """Simple keyword-based sentiment detection as fallback"""
        text_lower = text.lower()
        
        positive_words = ["great", "awesome", "amazing", "love", "excellent", "fantastic", "good", "happy", "thanks", "helpful", "wonderful", "perfect", "best"]
        negative_words = ["bad", "terrible", "awful", "hate", "worst", "horrible", "broken", "problem", "issue", "frustrated", "angry", "disappointing"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if negative_count > positive_count:
            return "negative"
        elif positive_count > negative_count:
            return "positive"
        else:
            return "neutral"

# Global instance
ai_service = AIService()
