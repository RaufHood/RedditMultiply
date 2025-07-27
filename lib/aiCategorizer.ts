import { KnowledgeBase } from './api'

export interface CategorizationResult {
  category: keyof KnowledgeBase
  confidence: number
  reasoning: string
}

// Simple rule-based categorization for demo
// In production, this would use OpenAI API
export async function categorizeInsight(text: string): Promise<CategorizationResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const content = text.toLowerCase()
  
  // Competitor Analysis keywords
  const competitorKeywords = [
    'competitor', 'rival', 'competition', 'pricing', 'alternative', 
    'market share', 'feature comparison', 'competitive advantage',
    'benchmark', 'outselling', 'undercut', 'launch', 'startup funding'
  ]
  
  // Customer Sentiment keywords
  const sentimentKeywords = [
    'customer', 'user', 'feedback', 'review', 'sentiment', 'experience',
    'satisfaction', 'frustrated', 'complaining', 'happy', 'love',
    'hate', 'disappointed', 'excited', 'positive', 'negative'
  ]
  
  // Market Trends keywords
  const trendsKeywords = [
    'trend', 'market', 'industry', 'adoption', 'growth', 'emerging',
    'shifting', 'demand', 'popularity', 'standard', 'expectation',
    'ai integration', 'automation', 'digital transformation'
  ]
  
  // Product Intelligence keywords
  const productKeywords = [
    'feature', 'product', 'api', 'functionality', 'development',
    'rate limit', 'performance', 'bug', 'enhancement', 'roadmap',
    'integration', 'mobile app', 'dashboard', 'analytics'
  ]
  
  // Count keyword matches
  const scores = {
    'competitor-analysis': competitorKeywords.filter(keyword => content.includes(keyword)).length,
    'customer-sentiment': sentimentKeywords.filter(keyword => content.includes(keyword)).length,
    'market-trends': trendsKeywords.filter(keyword => content.includes(keyword)).length,
    'product-intelligence': productKeywords.filter(keyword => content.includes(keyword)).length
  }
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores))
  const bestCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as keyof KnowledgeBase
  
  // If no clear winner, use context-based heuristics
  let finalCategory: keyof KnowledgeBase = bestCategory || 'competitor-analysis'
  let confidence = 0.6 // Base confidence
  let reasoning = 'Based on keyword analysis'
  
  if (maxScore === 0) {
    // Fallback heuristics when no keywords match
    if (content.includes('reddit') || content.includes('post') || content.includes('discussion')) {
      if (content.includes('price') || content.includes('cost') || content.includes('expensive')) {
        finalCategory = 'competitor-analysis'
        reasoning = 'Discussion about pricing indicates competitive intelligence'
      } else if (content.includes('good') || content.includes('bad') || content.includes('better')) {
        finalCategory = 'customer-sentiment'
        reasoning = 'Evaluative language suggests customer sentiment'
      } else {
        finalCategory = 'market-trends'
        reasoning = 'Social media discussion likely indicates market trends'
      }
      confidence = 0.5
    }
  } else {
    // Boost confidence based on score
    confidence = Math.min(0.9, 0.6 + (maxScore * 0.1))
    
    const matchedKeywords = (() => {
      switch (finalCategory) {
        case 'competitor-analysis':
          return competitorKeywords.filter(k => content.includes(k))
        case 'customer-sentiment':
          return sentimentKeywords.filter(k => content.includes(k))
        case 'market-trends':
          return trendsKeywords.filter(k => content.includes(k))
        case 'product-intelligence':
          return productKeywords.filter(k => content.includes(k))
      }
    })()
    
    reasoning = `Detected ${matchedKeywords.length} relevant keywords: ${matchedKeywords.slice(0, 3).join(', ')}${matchedKeywords.length > 3 ? '...' : ''}`
  }
  
  return {
    category: finalCategory,
    confidence,
    reasoning
  }
}

// Enhanced categorization for Reddit posts
export async function categorizeRedditPost(post: {
  title: string
  content: string
  subreddit: string
  comments_count?: number
  score?: number
}): Promise<CategorizationResult> {
  const fullText = `${post.title} ${post.content}`.toLowerCase()
  const subreddit = post.subreddit.toLowerCase()
  
  // Subreddit-specific categorization
  let categoryBonus: Partial<Record<keyof KnowledgeBase, number>> = {}
  
  if (subreddit.includes('startup') || subreddit.includes('entrepreneur')) {
    categoryBonus['competitor-analysis'] = 0.2
    categoryBonus['market-trends'] = 0.15
  } else if (subreddit.includes('customer') || subreddit.includes('review')) {
    categoryBonus['customer-sentiment'] = 0.3
  } else if (subreddit.includes('programming') || subreddit.includes('dev')) {
    categoryBonus['product-intelligence'] = 0.2
  } else if (subreddit.includes('business') || subreddit.includes('market')) {
    categoryBonus['market-trends'] = 0.2
    categoryBonus['competitor-analysis'] = 0.15
  }
  
  const baseResult = await categorizeInsight(fullText)
  
  // Apply subreddit bonus
  const bonusAmount = categoryBonus[baseResult.category] || 0
  const newConfidence = Math.min(0.95, baseResult.confidence + bonusAmount)
  
  return {
    ...baseResult,
    confidence: newConfidence,
    reasoning: bonusAmount > 0 
      ? `${baseResult.reasoning} + ${subreddit} context boost`
      : baseResult.reasoning
  }
}

// For production: OpenAI-based categorization
export async function categorizeWithOpenAI(text: string): Promise<CategorizationResult> {
  // This would call the OpenAI API in production
  const prompt = `
  Categorize this business insight into one of these categories:
  - competitor-analysis: Information about competitors, their strategies, pricing, products
  - customer-sentiment: Customer feedback, opinions, satisfaction, complaints
  - market-trends: Industry trends, emerging patterns, market shifts
  - product-intelligence: Product features, technical requirements, development insights
  
  Text: "${text}"
  
  Respond with JSON: {"category": "...", "confidence": 0.0-1.0, "reasoning": "..."}
  `
  
  try {
    // Placeholder for actual OpenAI API call
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.3
    // })
    
    // For now, fall back to rule-based
    return await categorizeInsight(text)
  } catch (error) {
    console.error('OpenAI categorization failed:', error)
    // Fallback to rule-based categorization
    return await categorizeInsight(text)
  }
}