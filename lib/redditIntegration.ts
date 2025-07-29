import { Mention, PendingInsight } from './api'
import { categorizeRedditPost } from './aiCategorizer'
import { PendingQueue } from './knowledgeStorage'

export interface RedditInsightExtraction {
  insights: PendingInsight[]
  processed: boolean
  error?: string
}

// Extract business insights from Reddit posts/comments
export async function extractInsightsFromMention(mention: Mention): Promise<RedditInsightExtraction> {
  try {
    const postContent = `${mention.title || ''} ${mention.snippet}`.trim()
    
    // Skip if content is too short or not informative
    if (postContent.length < 50) {
      return { insights: [], processed: false }
    }
    
    // Use AI to categorize and extract insights
    const categorization = await categorizeRedditPost({
      title: mention.title || '',
      content: mention.snippet,
      subreddit: mention.subreddit,
      comments_count: mention.num_comments,
      score: mention.score
    })
    
    // Generate insight title and content
    const insightTitle = generateInsightTitle(mention, categorization.category)
    const insightContent = generateInsightContent(mention, categorization.reasoning)
    
    const pendingInsight: PendingInsight = {
      id: `reddit-${mention.id}-${Date.now()}`,
      title: insightTitle,
      content: insightContent,
      priority: determinePriority(mention, categorization.confidence),
      source: mention.subreddit,
      created_at: new Date().toISOString(),
      status: 'pending',
      suggestedCategory: categorization.category,
      confidence: categorization.confidence,
      originalText: `${mention.title || ''}\n\n${mention.snippet}`,
      tags: generateTags(mention, categorization.category),
      action_items: generateActionItems(mention, categorization.category)
    }
    
    return {
      insights: [pendingInsight],
      processed: true
    }
  } catch (error) {
    console.error('Failed to extract insights from mention:', error)
    return {
      insights: [],
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Process multiple mentions in batch
export async function batchProcessMentions(mentions: Mention[]): Promise<{
  processed: PendingInsight[]
  failed: string[]
  summary: {
    total: number
    successful: number
    failed: number
  }
}> {
  const processed: PendingInsight[] = []
  const failed: string[] = []
  
  for (const mention of mentions) {
    try {
      const result = await extractInsightsFromMention(mention)
      if (result.processed) {
        processed.push(...result.insights)
      }
    } catch (error) {
      failed.push(mention.id)
      console.error(`Failed to process mention ${mention.id}:`, error)
    }
  }
  
  return {
    processed,
    failed,
    summary: {
      total: mentions.length,
      successful: processed.length,
      failed: failed.length
    }
  }
}

// Auto-add insights to pending queue when new mentions arrive
export async function autoProcessNewMentions(mentions: Mention[]): Promise<void> {
  const pendingQueue = new PendingQueue()
  
  // Only process high-value mentions to avoid noise
  const filteredMentions = mentions.filter(mention => 
    mention.score > 5 || // High engagement
    mention.num_comments > 3 || // Active discussion
    mention.priority === 'high' || // Manually marked important
    mention.matched_keywords.length > 1 // Multiple keyword matches
  )
  
  if (filteredMentions.length === 0) return
  
  const result = await batchProcessMentions(filteredMentions)
  
  // Add to pending queue
  result.processed.forEach(insight => {
    pendingQueue.addToPending(insight)
  })
  
  // Notify UI of new pending insights
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newPendingInsights', {
      detail: {
        count: result.processed.length,
        failed: result.failed.length
      }
    }))
  }
}

// Helper functions
function generateInsightTitle(mention: Mention, category: string): string {
  const templates = {
    'competitor-analysis': [
      `Competitor discussion in ${mention.subreddit}`,
      `Market positioning insights from ${mention.subreddit}`,
      `Competitive intelligence from Reddit discussion`
    ],
    'customer-sentiment': [
      `Customer feedback from ${mention.subreddit}`,
      `User sentiment analysis from Reddit`,
      `Customer experience insights`
    ],
    'market-trends': [
      `Market trend spotted in ${mention.subreddit}`,
      `Industry trend discussion`,
      `Market intelligence from Reddit`
    ],
    'product-intelligence': [
      `Product feedback from ${mention.subreddit}`,
      `Feature request insights`,
      `Product development intelligence`
    ]
  }
  
  const categoryTemplates = templates[category as keyof typeof templates] || templates['competitor-analysis']
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]
  
  return template
}

function generateInsightContent(mention: Mention, reasoning: string): string {
  const content = `
Reddit Post Analysis:

**Source**: ${mention.subreddit} (${mention.score} upvotes, ${mention.num_comments} comments)
**Original Content**: ${mention.title ? `"${mention.title}"` : ''} ${mention.snippet}

**Business Intelligence**: 
${reasoning}

**Discussion Context**:
- Post engagement: ${mention.score} upvotes with ${mention.num_comments} comments
- Keywords matched: ${mention.matched_keywords.join(', ')}
- Community: ${mention.subreddit}

**Potential Impact**:
This discussion represents community sentiment and could indicate broader market trends or customer needs worth monitoring.
`.trim()
  
  return content
}

function determinePriority(mention: Mention, confidence: number): 'high' | 'medium' | 'low' {
  // High priority: high engagement + high confidence
  if (mention.score > 20 && mention.num_comments > 10 && confidence > 0.8) {
    return 'high'
  }
  
  // High priority: manually marked or multiple keyword matches
  if (mention.priority === 'high' || mention.matched_keywords.length > 2) {
    return 'high'
  }
  
  // Medium priority: decent engagement or good confidence
  if (mention.score > 5 || mention.num_comments > 3 || confidence > 0.7) {
    return 'medium'
  }
  
  return 'low'
}

function generateTags(mention: Mention, category: string): string[] {
  const baseTags = ['ai-generated', 'reddit', mention.subreddit]
  
  // Add category-specific tags
  switch (category) {
    case 'competitor-analysis':
      baseTags.push('competition', 'market-analysis')
      break
    case 'customer-sentiment':
      baseTags.push('customer-feedback', 'sentiment')
      break
    case 'market-trends':
      baseTags.push('trends', 'market-intelligence')
      break
    case 'product-intelligence':
      baseTags.push('product-feedback', 'development')
      break
  }
  
  // Add engagement level tags
  if (mention.score > 20) baseTags.push('high-engagement')
  if (mention.num_comments > 10) baseTags.push('active-discussion')
  
  return baseTags
}

function generateActionItems(mention: Mention, category: string): string | undefined {
  const actionTemplates = {
    'competitor-analysis': [
      'Monitor competitor responses and market reaction',
      'Research mentioned competitors and their strategies',
      'Update competitive analysis documentation'
    ],
    'customer-sentiment': [
      'Follow up on customer concerns raised',
      'Consider addressing pain points in product roadmap',
      'Monitor sentiment trends over time'
    ],
    'market-trends': [
      'Investigate trend implications for our market position',
      'Research trend adoption rates and timeline',
      'Assess strategic opportunities from this trend'
    ],
    'product-intelligence': [
      'Evaluate feasibility of mentioned features',
      'Add to product backlog for consideration',
      'Research technical requirements and user demand'
    ]
  }
  
  const templates = actionTemplates[category as keyof typeof actionTemplates]
  if (!templates) return undefined
  
  return templates[Math.floor(Math.random() * templates.length)]
}