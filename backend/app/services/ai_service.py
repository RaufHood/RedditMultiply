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
