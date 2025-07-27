'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Insight } from "@/lib/api"
import { formatTimeAgo } from "@/lib/api"
import { AlertTriangle, TrendingUp, Minus, Edit, Trash2, ExternalLink } from "lucide-react"
import { useState } from "react"

interface InsightCardProps {
  insight: Insight
  onEdit?: (insight: Insight) => void
  onDelete?: (insightId: string) => void
  showCategory?: boolean
}

const priorityConfig = {
  high: { icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200' },
  medium: { icon: TrendingUp, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { icon: Minus, color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

export function InsightCard({ insight, onEdit, onDelete, showCategory = false }: InsightCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const PriorityIcon = priorityConfig[insight.priority].icon
  
  const truncatedContent = insight.content.length > 200 
    ? insight.content.substring(0, 200) + '...'
    : insight.content

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatTimeAgo(Math.floor(date.getTime() / 1000))
    } catch {
      return 'Unknown'
    }
  }

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2">{insight.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${priorityConfig[insight.priority].color}`}
              >
                <PriorityIcon className="h-3 w-3 mr-1" />
                {insight.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {insight.source}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatTimestamp(insight.created_at)} ago
              </span>
            </div>
          </div>
          <div className="flex space-x-1 ml-4">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(insight)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(insight.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-700 mb-3">
          {showFullContent ? insight.content : truncatedContent}
        </p>
        
        {insight.content.length > 200 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-sm">
                Read more <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{insight.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${priorityConfig[insight.priority].color}`}
                  >
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {insight.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.source}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(insight.created_at)} ago
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{insight.content}</p>
                {insight.action_items && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Action Items:</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border">
                      {insight.action_items}
                    </p>
                  </div>
                )}
                {insight.tags && insight.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-1">
                      {insight.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {insight.action_items && (
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-medium text-sm text-blue-900 mb-1">Action Items:</h4>
            <p className="text-sm text-blue-800">{insight.action_items}</p>
          </div>
        )}
        
        {insight.tags && insight.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {insight.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}