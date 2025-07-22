"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ExternalLink, MessageSquare, ThumbsUp, Copy, RefreshCw, CheckCircle, Send } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { api, Mention as ApiMention } from "@/lib/api"
import { useAppStore } from "@/lib/store"

interface ThreadData {
  post: {
    title: string
    body: string
    author: string
    score: number
    created_utc: number
  }
  comments: Array<{
    author: string
    body: string
    score: number
    created_utc: number
  }>
  summary: string
  main_points: string[]
  sentiment: string
  opportunities: string[]
  risks: string[]
  confidence: number
  comment_count: number
}

interface ReplyDraft {
  id: string
  draft_text: string
  compliance: {
    score: number
    issues: Array<{
      severity: string
      message: string
    }>
  }
}

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.id as string
  
  const [threadData, setThreadData] = useState<ThreadData | null>(null)
  const [replyDraft, setReplyDraft] = useState<ReplyDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingReply, setIsGeneratingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [editableReply, setEditableReply] = useState("")

  useEffect(() => {
    loadThreadData()
  }, [threadId])

  const loadThreadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await api.getThreadSummary(threadId)
      setThreadData(data)
    } catch (err) {
      console.error('Failed to load thread data:', err)
      setError("Failed to load thread data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateReply = async () => {
    try {
      setIsGeneratingReply(true)
      const draft = await api.generateReplyDraft(threadId)
      setReplyDraft(draft)
      setEditableReply(draft.draft_text)
      setSent(false)
    } catch (err) {
      console.error('Failed to generate reply:', err)
      setError("Failed to generate reply. Please try again.")
    } finally {
      setIsGeneratingReply(false)
    }
  }

  const copyReply = async () => {
    if (editableReply) {
      await navigator.clipboard.writeText(editableReply)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sendReply = async () => {
    if (!editableReply.trim()) return
    
    try {
      setIsSending(true)
      
      // For now, we'll just simulate sending and mark as responded
      // In a real implementation, you'd use Reddit's API to actually post the reply
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Mark as responded
      await api.updateMentionStatus(threadId, "RESPONDED")
      
      setSent(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
      
    } catch (err) {
      console.error('Failed to send reply:', err)
      setError("Failed to send reply. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const markAsResponded = async () => {
    try {
      await api.updateMentionStatus(threadId, "RESPONDED")
      router.push("/dashboard")
    } catch (err) {
      console.error('Failed to mark as responded:', err)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Loading thread...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !threadData) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Thread not found"}</p>
              <Button onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Thread Analysis</h1>
              <p className="text-gray-600">AI-powered insights and response assistance</p>
            </div>
            <Button variant="outline" onClick={() => window.open(`https://reddit.com/r/${threadData.post.author}`, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Reddit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Post */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">r/SaaS</Badge>
                    <span className="text-sm text-gray-500">
                      by u/{threadData.post.author} • {formatTimeAgo(threadData.post.created_utc)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {threadData.post.score}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {threadData.comment_count}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg">{threadData.post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{threadData.post.body}</p>
              </CardContent>
            </Card>

            {/* Top Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Top Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threadData.comments.slice(0, 5).map((comment, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">u/{comment.author}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_utc)}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp className="h-3 w-3" />
                          {comment.score}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Analysis</CardTitle>
                  {threadData.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(threadData.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700">{threadData.summary}</p>
                </div>

                {/* Main Points */}
                {threadData.main_points && threadData.main_points.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Main Points</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {threadData.main_points.map((point, index) => (
                        <li key={index} className="text-gray-700 text-sm">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunities */}
                {threadData.opportunities && threadData.opportunities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2">Opportunities</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {threadData.opportunities.map((opp, index) => (
                        <li key={index} className="text-green-600 text-sm">{opp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risks */}
                {threadData.risks && threadData.risks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2">Potential Risks</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {threadData.risks.map((risk, index) => (
                        <li key={index} className="text-red-600 text-sm">{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getSentimentColor(threadData.sentiment)}>
                  {threadData.sentiment}
                </Badge>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={generateReply} 
                  disabled={isGeneratingReply}
                  className="w-full"
                >
                  {isGeneratingReply ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Draft AI Reply"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={markAsResponded}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Responded
                </Button>
              </CardContent>
            </Card>

            {/* Reply Draft */}
            {replyDraft && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Reply Draft</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Compliance Score</span>
                    <Progress value={replyDraft.compliance.score} className="flex-1" />
                    <span className="text-xs font-medium">{replyDraft.compliance.score}%</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    value={editableReply}
                    onChange={(e) => setEditableReply(e.target.value)}
                    placeholder="Edit your reply here..."
                    className="min-h-[200px]"
                    disabled={sent}
                  />
                  
                  {replyDraft.compliance.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Issues:</p>
                      {replyDraft.compliance.issues.map((issue, index) => (
                        <div key={index} className={`text-xs p-2 rounded ${
                          issue.severity === 'ERROR' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {issue.message}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {!sent ? (
                      <>
                        <Button 
                          onClick={sendReply}
                          disabled={isSending || !editableReply.trim()}
                          className="flex-1"
                        >
                          {isSending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Reply
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={copyReply}
                          variant="outline"
                          disabled={!editableReply.trim()}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button 
                          onClick={generateReply}
                          variant="outline"
                          size="icon"
                          disabled={isGeneratingReply}
                        >
                          <RefreshCw className={`h-4 w-4 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 text-center">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reply Sent Successfully!
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
