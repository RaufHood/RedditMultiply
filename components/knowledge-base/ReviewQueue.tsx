'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PendingInsight, KnowledgeBase } from "@/lib/api"
import { usePendingInsights, useKnowledgeStore } from "@/lib/stores/knowledgeStore"
import { useState } from "react"
import { 
  Check, 
  X, 
  Edit, 
  Sparkles, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Minus,
  ExternalLink
} from "lucide-react"

const priorityConfig = {
  high: { icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' },
  medium: { icon: TrendingUp, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { icon: Minus, color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

const categoryLabels = {
  'competitor-analysis': 'Competitor Analysis',
  'customer-sentiment': 'Customer Sentiment',
  'market-trends': 'Market Trends',
  'product-intelligence': 'Product Intelligence'
}

interface EditingState {
  insight: PendingInsight
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  suggestedCategory: keyof KnowledgeBase
  action_items: string
  tags: string
}

export function ReviewQueue() {
  const pendingInsights = usePendingInsights()
  const { approvePending, rejectPending, updatePending, loadPendingInsights } = useKnowledgeStore()
  const [editingInsight, setEditingInsight] = useState<EditingState | null>(null)
  
  useState(() => {
    loadPendingInsights()
  })

  const handleApprove = (id: string, category: keyof KnowledgeBase) => {
    approvePending(id, category)
  }

  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this insight?')) {
      rejectPending(id)
    }
  }

  const handleEdit = (insight: PendingInsight) => {
    setEditingInsight({
      insight,
      title: insight.title,
      content: insight.content,
      priority: insight.priority,
      suggestedCategory: insight.suggestedCategory as keyof KnowledgeBase,
      action_items: insight.action_items || '',
      tags: insight.tags?.join(', ') || ''
    })
  }

  const handleSaveEdit = () => {
    if (!editingInsight) return
    
    const updates: Partial<PendingInsight> = {
      title: editingInsight.title,
      content: editingInsight.content,
      priority: editingInsight.priority,
      suggestedCategory: editingInsight.suggestedCategory,
      action_items: editingInsight.action_items || undefined,
      tags: editingInsight.tags ? editingInsight.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
    }
    
    updatePending(editingInsight.insight.id, updates)
    setEditingInsight(null)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffMinutes < 60) return `${diffMinutes}m ago`
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
      return `${Math.floor(diffMinutes / 1440)}d ago`
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pending Review Queue</span>
            <Badge variant="secondary" className="ml-2">
              {pendingInsights.length} pending
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review AI-generated insights before adding them to your knowledge base
          </p>
        </CardHeader>
      </Card>

      {pendingInsights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No pending insights</p>
              <p className="text-sm">
                AI-generated insights from Reddit monitoring will appear here for review
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingInsights.map((insight) => {
            const PriorityIcon = priorityConfig[insight.priority].icon
            
            return (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight mb-2">
                        {insight.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${priorityConfig[insight.priority].color}`}
                        >
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Suggested: {categoryLabels[insight.suggestedCategory as keyof KnowledgeBase]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(insight.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(insight)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Pending Insight</DialogTitle>
                          </DialogHeader>
                          {editingInsight && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={editingInsight.title}
                                  onChange={(e) => setEditingInsight({
                                    ...editingInsight,
                                    title: e.target.value
                                  })}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Priority</Label>
                                  <Select 
                                    value={editingInsight.priority}
                                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                                      setEditingInsight({ ...editingInsight, priority: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="high">🔴 High</SelectItem>
                                      <SelectItem value="medium">🟡 Medium</SelectItem>
                                      <SelectItem value="low">⚪ Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Category</Label>
                                  <Select 
                                    value={editingInsight.suggestedCategory}
                                    onValueChange={(value: keyof KnowledgeBase) => 
                                      setEditingInsight({ ...editingInsight, suggestedCategory: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(categoryLabels).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                  value={editingInsight.content}
                                  onChange={(e) => setEditingInsight({
                                    ...editingInsight,
                                    content: e.target.value
                                  })}
                                  rows={6}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Action Items</Label>
                                <Textarea
                                  value={editingInsight.action_items}
                                  onChange={(e) => setEditingInsight({
                                    ...editingInsight,
                                    action_items: e.target.value
                                  })}
                                  rows={3}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input
                                  value={editingInsight.tags}
                                  onChange={(e) => setEditingInsight({
                                    ...editingInsight,
                                    tags: e.target.value
                                  })}
                                  placeholder="Comma-separated tags"
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingInsight(null)}
                                >
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {insight.content}
                  </p>
                  
                  {insight.originalText && (
                    <details className="mb-4">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                        View original Reddit post
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">
                        <p className="whitespace-pre-wrap">{insight.originalText}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Source: {insight.source}
                        </div>
                      </div>
                    </details>
                  )}
                  
                  {insight.action_items && (
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <h4 className="font-medium text-sm text-blue-900 mb-1">Action Items:</h4>
                      <p className="text-sm text-blue-800">{insight.action_items}</p>
                    </div>
                  )}
                  
                  {insight.tags && insight.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {insight.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Review this insight and choose an action
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(insight.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(insight.id, insight.suggestedCategory as keyof KnowledgeBase)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve & Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}