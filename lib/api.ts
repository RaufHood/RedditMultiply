const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'  // Production: use relative API path
    : 'http://localhost:8000'  // Development: use local backend
)

// Debug log to see what URL is being used
console.log('🔧 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  API_BASE_URL
})

// Types matching backend schemas
export interface BrandContext {
  brand_name: string
  one_line: string
  products: string[]
  target_users: string[]
  value_props: string[]
  tone: {
    formality: string
    voice_keywords: string[]
  }
  keywords: string[]
  competitors: string[]
  prohibited: string[]
  disclosure_template: string
}

export interface SubredditProfile {
  name: string
  description: string
  member_count: number
  activity_score: number
  relevance_score: number
  status: 'selected' | 'candidate'
}

export interface Mention {
  id: string
  type: 'post' | 'comment'
  subreddit: string
  title?: string
  url: string
  author: string
  created_utc: number
  matched_keywords: string[]
  snippet: string
  status: 'NEW' | 'RESPONDED' | 'IGNORED'
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  priority: 'high' | 'normal' | 'low'
  reply_draft_id?: string
  score: number  // Reddit post score (upvotes - downvotes)
  num_comments: number  // Number of comments on the post
  responded_at?: number  // Timestamp when marked as responded
}

export interface ReplyDraft {
  id: string
  mention_id: string
  original_prompt: string
  draft_text: string
  compliance: {
    issues: Array<{
      severity: string
      message: string
    }>
    score: number
  }
  created_utc: number
}

export interface AnalyticsSnapshot {
  timestamp: number
  mention_totals: number
  by_sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  by_subreddit: Array<{
    name: string
    count: number
  }>
  responded_count: number
  avg_response_minutes: number
}

// API Service Functions
export const api = {
  // Brand Context
  async saveBrandContext(data: Partial<BrandContext>): Promise<BrandContext> {
    const response = await fetch(`${API_BASE_URL}/brand/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to save brand context')
    return response.json()
  },

  async getBrandContext(): Promise<BrandContext> {
    const response = await fetch(`${API_BASE_URL}/brand/context`)
    if (!response.ok) throw new Error('Brand context not found')
    return response.json()
  },

  // Subreddit Discovery
  async discoverSubreddits(keywords: string[]): Promise<SubredditProfile[]> {
    const response = await fetch(`${API_BASE_URL}/subreddits/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    })
    if (!response.ok) throw new Error('Failed to discover subreddits')
    return response.json()
  },

  async searchSubreddits(query: string): Promise<SubredditProfile[]> {
    const response = await fetch(`${API_BASE_URL}/subreddits/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to search subreddits')
    return response.json()
  },

  // Monitoring
  async configureMonitoring(subreddits: string[], keywords: string[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitor/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subreddits, keywords })
    })
    if (!response.ok) throw new Error('Failed to configure monitoring')
    return response.json()
  },

  async getMentions(filters?: {
    status?: string
    priority?: string
    q?: string
  }): Promise<Mention[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.q) params.append('q', filters.q)

    const response = await fetch(`${API_BASE_URL}/monitor/mentions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch mentions')
    return response.json()
  },

  async getMention(id: string): Promise<Mention> {
    const response = await fetch(`${API_BASE_URL}/monitor/mentions/${id}`)
    if (!response.ok) throw new Error('Failed to fetch mention')
    return response.json()
  },

  async updateMentionStatus(id: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitor/mentions/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    if (!response.ok) throw new Error('Failed to update mention status')
    return response.json()
  },

  async addKeyword(keyword: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitor/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to add keyword')
    }
    return response.json()
  },

  async removeKeyword(keyword: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitor/keywords/${encodeURIComponent(keyword)}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to remove keyword')
    }
    return response.json()
  },

  async getMonitoringStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitor/status`)
    if (!response.ok) throw new Error('Failed to get monitoring status')
    return response.json()
  },

  // Thread Analysis
  async getThreadSummary(threadId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to get thread summary')
    return response.json()
  },

  // Reply Drafts
  async generateReplyDraft(mentionId: string, regen?: boolean): Promise<ReplyDraft> {
    const response = await fetch(`${API_BASE_URL}/replies/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mention_id: mentionId, regen })
    })
    if (!response.ok) throw new Error('Failed to generate reply draft')
    return response.json()
  },

  async getReplyDraft(draftId: string): Promise<ReplyDraft> {
    const response = await fetch(`${API_BASE_URL}/replies/draft/${draftId}`)
    if (!response.ok) throw new Error('Failed to get reply draft')
    return response.json()
  },

  async checkCompliance(draftText: string, subreddit?: string): Promise<any> {
    const params = new URLSearchParams({ draft_text: draftText })
    if (subreddit) params.append('subreddit', subreddit)

    const response = await fetch(`${API_BASE_URL}/replies/compliance/check?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    if (!response.ok) throw new Error('Failed to check compliance')
    return response.json()
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSnapshot> {
    const response = await fetch(`${API_BASE_URL}/analytics/`)
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  }
}

// Utility functions
export const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export const formatMemberCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

// Knowledge Base Types
export interface Insight {
  id: string
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  source: string              // e.g., "r/startup"
  created_at: string          // ISO timestamp
  action_items?: string       // Optional next steps
  tags?: string[]            // For better search
}

export interface KnowledgeBase {
  'competitor-analysis': Insight[]
  'customer-sentiment': Insight[]  
  'market-trends': Insight[]
  'product-intelligence': Insight[]
}

export interface PendingInsight extends Insight {
  status: 'pending' | 'approved' | 'rejected'
  suggestedCategory: string
  confidence: number
  originalText?: string  // Reddit post content
}
