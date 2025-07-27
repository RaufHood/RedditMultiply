'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKnowledgeStore, useCurrentInsights, useCurrentCategory, useSearchQuery } from "@/lib/stores/knowledgeStore"
import { InsightCard } from "./InsightCard"
import { Plus, Filter, SortAsc, SortDesc } from "lucide-react"
import { useState } from "react"
import { Insight } from "@/lib/api"

interface CategoryViewProps {
  onAddInsight?: () => void
  onEditInsight?: (insight: Insight) => void
}

export function CategoryView({ onAddInsight, onEditInsight }: CategoryViewProps) {
  const insights = useCurrentInsights()
  const currentCategory = useCurrentCategory()
  const searchQuery = useSearchQuery()
  const { deleteInsight } = useKnowledgeStore()
  
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const categoryLabels = {
    'competitor-analysis': 'Competitor Analysis',
    'customer-sentiment': 'Customer Sentiment',
    'market-trends': 'Market Trends',
    'product-intelligence': 'Product Intelligence'
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 }

  const filteredAndSortedInsights = insights
    .filter(insight => {
      if (filterPriority === 'all') return true
      return insight.priority === filterPriority
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleDeleteInsight = (insightId: string) => {
    if (window.confirm('Are you sure you want to delete this insight?')) {
      deleteInsight(currentCategory, insightId)
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {searchQuery ? `Search Results` : categoryLabels[currentCategory]}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {searchQuery 
                  ? `${filteredAndSortedInsights.length} insights found for "${searchQuery}"`
                  : `${filteredAndSortedInsights.length} insights in this category`
                }
              </p>
            </div>
            {onAddInsight && (
              <Button onClick={onAddInsight} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Insight</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="px-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedInsights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              {searchQuery ? (
                <>
                  <p className="text-lg mb-2">No insights found</p>
                  <p className="text-sm">Try adjusting your search terms or filters</p>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">No insights in this category yet</p>
                  <p className="text-sm mb-4">Start building your knowledge base by adding the first insight</p>
                  {onAddInsight && (
                    <Button onClick={onAddInsight} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Insight
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onEdit={onEditInsight}
              onDelete={handleDeleteInsight}
              showCategory={!!searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}