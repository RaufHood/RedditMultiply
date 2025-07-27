'use client'

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Save, Edit3 } from "lucide-react"

export default function MarketTrendsPage() {
  const [title, setTitle] = useState('📈 Market Trends')
  const [content, setContent] = useState(`# Market Trends Analysis

## Industry Overview
- Current market size and growth projections
- Key market drivers and challenges
- Regulatory changes and impacts
- Economic factors affecting the market

## Emerging Trends

### Technology Trends
- New technologies disrupting the industry
- Innovation patterns and adoption rates
- Platform and tool evolution
- Integration and automation trends

### Consumer Behavior
- Changing customer preferences
- Adoption patterns for new solutions
- Buying behavior shifts
- Channel preference changes

### Business Model Evolution
- New revenue models emerging
- Service delivery innovations
- Partnership and collaboration trends
- Market consolidation patterns

## Competitive Landscape
- Market share dynamics
- New entrants and disruptors
- Strategic moves and acquisitions
- Partnership formations

## Future Outlook
- Predicted market developments
- Opportunities and threats ahead
- Strategic recommendations
- Investment priorities

## Action Items
- [ ] Monitor emerging technology adoption
- [ ] Track customer behavior changes
- [ ] Analyze competitive positioning shifts
- [ ] Evaluate new market opportunities`)

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved content from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem('kb2-market-trends-title')
    const savedContent = localStorage.getItem('kb2-market-trends-content')
    
    if (savedTitle) setTitle(savedTitle)
    if (savedContent) setContent(savedContent)
  }, [])

  const saveToLocalStorage = async () => {
    setIsSaving(true)
    localStorage.setItem('kb2-market-trends-title', title)
    localStorage.setItem('kb2-market-trends-content', content)
    
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false)
    }, 500)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    saveToLocalStorage()
  }

  const handleContentSave = () => {
    setIsEditingContent(false)
    saveToLocalStorage()
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div className="text-sm text-gray-600">Knowledge Base 2</div>
              </div>
              <Button 
                onClick={saveToLocalStorage}
                disabled={isSaving}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {/* Document Content */}
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                {/* Editable Title */}
                <div className="mb-8">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                      className="text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-full resize-none"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className="text-4xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 group flex items-center gap-2"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {title}
                      <Edit3 className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h1>
                  )}
                </div>

                {/* Editable Content */}
                <div className="prose prose-lg max-w-none">
                  {isEditingContent ? (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onBlur={handleContentSave}
                      className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none text-gray-700 leading-relaxed"
                      style={{ fontFamily: 'inherit', fontSize: '16px', lineHeight: '1.7' }}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-gray-50 rounded p-3 -m-3 min-h-[500px] whitespace-pre-wrap text-gray-700 leading-relaxed group"
                      onClick={() => setIsEditingContent(true)}
                      style={{ fontSize: '16px', lineHeight: '1.7' }}
                    >
                      {content}
                      <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Click to edit</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Last updated indicator */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}