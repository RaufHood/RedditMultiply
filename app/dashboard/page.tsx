"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, X, MessageSquare, ThumbsUp, AlertCircle, CheckCircle, Eye, BarChart3, RefreshCw, Users, Search, Settings } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { api, Mention as ApiMention, BrandContext, AnalyticsSnapshot } from "@/lib/api"
import { useAppStore } from "@/lib/store"

interface Mention {
  id: string
  subreddit: string
  title: string
  snippet: string
  author: string
  age: string
  matchedKeywords: string[]
  priority: "high" | "normal" | "low"
  sentiment: "positive" | "negative" | "neutral"
  status: "new" | "responded" | "ignored"
  upvotes: number
  comments: number
  fullPost: string
  topComments: Array<{
    author: string
    content: string
    upvotes: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { 
    mentions: storeMentions, 
    setMentions, 
    addMentions,
    monitoringConfig,
    addKeyword: storeAddKeyword,
    removeKeyword: storeRemoveKeyword,
    analytics: storeAnalytics,
    setAnalytics,
    updateAnalytics,
    setLoading,
    setError,
    error,
    isLoading
  } = useAppStore()
  
  const [localMentions, setLocalMentions] = useState<Mention[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")

  const [activeTab, setActiveTab] = useState("mentions")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)


  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load keywords from store or monitoring status
        if (monitoringConfig?.keywords) {
          setKeywords(monitoringConfig.keywords)
        } else {
          try {
            const monitoringStatus = await api.getMonitoringStatus()
            setKeywords(monitoringStatus.config?.keywords || [])
          } catch (apiError) {
            console.warn('Backend not available for monitoring status:', apiError)
            setKeywords([])
          }
        }
        
        // Load mentions from store or API
        if (storeMentions.length > 0) {
          // Convert store mentions to local format
          const convertedMentions: Mention[] = storeMentions.map(mention => ({
            id: mention.id,
            subreddit: mention.subreddit,
            title: mention.title || "",
            snippet: mention.snippet,
            author: mention.author,
            age: formatTimeAgo(mention.created_utc),
            matchedKeywords: mention.matched_keywords,
            priority: mention.priority,
            sentiment: mention.sentiment || "neutral",
            status: mention.status.toLowerCase() as "new" | "responded" | "ignored",
            upvotes: mention.score ?? 0,
            comments: mention.num_comments ?? 0,
            fullPost: mention.snippet,
            topComments: [],
          }))
          setLocalMentions(convertedMentions)
        } else {
          try {
            const apiMentions = await api.getMentions()
            addMentions(apiMentions)
            
            const convertedMentions: Mention[] = apiMentions.map(mention => ({
              id: mention.id,
              subreddit: mention.subreddit,
              title: mention.title || "",
              snippet: mention.snippet,
              author: mention.author,
              age: formatTimeAgo(mention.created_utc),
              matchedKeywords: mention.matched_keywords,
              priority: mention.priority,
              sentiment: mention.sentiment || "neutral",
              status: mention.status.toLowerCase() as "new" | "responded" | "ignored",
              upvotes: mention.score ?? 0,
              comments: mention.num_comments ?? 0,
              fullPost: mention.snippet,
              topComments: [],
            }))
            setLocalMentions(convertedMentions)
          } catch (apiError) {
            console.warn('Backend not available for mentions:', apiError)
            setLocalMentions([])
          }
        }
              } catch (err) {
          console.error('Failed to load dashboard data:', err)
          setError("Failed to load dashboard data. Please try again.")
        } finally {
          setLoading(false)
        }
      }

      const loadAnalytics = async () => {
        try {
          // Try to load analytics from backend
          try {
            const analyticsData = await api.getAnalytics()
            setAnalytics(analyticsData)
          } catch (apiError) {
            console.warn('Backend not available for analytics, calculating from local data:', apiError)
            updateAnalytics()
          }
        } catch (error) {
          console.error('Failed to load analytics:', error)
        }
      }

      loadData()
      loadAnalytics()
    }, [storeMentions, monitoringConfig, setLoading, setError, addMentions, setAnalytics, updateAnalytics])

  const addKeyword = async () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      try {
        // Try to add to backend first
        try {
          await api.addKeyword(newKeyword.trim())
        } catch (apiError) {
          console.warn('Backend not available, adding to local store only:', apiError)
        }
        
        // Add to local state and store
        const updatedKeywords = [...keywords, newKeyword.trim()]
        setKeywords(updatedKeywords)
        storeAddKeyword(newKeyword.trim())
        setNewKeyword("")
      } catch (error) {
        console.error('Failed to add keyword:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage.includes('Monitoring not configured')) {
          setError("Please complete the discovery process first to select subreddits before adding keywords.")
        } else {
          setError("Failed to add keyword. Please try again.")
        }
      }
    }
  }

  const removeKeyword = async (keyword: string) => {
    try {
      // Try to remove from backend first
      try {
        await api.removeKeyword(keyword)
      } catch (apiError) {
        console.warn('Backend not available, removing from local store only:', apiError)
      }
      
      // Remove from local state and store
      const updatedKeywords = keywords.filter((k) => k !== keyword)
      setKeywords(updatedKeywords)
      storeRemoveKeyword(keyword)
    } catch (error) {
      console.error('Failed to remove keyword:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Monitoring not configured')) {
        setError("Please complete the discovery process first to select subreddits before managing keywords.")
      } else {
        setError("Failed to remove keyword. Please try again.")
      }
    }
  }

  const openMentionModal = (mention: Mention) => {
    // Navigate to thread detail page
    router.push(`/thread/${mention.id}`)
  }



  const markAsResponded = async (mentionId: string) => {
    try {
      await api.updateMentionStatus(mentionId, "RESPONDED")
      // Update local mentions
      setLocalMentions(prev => prev.map(m => 
        m.id === mentionId ? { ...m, status: 'responded' as const } : m
      ))
      // Update analytics
      updateAnalytics()
    } catch (error) {
      console.error('Failed to mark as responded:', error)
      setError("Failed to mark as responded. Please try again.")
    }
  }

  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp
    
    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "normal":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "responded":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "ignored":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  // Refresh mentions
  const refreshMentions = async () => {
    try {
      setIsRefreshing(true)
      try {
        const apiMentions = await api.getMentions()
        addMentions(apiMentions)
        
        const convertedMentions: Mention[] = apiMentions.map(mention => ({
          id: mention.id,
          subreddit: mention.subreddit,
          title: mention.title || "",
          snippet: mention.snippet,
          author: mention.author,
          age: formatTimeAgo(mention.created_utc),
          matchedKeywords: mention.matched_keywords,
          priority: mention.priority,
          sentiment: mention.sentiment || "neutral",
          status: mention.status.toLowerCase() as "new" | "responded" | "ignored",
          upvotes: mention.score ?? 0,
          comments: mention.num_comments ?? 0,
          fullPost: mention.snippet,
          topComments: [],
        }))
        
        setLocalMentions(convertedMentions)
        updateAnalytics()
      } catch (apiError) {
        console.warn('Backend not available for refresh:', apiError)
        setError("Backend not available. Using cached data.")
      }
    } catch (error) {
      console.error('Failed to refresh mentions:', error)
      setError("Failed to refresh mentions. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter mentions based on search and status
  const filteredMentions = localMentions.filter((mention: Mention) => {
    const matchesSearch = !searchQuery || 
      mention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mention.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || mention.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reddit Monitoring Dashboard</h1>
              <p className="text-gray-600">Track mentions and engage with your community</p>
            </div>

            {/* Tracked Subreddits Display */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold">Monitored Communities</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push("/discovery")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!monitoringConfig?.subreddits || monitoringConfig.subreddits.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No communities configured</h3>
                    <p className="text-gray-600 mb-4">
                      Complete the discovery process to start monitoring subreddits for mentions.
                    </p>
                    <Button 
                      onClick={() => router.push("/discovery")} 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Go to Discovery
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Active Communities</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {monitoringConfig.subreddits.length} communities
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {monitoringConfig.subreddits.map((subreddit) => (
                        <div
                          key={subreddit}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-gray-900">{subreddit}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="mentions" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Mentions
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mentions">
                  {/* Search and Filter Bar */}
                  <div className="mb-6 flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search mentions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="responded">Responded</option>
                      <option value="ignored">Ignored</option>
                    </select>
                    <Button 
                      onClick={refreshMentions} 
                      variant="outline" 
                      size="sm"
                      disabled={isRefreshing}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredMentions.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {localMentions.length === 0 ? "No mentions yet" : "No mentions match your filters"}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {localMentions.length === 0 
                              ? "We'll start showing mentions here once monitoring is active and we find relevant discussions."
                              : "Try adjusting your search or filter criteria."
                            }
                          </p>
                          {localMentions.length === 0 && (
                            <Button 
                              onClick={() => router.push("/discovery")} 
                              size="sm"
                            >
                              Set Up Monitoring
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      filteredMentions.map((mention) => (
                        <Card key={mention.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="cursor-pointer" onClick={() => openMentionModal(mention)}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{mention.subreddit}</Badge>
                                <span className="text-sm text-gray-500">{mention.age}</span>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(mention.priority)}`} />
                                {getStatusIcon(mention.status)}
                              </div>
                              <Badge className={getSentimentColor(mention.sentiment)}>{mention.sentiment}</Badge>
                            </div>

                            <h3 className="font-semibold mb-2">{mention.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{mention.snippet}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {mention.upvotes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {mention.comments}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {mention.matchedKeywords.map((keyword) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                              {mention.status === 'new' && (
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsResponded(mention.id)
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark Responded
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  {storeAnalytics ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{storeAnalytics.mention_totals}</div>
                            <p className="text-xs text-gray-500">All time mentions</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {storeAnalytics.mention_totals > 0 
                                ? Math.round((storeAnalytics.responded_count / storeAnalytics.mention_totals) * 100)
                                : 0}%
                            </div>
                            <p className="text-xs text-gray-500">
                              {storeAnalytics.responded_count} of {storeAnalytics.mention_totals} responded
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-gray-600">Loading analytics...</p>
                    </div>
                  )}

                  {storeAnalytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Subreddits</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {storeAnalytics.by_subreddit.length > 0 ? (
                              storeAnalytics.by_subreddit.map((sub) => (
                                <div key={sub.name} className="flex justify-between items-center">
                                  <span className="text-sm">{sub.name}</span>
                                  <Badge variant="secondary">{sub.count}</Badge>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No mentions yet
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Sentiment Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Positive</span>
                              <Badge className="bg-green-100 text-green-800">
                                {storeAnalytics.by_sentiment.positive}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Neutral</span>
                              <Badge className="bg-gray-100 text-gray-800">
                                {storeAnalytics.by_sentiment.neutral}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Negative</span>
                              <Badge className="bg-red-100 text-red-800">
                                {storeAnalytics.by_sentiment.negative}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
