'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useKnowledgeStore } from "@/lib/stores/knowledgeStore"
import { KnowledgeBase } from "@/lib/api"

const categoryConfig: Record<keyof KnowledgeBase, { label: string; icon: string; color: string }> = {
  'competitor-analysis': {
    label: 'Competitor Analysis',
    icon: '🎯',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  'customer-sentiment': {
    label: 'Customer Sentiment',
    icon: '💭',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'market-trends': {
    label: 'Market Trends',
    icon: '📈',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  'product-intelligence': {
    label: 'Product Intelligence',
    icon: '🔍',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
}

export function CategoryNav() {
  const { currentCategory, setCategory, storage } = useKnowledgeStore()
  
  return (
    <Card className="p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Knowledge Base Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const category = key as keyof KnowledgeBase
          const insights = storage.getCategory(category)
          const isActive = currentCategory === category
          
          return (
            <Button
              key={category}
              variant={isActive ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                isActive ? '' : 'hover:bg-gray-50'
              }`}
              onClick={() => setCategory(category)}
            >
              <div className="flex items-center space-x-2 w-full">
                <span className="text-lg">{config.icon}</span>
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${config.color}`}
              >
                {insights.length} insights
              </Badge>
            </Button>
          )
        })}
      </div>
    </Card>
  )
}