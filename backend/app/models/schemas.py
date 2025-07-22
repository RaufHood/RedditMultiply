from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal, Union, Any
from datetime import datetime

class BrandContext(BaseModel):
    brand_name: str
    one_line: str
    products: List[str] = []
    target_users: List[str] = []
    value_props: List[str] = []
    tone: Dict[str, Union[str, List[str]]] = Field(default_factory=lambda: {"formality": "neutral", "voice_keywords": []})
    keywords: List[str] = []
    competitors: List[str] = []
    prohibited: List[str] = []
    disclosure_template: str = "I work at {{brandName}}..."

class SubredditProfile(BaseModel):
    name: str
    description: str = ""
    member_count: int = 0
    activity_score: float = 0.0  # posts/day heuristic
    relevance_score: float = 0.0  # keyword match weighting
    status: Literal["selected", "candidate"] = "candidate"

class Mention(BaseModel):
    id: str  # reddit post or comment id
    type: Literal["post", "comment"]
    subreddit: str
    title: Optional[str] = None  # for posts
    url: str
    author: str
    created_utc: int
    matched_keywords: List[str] = []
    snippet: str
    status: Literal["NEW", "RESPONDED", "IGNORED"] = "NEW"
    summary: Optional[str] = None
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    priority: Literal["high", "normal", "low"] = "normal"
    reply_draft_id: Optional[str] = None
    score: int = 0  # Reddit post score (upvotes - downvotes)
    num_comments: int = 0  # Number of comments on the post
    responded_at: Optional[int] = None  # Timestamp when marked as responded

class ReplyDraft(BaseModel):
    id: str
    mention_id: str
    original_prompt: str
    draft_text: str
    compliance: Dict[str, Any] = Field(default_factory=lambda: {"issues": [], "score": 100})
    created_utc: int

class AnalyticsSnapshot(BaseModel):
    timestamp: int
    mention_totals: int = 0
    by_sentiment: Dict[str, int] = Field(default_factory=lambda: {"positive": 0, "neutral": 0, "negative": 0})
    by_subreddit: List[Dict[str, Any]] = []
    responded_count: int = 0
    avg_response_minutes: float = 0.0

# Request/Response models
class BrandContextRequest(BaseModel):
    brand_name: Optional[str] = None
    one_line: Optional[str] = None
    products: Optional[List[str]] = None
    target_users: Optional[List[str]] = None
    value_props: Optional[List[str]] = None
    tone: Optional[Dict[str, Union[str, List[str]]]] = None
    keywords: Optional[List[str]] = None
    competitors: Optional[List[str]] = None
    prohibited: Optional[List[str]] = None
    disclosure_template: Optional[str] = None

class DiscoverSubredditsRequest(BaseModel):
    keywords: List[str]

class MonitorConfigRequest(BaseModel):
    subreddits: List[str]
    keywords: List[str]

class UpdateMentionStatusRequest(BaseModel):
    id: str
    status: Literal["NEW", "RESPONDED", "IGNORED"]

class AddKeywordRequest(BaseModel):
    keyword: str

class DraftReplyRequest(BaseModel):
    mention_id: str
    regen: Optional[bool] = False 