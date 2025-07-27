'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useKnowledgeStore } from "@/lib/stores/knowledgeStore"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Users, 
  Target,
  BarChart3,
  Download,
  Calendar,
  ArrowRight,
  Zap,
  Eye,
  Clock
} from "lucide-react"
// Removed framer-motion to avoid dependency issues

interface TrendData {
  category: string
  current: number
  previous: number
  change: number
  trend: 'up' | 'down' | 'stable'
  insights: Array<{
    title: string
    impact: number
    urgency: 'immediate' | 'this-week' | 'monitor'
  }>
}

interface ExecutiveDashboardProps {
  timeframe?: 'week' | 'month' | 'quarter'
  onExport?: () => void
}

export function ExecutiveDashboard({ timeframe = 'week', onExport }: ExecutiveDashboardProps) {
  const { getRecentInsights, getInsightsByPriority } = useKnowledgeStore()
  
  // Mock data - in production this would come from analytics
  const mockTrends: TrendData[] = [
    {
      category: 'Competitive Threats',
      current: 8,
      previous: 5,
      change: 60,
      trend: 'up',
      insights: [
        { title: 'Stripe pricing changes', impact: 9, urgency: 'immediate' },
        { title: 'New payment processor launch', impact: 7, urgency: 'this-week' }
      ]
    },
    {
      category: 'Customer Sentiment',
      current: 12,
      previous: 18,
      change: -33,
      trend: 'down',
      insights: [
        { title: 'Mobile app performance complaints', impact: 6, urgency: 'this-week' },
        { title: 'Positive dashboard feedback', impact: 4, urgency: 'monitor' }
      ]
    },
    {
      category: 'Market Trends',
      current: 15,
      previous: 12,
      change: 25,
      trend: 'up',
      insights: [
        { title: 'AI integration expectations rising', impact: 8, urgency: 'this-week' }
      ]
    },
    {
      category: 'Product Intelligence',
      current: 6,
      previous: 8,
      change: -25,
      trend: 'down',
      insights: [
        { title: 'API rate limit feedback', impact: 5, urgency: 'monitor' }
      ]
    }
  ]

  const highPriorityInsights = getInsightsByPriority('high')
  const totalInsights = getRecentInsights(50).length

  const urgentInsights = mockTrends
    .flatMap(trend => trend.insights)
    .filter(insight => insight.urgency === 'immediate')
    .length

  const timeframeLabels = {
    week: 'This Week',
    month: 'This Month', 
    quarter: 'This Quarter'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <BarChart3 className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable', category: string) => {
    // For competitive threats and negative sentiment, "up" is bad
    const isNegativeCategory = category.includes('Threats') || category.includes('Sentiment')
    
    if (trend === 'up') {
      return isNegativeCategory ? 'text-red-600' : 'text-green-600'
    } else if (trend === 'down') {
      return isNegativeCategory ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-600'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800'
      case 'this-week': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Executive Intelligence Brief</span>
          </h1>
          <p className="text-gray-600 mt-1">{timeframeLabels[timeframe]} • Market Intelligence Summary</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Urgent Alerts</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{urgentInsights}</span>
                <span className="text-sm text-gray-500 ml-2">need immediate attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">High Priority</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{highPriorityInsights.length}</span>
                <span className="text-sm text-gray-500 ml-2">insights this {timeframe}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Total Insights</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">{totalInsights}</span>
                <span className="text-sm text-gray-500 ml-2">processed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">AI Confidence</span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">85%</span>
                <span className="text-sm text-gray-500 ml-2">average score</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Intelligence Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTrends.map((trend, index) => (
              <div 
                key={trend.category}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{trend.category}</h3>
                  <div className={`flex items-center space-x-1 ${getTrendColor(trend.trend, trend.category)}`}>
                    {getTrendIcon(trend.trend, trend.change)}
                    <span className="text-sm font-medium">{Math.abs(trend.change)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Current: <strong>{trend.current}</strong></span>
                  <span>Previous: {trend.previous}</span>
                </div>
                
                <div className="space-y-2">
                  {trend.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-${insight.impact >= 8 ? 'red' : insight.impact >= 6 ? 'yellow' : 'gray'}-500`} />
                        <span className="text-sm text-gray-700">{insight.title}</span>
                      </div>
                      <Badge className={`text-xs ${getUrgencyColor(insight.urgency)}`}>
                        {insight.urgency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recommended Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Review competitive pricing strategy</p>
                  <p className="text-sm text-red-700">Stripe's new pricing model requires immediate assessment</p>
                </div>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <ArrowRight className="h-4 w-4 mr-1" />
                Act Now
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Accelerate AI feature development</p>
                  <p className="text-sm text-yellow-700">Market expectations are rising rapidly</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <ArrowRight className="h-4 w-4 mr-1" />
                Plan
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Address mobile app performance</p>
                  <p className="text-sm text-blue-700">Customer sentiment trending negative</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <ArrowRight className="h-4 w-4 mr-1" />
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>Generated automatically from {totalInsights} market intelligence insights • Last updated {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}