'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Brain, Sparkles, ArrowUp, Loader2, Target, Heart, TrendingUp, Search, CheckCircle, X } from "lucide-react"
import { CodeComparison } from "@/components/magicui/code-comparison"
import { DocBrowser } from "@/components/doc-browser"
import { api } from "@/lib/api"

interface Suggestion {
  document: string  // Now accepts any document path
  section: string
  action: 'add_after' | 'replace'
  content: string
  confidence: number
  reason: string
  icon: string
  color: string
  title: string
  before_content: string
  after_content: string
  file_path?: string  // Full path to the file
}

export default function KnowledgeBase2Page() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Target': return Target
      case 'Heart': return Heart
      case 'TrendingUp': return TrendingUp
      case 'Search': return Search
      default: return Brain
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return
    
    setIsProcessing(true)
    
    try {
      // Get current document state from localStorage (for any edited documents)
      const storage: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('kb2-doc-')) {
          storage[key] = localStorage.getItem(key) || ''
        }
      }
      
      // Call the smart LLM-powered document suggestion API
      const response = await fetch('/api/docs/suggest-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim(), storage })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions')
      }
      
      const data = await response.json()
      
      if (data.error) {
        console.error('API Error:', data.error)
        // Fallback to a simple suggestion
        setSuggestions([{
          document: 'index',
          section: '## Updates',
          action: 'add_after',
          content: `\n\n## Update: ${new Date().toLocaleDateString()}\n\n${input.trim()}`,
          confidence: 30,
          reason: 'API unavailable - using fallback',
          icon: 'FileText',
          color: 'text-blue-600',
          title: 'Documentation',
          before_content: '# Documentation\n\nMain documentation page.',
          after_content: `# Documentation\n\nMain documentation page.\n\n## Update: ${new Date().toLocaleDateString()}\n\n${input.trim()}`,
          file_path: 'index'
        }])
      } else {
        setSuggestions(data.suggestions || [])
      }
      
      setIsProcessing(false)
      
    } catch (error) {
      console.error('Network error:', error)
      // Fallback to simple suggestion
      setSuggestions([{
        document: 'index',
        section: '## Updates',
        action: 'add_after',
        content: `\n\n## Update: ${new Date().toLocaleDateString()}\n\n${input.trim()}`,
        confidence: 30,
        reason: 'Network error - using fallback',
        icon: 'FileText',
        color: 'text-blue-600',
        title: 'Documentation',
        before_content: '# Documentation\n\nMain documentation page.',
        after_content: `# Documentation\n\nMain documentation page.\n\n## Update: ${new Date().toLocaleDateString()}\n\n${input.trim()}`,
        file_path: 'index'
      }])
      setIsProcessing(false)
    }
  }

  const selectSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion)
    setShowComparison(true)
  }

  const acceptSuggestion = () => {
    if (!selectedSuggestion) return
    
    // FIXED: Use consistent storage key format with .md extension
    const filePath = (selectedSuggestion.file_path || selectedSuggestion.document) + '.md'
    const storageKey = `kb2-doc-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
    const documentData = {
      title: selectedSuggestion.title,
      content: selectedSuggestion.after_content,
      filePath: filePath
    }
    localStorage.setItem(storageKey, JSON.stringify(documentData))
    console.log('✅ Suggestion accepted and saved to:', storageKey)
    
    // Reset form
    setInput('')
    setSuggestions([])
    setSelectedSuggestion(null)
    setShowComparison(false)
  }

  const handleAfterCodeChange = (newCode: string) => {
    if (selectedSuggestion) {
      setSelectedSuggestion({
        ...selectedSuggestion,
        after_content: newCode
      })
    }
  }

  const rejectSuggestion = () => {
    setSelectedSuggestion(null)
    setShowComparison(false)
  }

  const rejectAllSuggestions = () => {
    setSuggestions([])
    setSelectedSuggestion(null)
    setShowComparison(false)
    setIsProcessing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
                      onKeyDown={handleKeyDown}
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

            {/* Multiple Suggestions */}
            {suggestions.length > 0 && !showComparison && (
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Found {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
                  </h3>
                  <Button onClick={rejectAllSuggestions} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Dismiss All
                  </Button>
                </div>
                
                {suggestions.map((suggestion, index) => {
                  const IconComponent = getIconComponent(suggestion.icon)
                  return (
                    <Card key={index} className="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${suggestion.color}`} />
                          Update {suggestion.title}
                          <Badge variant="secondary" className="ml-2">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-2">{suggestion.reason}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Will add to: <span className="font-mono text-blue-700">{suggestion.section}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Document: <a 
                            href={`/knowledge-base-2/docs/${suggestion.file_path || suggestion.document}`} 
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {suggestion.file_path || suggestion.document}
                          </a>
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={() => selectSuggestion(suggestion)} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Preview Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Code Comparison */}
            {showComparison && selectedSuggestion && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = getIconComponent(selectedSuggestion.icon)
                      return <IconComponent className={`h-5 w-5 ${selectedSuggestion.color}`} />
                    })()}
                    Preview: Adding to {selectedSuggestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <CodeComparison
                      beforeCode={selectedSuggestion.before_content || '# No existing content'}
                      afterCode={selectedSuggestion.after_content}
                      language="markdown"
                      filename={`${selectedSuggestion.document}.md`}
                      lightTheme="github-light"
                      darkTheme="github-dark"
                      editable={true}
                      onAfterCodeChange={handleAfterCodeChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={acceptSuggestion} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Accept & Add to {selectedSuggestion.title}
                    </Button>
                    <Button onClick={rejectSuggestion} variant="outline" className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documentation Browser */}
            {!showComparison && suggestions.length === 0 && (
              <div className="mb-8">
                <DocBrowser />
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}