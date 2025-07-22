import praw
import os
from datetime import datetime
from typing import List, Dict, Optional
from app.models.schemas import SubredditProfile, Mention
import re
import asyncio

class RedditService:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent=os.getenv("REDDIT_USER_AGENT")
        )
    
    def search_subreddits(self, query: str, limit: int = 20) -> List[SubredditProfile]:
        """Search for subreddits by query and return profiles"""
        try:
            subreddits = []
            for subreddit in self.reddit.subreddits.search(query, limit=limit):
                profile = SubredditProfile(
                    name=f"r/{subreddit.display_name}",
                    description=subreddit.public_description or subreddit.description or "",
                    member_count=subreddit.subscribers or 0,
                    activity_score=self._calculate_activity_score(subreddit),
                    relevance_score=self._calculate_relevance_score(subreddit, query),
                    status="candidate"
                )
                subreddits.append(profile)
            
            # Sort by relevance score descending
            return sorted(subreddits, key=lambda x: x.relevance_score, reverse=True)
        
        except Exception as e:
            print(f"Error searching subreddits: {e}")
            return []
    
    def discover_subreddits_by_keywords(self, keywords: List[str], limit_per_keyword: int = 10) -> List[SubredditProfile]:
        """Discover relevant subreddits based on keywords"""
        all_subreddits = {}
        
        for keyword in keywords:
            subreddits = self.search_subreddits(keyword, limit_per_keyword)
            for subreddit in subreddits:
                if subreddit.name not in all_subreddits:
                    all_subreddits[subreddit.name] = subreddit
                else:
                    # Boost relevance if found in multiple keyword searches
                    all_subreddits[subreddit.name].relevance_score += 0.1
        
        # Convert to list and sort by relevance
        result = list(all_subreddits.values())
        return sorted(result, key=lambda x: x.relevance_score, reverse=True)[:20]
    
    async def fetch_recent_posts(self, subreddit_names: List[str], keywords: List[str], limit: int = 100) -> List[Mention]:
        """Fetch recent posts from specified subreddits that match keywords"""
        mentions = []
        
        for subreddit_name in subreddit_names:
            try:
                # Remove 'r/' prefix if present
                clean_name = subreddit_name.replace('r/', '')
                subreddit = self.reddit.subreddit(clean_name)
                
                # Fetch recent posts
                for post in subreddit.new(limit=limit):
                    matched_keywords = self._find_matching_keywords(
                        f"{post.title} {post.selftext}", keywords
                    )
                    
                    if matched_keywords:
                        # Use AI for sentiment analysis
                        try:
                            from app.services.ai_service import ai_service
                            sentiment, confidence = await ai_service.detect_sentiment(f"{post.title} {post.selftext}")
                        except Exception as e:
                            print(f"AI sentiment failed, using fallback: {e}")
                            sentiment = self._detect_simple_sentiment(post.title, post.selftext)
                        
                        mention = Mention(
                            id=post.id,
                            type="post",
                            subreddit=f"r/{clean_name}",
                            title=post.title,
                            url=f"https://reddit.com{post.permalink}",
                            author=str(post.author) if post.author else "[deleted]",
                            created_utc=int(post.created_utc),
                            matched_keywords=matched_keywords,
                            snippet=self._create_snippet(post.title, post.selftext),
                            priority=self._calculate_priority(post.title, post.selftext, keywords),
                            sentiment=sentiment,
                            score=post.score,  # Add upvotes
                            num_comments=post.num_comments  # Add comment count
                        )
                        mentions.append(mention)
                
            except Exception as e:
                print(f"Error fetching from {subreddit_name}: {e}")
                continue
        
        # Sort by creation time (newest first)
        return sorted(mentions, key=lambda x: x.created_utc, reverse=True)
    
    def get_post_with_comments(self, post_id: str, comment_limit: int = 30) -> Dict:
        """Get a post with its top comments for summarization"""
        try:
            submission = self.reddit.submission(id=post_id)
            submission.comments.replace_more(limit=0)  # Remove "more comments" objects
            
            comments = []
            for comment in submission.comments[:comment_limit]:
                if hasattr(comment, 'body') and comment.body != '[deleted]':
                    comments.append({
                        'author': str(comment.author) if comment.author else '[deleted]',
                        'body': comment.body,
                        'score': comment.score,
                        'created_utc': int(comment.created_utc)
                    })
            
            return {
                'post': {
                    'title': submission.title,
                    'body': submission.selftext,
                    'author': str(submission.author) if submission.author else '[deleted]',
                    'score': submission.score,
                    'created_utc': int(submission.created_utc)
                },
                'comments': comments
            }
        
        except Exception as e:
            print(f"Error fetching post {post_id}: {e}")
            return None
    
    def _calculate_activity_score(self, subreddit) -> float:
        """Calculate activity score (posts per day heuristic)"""
        # Simple heuristic based on subscriber count
        # In a real implementation, you'd track posts over time
        if subreddit.subscribers:
            return min(subreddit.subscribers / 1000, 100.0)
        return 1.0
    
    def _calculate_relevance_score(self, subreddit, query: str) -> float:
        """Calculate relevance score based on keyword match"""
        score = 0.0
        query_lower = query.lower()
        
        # Check subreddit name
        if query_lower in subreddit.display_name.lower():
            score += 0.5
        
        # Check description
        description = (subreddit.public_description or subreddit.description or "").lower()
        if query_lower in description:
            score += 0.3
        
        # Boost based on subscriber count (normalized)
        if subreddit.subscribers:
            score += min(subreddit.subscribers / 100000, 0.2)
        
        return score
    
    def _find_matching_keywords(self, text: str, keywords: List[str]) -> List[str]:
        """Find which keywords match in the given text"""
        text_lower = text.lower()
        matched = []
        
        for keyword in keywords:
            if keyword.lower() in text_lower:
                matched.append(keyword)
        
        return matched
    
    def _create_snippet(self, title: str, body: str, max_length: int = 200) -> str:
        """Create a snippet from title and body"""
        text = f"{title}. {body}" if body else title
        text = text.replace('\n', ' ').strip()
        
        if len(text) > max_length:
            return text[:max_length] + "..."
        return text
    
    def _calculate_priority(self, title: str, body: str, keywords: List[str]) -> str:
        """Calculate priority based on content analysis"""
        text = f"{title} {body}".lower()
        
        # High priority indicators
        high_priority_indicators = ['help', 'problem', 'issue', 'broken', 'not working', '?']
        negative_indicators = ['bad', 'terrible', 'awful', 'hate', 'worst']
        
        for indicator in high_priority_indicators + negative_indicators:
            if indicator in text:
                return "high"
        
        return "normal"
    
    def _detect_simple_sentiment(self, title: str, body: str = "") -> str:
        """Simple sentiment detection without LLM"""
        text = f"{title} {body}".lower()
        
        positive_words = ["great", "awesome", "amazing", "love", "excellent", "fantastic", "good", "happy", "thanks", "helpful", "wonderful", "perfect", "best", "impressive"]
        negative_words = ["bad", "terrible", "awful", "hate", "worst", "horrible", "broken", "problem", "issue", "frustrated", "angry", "disappointing", "useless", "fail", "disaster"]
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        if negative_count > positive_count:
            return "negative"
        elif positive_count > negative_count:
            return "positive"
        else:
            return "neutral"

# Global instance
reddit_service = RedditService()
