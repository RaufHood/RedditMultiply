'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Brain, Sparkles, ArrowUp, Loader2, Target, Heart, TrendingUp, Search, CheckCircle, X } from "lucide-react"
import { CodeComparison } from "@/components/magicui/code-comparison"

interface Suggestion {
  category: 'competitor-analysis' | 'customer-sentiment' | 'market-trends' | 'product-intelligence'
  confidence: number
  reason: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  title: string
}

export default function KnowledgeBase2Page() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [beforeContent, setBeforeContent] = useState('')
  const [afterContent, setAfterContent] = useState('')
  const [showComparison, setShowComparison] = useState(false)

  const categorizeContent = (text: string): Suggestion => {
    const lowerText = text.toLowerCase()
    
    // Keywords for each category
    const competitorKeywords = ['competitor', 'competition', 'rival', 'market share', 'competitor analysis', 'threat', 'competitive advantage', 'pricing strategy']
    const sentimentKeywords = ['customer', 'feedback', 'review', 'sentiment', 'satisfaction', 'complaint', 'happy', 'unhappy', 'user experience', 'support']
    const trendsKeywords = ['trend', 'market', 'industry', 'growth', 'emerging', 'future', 'prediction', 'forecast', 'opportunity']
    const productKeywords = ['product', 'feature', 'functionality', 'bug', 'enhancement', 'usability', 'performance', 'integration']
    
    const scores = {
      'competitor-analysis': competitorKeywords.filter(keyword => lowerText.includes(keyword)).length,
      'customer-sentiment': sentimentKeywords.filter(keyword => lowerText.includes(keyword)).length,
      'market-trends': trendsKeywords.filter(keyword => lowerText.includes(keyword)).length,
      'product-intelligence': productKeywords.filter(keyword => lowerText.includes(keyword)).length
    }
    
    const maxScore = Math.max(...Object.values(scores))
    const category = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as keyof typeof scores
    
    const categoryMap = {
      'competitor-analysis': { icon: Target, color: 'text-blue-600', title: 'Competitor Analysis', confidence: maxScore * 20 },
      'customer-sentiment': { icon: Heart, color: 'text-pink-600', title: 'Customer Sentiment', confidence: maxScore * 20 },
      'market-trends': { icon: TrendingUp, color: 'text-green-600', title: 'Market Trends', confidence: maxScore * 20 },
      'product-intelligence': { icon: Search, color: 'text-purple-600', title: 'Product Intelligence', confidence: maxScore * 20 }
    }
    
    return {
      category,
      confidence: Math.min(Math.max(categoryMap[category].confidence, 15), 95), // Ensure reasonable confidence range
      reason: `Detected ${maxScore} relevant keywords for ${categoryMap[category].title}`,
      icon: categoryMap[category].icon,
      color: categoryMap[category].color,
      title: categoryMap[category].title
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return
    
    setIsProcessing(true)
    
    // Analyze content and suggest category
    const newSuggestion = categorizeContent(input.trim())
    setSuggestion(newSuggestion)
    
    // Load current content from the suggested page
    const currentContent = localStorage.getItem(`kb2-${newSuggestion.category}-content`) || ''
    setBeforeContent(currentContent)
    setAfterContent(currentContent + '\n\n' + input.trim())
    
    setTimeout(() => {
      setIsProcessing(false)
      setShowComparison(true)
    }, 1500)
  }

  const acceptSuggestion = () => {
    if (!suggestion) return
    
    // Save the updated content to localStorage
    localStorage.setItem(`kb2-${suggestion.category}-content`, afterContent)
    
    // Reset form
    setInput('')
    setSuggestion(null)
    setShowComparison(false)
    setBeforeContent('')
    setAfterContent('')
  }

  const handleAfterCodeChange = (newCode: string) => {
    setAfterContent(newCode)
  }

  const rejectSuggestion = () => {
    setSuggestion(null)
    setShowComparison(false)
    setBeforeContent('')
    setAfterContent('')
    setIsProcessing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Knowledge Base 2</h1>
                  <p className="text-gray-600">Clean interface for knowledge management</p>
                </div>
              </div>
            </div>

            {/* AI Input Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Smart Knowledge Categorization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your knowledge base update here...

Examples:
• Our main competitor launched a new pricing model that undercuts us by 20%
• Customer feedback shows they love the new dashboard but find onboarding confusing
• Industry trend: 80% of companies are moving to AI-powered automation by 2025
• Users are requesting dark mode and better mobile responsiveness"
                      className="min-h-[120px] resize-none pr-12"
                    />
                    
                    {/* Send Button */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isProcessing}
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        type="button"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing content and suggesting category...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suggestion Card */}
            {suggestion && !showComparison && (
              <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                    Suggested Category: {suggestion.title}
                    <Badge variant="secondary" className="ml-2">
                      {suggestion.confidence}% confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{suggestion.reason}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowComparison(true)} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Preview Changes
                    </Button>
                    <Button onClick={rejectSuggestion} variant="outline" className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Code Comparison */}
            {showComparison && suggestion && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                    Preview: Adding to {suggestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <CodeComparison
                      beforeCode={beforeContent || '# No existing content'}
                      afterCode={afterContent}
                      language="markdown"
                      filename={`${suggestion.category}.md`}
                      lightTheme="github-light"
                      darkTheme="github-dark"
                      editable={true}
                      onAfterCodeChange={handleAfterCodeChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={acceptSuggestion} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Accept & Add to {suggestion.title}
                    </Button>
                    <Button onClick={rejectSuggestion} variant="outline" className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}