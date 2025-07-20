"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Plus, X, MessageSquare, ThumbsUp, AlertCircle, CheckCircle, Eye, BarChart3 } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Mention {
  id: string
  subreddit: string
  title: string
  snippet: string
  author: string
  age: string
  matchedKeywords: string[]
  priority: "high" | "medium" | "low"
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

const mockMentions: Mention[] = [
  {
    id: "1",
    subreddit: "r/entrepreneur",
    title: "Looking for project management tools for my startup",
    snippet:
      "We're a team of 8 and struggling with coordination. Any recommendations for tools that work well for remote teams?",
    author: "startup_founder_23",
    age: "2h",
    matchedKeywords: ["project management", "remote teams"],
    priority: "high",
    sentiment: "neutral",
    status: "new",
    upvotes: 15,
    comments: 8,
    fullPost:
      "We're a team of 8 and struggling with coordination. Any recommendations for tools that work well for remote teams? We've tried a few but nothing seems to stick. Looking for something that's not too complex but has good features for tracking progress and deadlines.",
    topComments: [
      { author: "pm_expert", content: "Have you tried Asana? Works great for our team.", upvotes: 5 },
      { author: "remote_worker", content: "Monday.com is expensive but worth it", upvotes: 3 },
    ],
  },
  {
    id: "2",
    subreddit: "r/SaaS",
    title: "Alternatives to Monday.com?",
    snippet:
      "Monday.com is getting too expensive for our growing team. What are some good alternatives that offer similar features?",
    author: "saas_builder",
    age: "4h",
    matchedKeywords: ["alternatives", "Monday.com"],
    priority: "high",
    sentiment: "negative",
    status: "new",
    upvotes: 23,
    comments: 12,
    fullPost:
      "Monday.com is getting too expensive for our growing team. What are some good alternatives that offer similar features? We need something with good automation, custom fields, and team collaboration features.",
    topComments: [
      { author: "cost_saver", content: "Check out ClickUp, much more affordable", upvotes: 8 },
      { author: "project_lead", content: "Notion can work if you set it up right", upvotes: 4 },
    ],
  },
  {
    id: "3",
    subreddit: "r/productivity",
    title: "How to reduce meeting fatigue in remote teams?",
    snippet:
      "Our team is spending way too much time in meetings. Any tools or strategies to make collaboration more efficient?",
    author: "productivity_seeker",
    age: "6h",
    matchedKeywords: ["remote teams", "productivity"],
    priority: "medium",
    sentiment: "neutral",
    status: "responded",
    upvotes: 31,
    comments: 18,
    fullPost:
      "Our team is spending way too much time in meetings. Any tools or strategies to make collaboration more efficient? We're all remote and it feels like we're always in Zoom calls.",
    topComments: [
      { author: "meeting_hater", content: "Async communication is key. Use Slack more.", upvotes: 12 },
      { author: "remote_manager", content: "Set meeting-free days, works wonders", upvotes: 9 },
    ],
  },
]

const mockKeywords = ["project management", "remote teams", "productivity", "alternatives", "Monday.com", "Asana"]

export default function DashboardPage() {
  const [mentions] = useState<Mention[]>(mockMentions)
  const [keywords, setKeywords] = useState<string[]>(mockKeywords)
  const [newKeyword, setNewKeyword] = useState("")
  const [selectedMention, setSelectedMention] = useState<Mention | null>(null)
  const [aiReply, setAiReply] = useState("")
  const [complianceScore, setComplianceScore] = useState(85)
  const [activeTab, setActiveTab] = useState("mentions")

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const openMentionModal = (mention: Mention) => {
    setSelectedMention(mention)
    // Generate AI reply
    generateAIReply(mention)
  }

  const generateAIReply = (mention: Mention) => {
    // Mock AI reply generation
    const replies = [
      `Hi! I work at TechFlow Solutions and wanted to share some insights. Based on your needs for ${mention.matchedKeywords.join(" and ")}, you might find our platform helpful. We've specifically designed it for teams like yours who struggle with coordination. Would be happy to share more details if you're interested!`,
      `Great question! As someone from TechFlow Solutions, I've seen many teams face similar challenges. Our platform addresses exactly what you're looking for with ${mention.matchedKeywords.join(" and ")}. Feel free to check it out or ask any questions!`,
    ]
    setAiReply(replies[Math.floor(Math.random() * replies.length)])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
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
      case "responded":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "ignored":
        return <Eye className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="flex">
            {/* Left Sidebar - existing keyword sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Tracked Keywords</h2>

              <div className="space-y-2 mb-4">
                {keywords.map((keyword) => (
                  <div key={keyword} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{keyword}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeKeyword(keyword)} className="h-6 w-6 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  className="text-sm"
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reddit Monitoring Dashboard</h1>
                <p className="text-gray-600">Track mentions and engage with your community</p>
              </div>

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
                  <div className="space-y-4">
                    {mentions.map((mention) => (
                      <Card key={mention.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6" onClick={() => openMentionModal(mention)}>
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">127</div>
                        <p className="text-xs text-gray-500">+12% from last week</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-xs text-gray-500">+5% from last week</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">2.4h</div>
                        <p className="text-xs text-gray-500">-0.3h from last week</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Subreddits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {["r/entrepreneur", "r/SaaS", "r/startups", "r/productivity"].map((sub, index) => (
                            <div key={sub} className="flex justify-between items-center">
                              <span className="text-sm">{sub}</span>
                              <Badge variant="secondary">{[45, 32, 28, 22][index]}</Badge>
                            </div>
                          ))}
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
                            <Badge className="bg-green-100 text-green-800">42</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Neutral</span>
                            <Badge className="bg-gray-100 text-gray-800">65</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Negative</span>
                            <Badge className="bg-red-100 text-red-800">20</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
