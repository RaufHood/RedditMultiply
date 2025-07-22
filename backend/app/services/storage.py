from typing import Optional, List, Dict
from app.models.schemas import BrandContext, Mention, ReplyDraft
import time

class InMemoryStorage:
    def __init__(self):
        self.brand_context: Optional[BrandContext] = None
        self.mentions: List[Mention] = []
        self.reply_drafts: List[ReplyDraft] = []
        self.monitoring_config: Optional[Dict] = None
        self.monitoring_active: bool = False
    
    def get_brand_context(self) -> Optional[BrandContext]:
        return self.brand_context
    
    def set_brand_context(self, context: BrandContext):
        self.brand_context = context
    
    def get_mentions(self) -> List[Mention]:
        return self.mentions
    
    def add_mentions(self, new_mentions: List[Mention]):
        # Add only new mentions (avoid duplicates)
        existing_ids = {m.id for m in self.mentions}
        for mention in new_mentions:
            if mention.id not in existing_ids:
                self.mentions.append(mention)
        
        # Sort by creation time (newest first)
        self.mentions.sort(key=lambda x: x.created_utc, reverse=True)
        
        # Keep only last 500 mentions to prevent memory issues
        self.mentions = self.mentions[:500]
    
    def get_mention_by_id(self, mention_id: str) -> Optional[Mention]:
        return next((m for m in self.mentions if m.id == mention_id), None)
    
    def update_mention_status(self, mention_id: str, status: str) -> bool:
        for mention in self.mentions:
            if mention.id == mention_id:
                mention.status = status
                return True
        return False
    
    def update_mention_status_with_timestamp(self, mention_id: str, status: str, timestamp: int) -> bool:
        for mention in self.mentions:
            if mention.id == mention_id:
                mention.status = status
                if status == "RESPONDED":
                    mention.responded_at = timestamp
                return True
        return False
    
    def add_reply_draft(self, draft: ReplyDraft):
        self.reply_drafts.append(draft)
    
    def get_reply_draft_by_id(self, draft_id: str) -> Optional[ReplyDraft]:
        return next((d for d in self.reply_drafts if d.id == draft_id), None)
    
    def set_monitoring_config(self, config: Dict):
        self.monitoring_config = config
    
    def get_monitoring_config(self) -> Optional[Dict]:
        return self.monitoring_config
    
    def set_monitoring_active(self, active: bool):
        self.monitoring_active = active
    
    def is_monitoring_active(self) -> bool:
        return self.monitoring_active

# Global storage instance
storage = InMemoryStorage()
