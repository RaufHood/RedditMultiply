'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Insight, KnowledgeBase } from "@/lib/api"
import { useKnowledgeStore } from "@/lib/stores/knowledgeStore"
import { useState, useEffect } from "react"
import { Loader2, Sparkles } from "lucide-react"

interface InsightInputFormProps {
  isOpen: boolean
  onClose: () => void
  editingInsight?: Insight | null
}

interface InsightForm {
  category: keyof KnowledgeBase
  priority: 'high' | 'medium' | 'low'
  source: string
  title: string
  content: string
  action_items: string
  tags: string
}

export function InsightInputForm({ isOpen, onClose, editingInsight }: InsightInputFormProps) {
  const { addInsight, updateInsight, currentCategory } = useKnowledgeStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false)
  
  const [form, setForm] = useState<InsightForm>({
    category: currentCategory,
    priority: 'medium',
    source: '',
    title: '',
    content: '',
    action_items: '',
    tags: ''
  })

  // Reset form when dialog opens/closes or when editing insight changes
  useEffect(() => {
    if (isOpen) {
      if (editingInsight) {
        // Populate form with existing insight data
        setForm({
          category: currentCategory, // Keep current category for editing
          priority: editingInsight.priority,
          source: editingInsight.source,
          title: editingInsight.title,
          content: editingInsight.content,
          action_items: editingInsight.action_items || '',
          tags: editingInsight.tags?.join(', ') || ''
        })
      } else {
        // Reset form for new insight
        setForm({
          category: currentCategory,
          priority: 'medium',
          source: '',
          title: '',
          content: '',
          action_items: '',
          tags: ''
        })
      }
      setSuggestedCategory(null)
    }
  }, [isOpen, editingInsight, currentCategory])

  const updateForm = (field: keyof InsightForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const suggestCategory = async () => {
    if (!form.content.trim()) return
    
    setIsGettingSuggestion(true)
    
    try {
      // Simple rule-based categorization for demo
      // In production, this would call OpenAI API
      const content = form.content.toLowerCase()
      
      let suggestion = 'competitor-analysis' // default
      
      if (content.includes('customer') || content.includes('user') || content.includes('feedback') || 
          content.includes('review') || content.includes('sentiment') || content.includes('experience')) {
        suggestion = 'customer-sentiment'
      } else if (content.includes('trend') || content.includes('market') || content.includes('industry') ||
                 content.includes('adoption') || content.includes('growth')) {
        suggestion = 'market-trends'
      } else if (content.includes('feature') || content.includes('product') || content.includes('api') ||
                 content.includes('functionality') || content.includes('development')) {
        suggestion = 'product-intelligence'
      } else if (content.includes('competitor') || content.includes('rival') || content.includes('competition') ||
                 content.includes('pricing') || content.includes('alternative')) {
        suggestion = 'competitor-analysis'
      }
      
      setSuggestedCategory(suggestion)
    } catch (error) {
      console.error('Failed to get category suggestion:', error)
    } finally {
      setIsGettingSuggestion(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const insight: Insight = {
        id: editingInsight?.id || `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        source: form.source.trim() || 'Manual Entry',
        created_at: editingInsight?.created_at || new Date().toISOString(),
        action_items: form.action_items.trim() || undefined,
        tags: form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
      }
      
      // Use suggested category if available, otherwise use selected category
      const finalCategory = (suggestedCategory as keyof KnowledgeBase) || form.category
      
      if (editingInsight) {
        updateInsight(currentCategory, editingInsight.id, insight)
      } else {
        addInsight(finalCategory, insight)
      }
      
      onClose()
    } catch (error) {
      console.error('Failed to save insight:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryLabels = {
    'competitor-analysis': 'Competitor Analysis',
    'customer-sentiment': 'Customer Sentiment',
    'market-trends': 'Market Trends',
    'product-intelligence': 'Product Intelligence'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInsight ? 'Edit Insight' : 'Add New Insight'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={form.category} 
                onValueChange={(value: keyof KnowledgeBase) => updateForm('category', value)}
                disabled={!!editingInsight} // Don't allow category changes when editing
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
              {suggestedCategory && suggestedCategory !== form.category && !editingInsight && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI suggests: {categoryLabels[suggestedCategory as keyof KnowledgeBase]}
                  </Badge>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => updateForm('category', suggestedCategory)}
                  >
                    Use suggestion
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={form.priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => updateForm('priority', value)}
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g., r/startups, r/SaaS, Manual Entry"
              value={form.source}
              onChange={(e) => updateForm('source', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief, descriptive title for this insight"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content *</Label>
              {!editingInsight && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={suggestCategory}
                  disabled={!form.content.trim() || isGettingSuggestion}
                  className="text-xs"
                >
                  {isGettingSuggestion ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Suggest Category
                </Button>
              )}
            </div>
            <Textarea
              id="content"
              placeholder="Detailed description of the insight, what you observed, and why it's important..."
              value={form.content}
              onChange={(e) => updateForm('content', e.target.value)}
              rows={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="action_items">Action Items (Optional)</Label>
            <Textarea
              id="action_items"
              placeholder="What actions should be taken based on this insight?"
              value={form.action_items}
              onChange={(e) => updateForm('action_items', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags: pricing, mobile, api, competition"
              value={form.tags}
              onChange={(e) => updateForm('tags', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.title.trim() || !form.content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingInsight ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingInsight ? 'Update Insight' : 'Add Insight'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}