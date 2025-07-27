'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Insight } from "@/lib/api"
import { formatTimeAgo } from "@/lib/api"
import { 
  AlertTriangle, 
  TrendingUp, 
  Minus, 
  ArrowRight,
  Target,
  Clock,
  ExternalLink,
  MessageSquare,
  Slack,
  FileText,
  GitPullRequest,
  Eye,
  CheckCircle,
  Calendar
} from "lucide-react"
import { useState } from "react"
// Removed framer-motion to avoid dependency issues

interface IntelligenceInsightCardProps {
  insight: Insight & {
    businessImpact?: {
      score: number // 1-10
      reasoning: string
      urgency: 'immediate' | 'this-week' | 'monitor'
      confidence: number // 0-1
    }
    aiSummary?: string
    suggestedActions?: Array<{
      type: 'roadmap' | 'competitive' | 'marketing' | 'urgent'
      action: string
      priority: 'high' | 'medium' | 'low'
    }>
    status?: 'new' | 'reviewing' | 'acted' | 'monitoring'
  }
  onAction?: (action: string, data?: any) => void
  showCategory?: boolean
}

const priorityConfig = {
  high: { icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-200', textColor: 'text-red-700' },
  medium: { icon: TrendingUp, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', textColor: 'text-yellow-700' },
  low: { icon: Minus, color: 'bg-gray-100 text-gray-800 border-gray-200', textColor: 'text-gray-600' }
}

const impactColors = {
  9: 'bg-red-600',
  8: 'bg-red-500', 
  7: 'bg-orange-500',
  6: 'bg-yellow-500',
  5: 'bg-blue-500',
  4: 'bg-blue-400',
  3: 'bg-gray-400',
  2: 'bg-gray-300',
  1: 'bg-gray-200'
}

const statusConfig = {
  new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
  reviewing: { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewing' },
  acted: { color: 'bg-green-100 text-green-800', label: 'Acted' },
  monitoring: { color: 'bg-purple-100 text-purple-800', label: 'Monitoring' }
}

const actionIcons = {
  roadmap: GitPullRequest,
  competitive: Target,
  marketing: MessageSquare,
  urgent: AlertTriangle
}

export function IntelligenceInsightCard({ insight, onAction, showCategory = false }: IntelligenceInsightCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(insight.status || 'new')
  
  const PriorityIcon = priorityConfig[insight.priority].icon
  const businessImpact = insight.businessImpact || {
    score: 5,
    reasoning: "Standard market intelligence with moderate business relevance",
    urgency: 'monitor' as const,
    confidence: 0.7
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatTimeAgo(Math.floor(date.getTime() / 1000))
    } catch {
      return 'Unknown'
    }
  }

  const getImpactColor = (score: number) => {
    const roundedScore = Math.min(9, Math.max(1, Math.round(score)))
    return impactColors[roundedScore as keyof typeof impactColors]
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as any)
    onAction?.('status-change', { id: insight.id, status: newStatus })
  }

  const handleQuickAction = (actionType: string, data?: any) => {
    onAction?.(actionType, { id: insight.id, ...data })
  }

  return (
    <div className="mb-4">
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {/* Business Impact Score */}
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full ${getImpactColor(businessImpact.score)} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{Math.round(businessImpact.score)}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-600">Business Impact</span>
                </div>
                
                {/* Urgency Badge */}
                {businessImpact.urgency === 'immediate' && (
                  <Badge className="bg-red-100 text-red-800 text-xs animate-pulse">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    URGENT
                  </Badge>
                )}
                
                {/* Status Badge */}
                <Badge className={`text-xs ${statusConfig[currentStatus].color}`}>
                  {statusConfig[currentStatus].label}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg leading-tight mb-2 text-gray-900">
                {insight.title}
              </h3>
              
              {/* AI Summary */}
              {insight.aiSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Business Intelligence</p>
                      <p className="text-sm text-blue-800">{insight.aiSummary}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
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
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(insight.created_at)} ago</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">Confidence: {Math.round(businessImpact.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Impact Reasoning */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Why this matters:</p>
            <p className="text-sm text-gray-600">{businessImpact.reasoning}</p>
          </div>
          
          {/* Original Content (Collapsed by default) */}
          <details className="mb-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 flex items-center space-x-1">
              <ExternalLink className="h-3 w-3" />
              <span>View source content</span>
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">
              <p className="text-gray-700 whitespace-pre-wrap">{insight.content}</p>
            </div>
          </details>
          
          {/* Suggested Actions */}
          {insight.suggestedActions && insight.suggestedActions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
              <div className="space-y-2">
                {insight.suggestedActions.map((action, index) => {
                  const ActionIcon = actionIcons[action.type]
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ActionIcon className={`h-4 w-4 ${priorityConfig[action.priority].textColor}`} />
                        <span className="text-sm text-gray-700">{action.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {action.type}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuickAction(`execute-${action.type}`, action)}
                        className="text-xs h-7"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Act
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Action Items */}
          {insight.action_items && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium text-sm text-blue-900 mb-1 flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Action Items:</span>
              </h4>
              <p className="text-sm text-blue-800">{insight.action_items}</p>
            </div>
          )}
          
          {/* Tags */}
          {insight.tags && insight.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {insight.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <Separator className="my-4" />
          
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Status Changer */}
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="acted">Acted Upon</option>
                <option value="monitoring">Monitoring</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction('view-detail')}
                className="text-xs h-7 px-2"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Quick Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('share-slack')}
                className="text-xs h-7 px-2"
              >
                <Slack className="h-3 w-3 mr-1" />
                Slack
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('export-notion')}
                className="text-xs h-7 px-2"
              >
                <FileText className="h-3 w-3 mr-1" />
                Notion
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('add-backlog')}
                className="text-xs h-7 px-2"
              >
                <GitPullRequest className="h-3 w-3 mr-1" />
                Backlog
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}