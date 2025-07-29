import { Insight, KnowledgeBase, PendingInsight } from './api'

// Sample data for demo initialization
const sampleInsights: KnowledgeBase = {
  'competitor-analysis': [
    {
      id: 'comp-001',
      title: 'Competitor X launches new pricing model',
      content: 'Major competitor shifted to usage-based pricing, undercutting our enterprise tier by 30%. They announced it on their blog and several users on r/SaaS are discussing the impact.',
      priority: 'high',
      source: 'r/SaaS',
      created_at: '2025-01-27T10:00:00Z',
      action_items: 'Review our pricing strategy within 2 weeks',
      tags: ['pricing', 'competition', 'enterprise']
    },
    {
      id: 'comp-002',
      title: 'New startup gets $50M funding in our space',
      content: 'YC-backed startup just raised Series B to compete directly with our core product. Reddit discussions show they\'re targeting SMBs first.',
      priority: 'medium',
      source: 'r/startups',
      created_at: '2025-01-26T14:30:00Z',
      action_items: 'Research their product and pricing',
      tags: ['funding', 'startup', 'competition']
    }
  ],
  'customer-sentiment': [
    {
      id: 'sent-001', 
      title: 'Users frustrated with mobile app performance',
      content: 'Multiple Reddit threads complaining about slow load times on mobile app. Users reporting 5+ second load times and crashes on older devices.',
      priority: 'medium',
      source: 'r/mobiledevelopment',
      created_at: '2025-01-26T15:30:00Z',
      tags: ['mobile', 'performance', 'ux']
    },
    {
      id: 'sent-002',
      title: 'Positive feedback on new dashboard feature',
      content: 'Users on r/webdev praising our new analytics dashboard. Several mentions of improved user experience and better data visualization.',
      priority: 'low',
      source: 'r/webdev',
      created_at: '2025-01-25T11:15:00Z',
      action_items: 'Amplify positive feedback in marketing materials',
      tags: ['dashboard', 'analytics', 'positive']
    }
  ],
  'market-trends': [
    {
      id: 'trend-001',
      title: 'AI integration becoming standard expectation',
      content: 'Multiple posts across tech subreddits discussing how AI features are now expected in SaaS products. Users comparing tools based on AI capabilities.',
      priority: 'high',
      source: 'r/artificial',
      created_at: '2025-01-27T09:20:00Z',
      action_items: 'Accelerate AI feature development roadmap',
      tags: ['ai', 'saas', 'trends']
    }
  ],
  'product-intelligence': [
    {
      id: 'prod-001',
      title: 'Users requesting API rate limit increases',
      content: 'Several enterprise customers on r/APIs discussing our rate limits being too restrictive for their use cases. They\'re comparing with competitor offerings.',
      priority: 'medium',
      source: 'r/APIs',
      created_at: '2025-01-26T16:45:00Z',
      action_items: 'Review enterprise API limits and pricing tiers',
      tags: ['api', 'enterprise', 'limits']
    }
  ]
}

export class KnowledgeStorage {
  private STORAGE_KEY = 'reddit-knowledge-base'
  
  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (typeof window !== 'undefined' && !localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleInsights))
    }
  }
  
  getCategory(category: keyof KnowledgeBase): Insight[] {
    const data = this.getData()
    return data[category] || []
  }
  
  getAllCategories(): string[] {
    return ['competitor-analysis', 'customer-sentiment', 'market-trends', 'product-intelligence']
  }
  
  saveInsight(category: keyof KnowledgeBase, insight: Insight): void {
    if (typeof window === 'undefined') return
    
    const data = this.getData()
    if (!data[category]) data[category] = []
    
    data[category].unshift(insight) // Add to beginning
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }
  
  updateInsight(category: keyof KnowledgeBase, insightId: string, updates: Partial<Insight>): void {
    if (typeof window === 'undefined') return
    
    const data = this.getData()
    if (!data[category]) return
    
    const index = data[category].findIndex(insight => insight.id === insightId)
    if (index !== -1) {
      data[category][index] = { ...data[category][index], ...updates }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    }
  }
  
  deleteInsight(category: keyof KnowledgeBase, insightId: string): void {
    if (typeof window === 'undefined') return
    
    const data = this.getData()
    if (!data[category]) return
    
    data[category] = data[category].filter(insight => insight.id !== insightId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }
  
  searchInsights(query: string): Insight[] {
    const data = this.getData()
    const allInsights = Object.values(data).flat()
    const searchTerm = query.toLowerCase()
    
    return allInsights.filter(insight => 
      insight.title.toLowerCase().includes(searchTerm) ||
      insight.content.toLowerCase().includes(searchTerm) ||
      insight.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
      insight.source.toLowerCase().includes(searchTerm)
    )
  }
  
  getInsightsByPriority(priority: 'high' | 'medium' | 'low'): Insight[] {
    const data = this.getData()
    const allInsights = Object.values(data).flat()
    return allInsights.filter(insight => insight.priority === priority)
  }
  
  getRecentInsights(limit: number = 10): Insight[] {
    const data = this.getData()
    const allInsights = Object.values(data).flat()
    
    return allInsights
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
  
  exportData(): string {
    const data = this.getData()
    return JSON.stringify(data, null, 2)
  }
  
  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      throw new Error('Invalid JSON data for import')
    }
  }
  
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
  
  private getData(): KnowledgeBase {
    if (typeof window === 'undefined') {
      return {
        'competitor-analysis': [],
        'customer-sentiment': [],
        'market-trends': [],
        'product-intelligence': []
      }
    }
    
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : {
      'competitor-analysis': [],
      'customer-sentiment': [],
      'market-trends': [],
      'product-intelligence': []
    }
  }
}

export class PendingQueue {
  private PENDING_KEY = 'reddit-pending-insights'
  
  addToPending(insight: PendingInsight): void {
    if (typeof window === 'undefined') return
    
    const pending = this.getPending()
    pending.push(insight)
    localStorage.setItem(this.PENDING_KEY, JSON.stringify(pending))
  }
  
  getPending(): PendingInsight[] {
    if (typeof window === 'undefined') {
      return []
    }
    
    const stored = localStorage.getItem(this.PENDING_KEY)
    return stored ? JSON.parse(stored) : []
  }
  
  approvePending(id: string, category: keyof KnowledgeBase): void {
    const pending = this.getPending()
    const insight = pending.find(p => p.id === id)
    
    if (insight) {
      // Move to main knowledge base
      const storage = new KnowledgeStorage()
      const { status, suggestedCategory, confidence, originalText, ...cleanInsight } = insight
      storage.saveInsight(category, cleanInsight)
      
      // Remove from pending
      this.removePending(id)
    }
  }
  
  rejectPending(id: string): void {
    this.removePending(id)
  }
  
  updatePending(id: string, updates: Partial<PendingInsight>): void {
    const pending = this.getPending()
    const index = pending.findIndex(p => p.id === id)
    
    if (index !== -1) {
      pending[index] = { ...pending[index], ...updates }
      localStorage.setItem(this.PENDING_KEY, JSON.stringify(pending))
    }
  }
  
  private removePending(id: string): void {
    const pending = this.getPending().filter(p => p.id !== id)
    localStorage.setItem(this.PENDING_KEY, JSON.stringify(pending))
  }
}