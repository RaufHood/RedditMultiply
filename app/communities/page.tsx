"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, Users, TrendingUp, X } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Subreddit {
  name: string
  members: string
  activity: number
  relevance: number
  description: string
  mentions: number
  lastActivity: string
}

const monitoredSubreddits: Subreddit[] = [
  {
    name: "r/entrepreneur",
    members: "1.2M",
    activity: 85,
    relevance: 92,
    description: "A community of entrepreneurs sharing experiences and advice",
    mentions: 45,
    lastActivity: "2h ago",
  },
  {
    name: "r/SaaS",
    members: "156K",
    activity: 72,
    relevance: 95,
    description: "Software as a Service discussion and resources",
    mentions: 32,
    lastActivity: "4h ago",
  },
  {
    name: "r/startups",
    members: "890K",
    activity: 78,
    relevance: 88,
    description: "Startup community for founders and early employees",
    mentions: 28,
    lastActivity: "6h ago",
  },
  {
    name: "r/productivity",
    members: "678K",
    activity: 75,
    relevance: 82,
    description: "Tips and tools for being more productive",
    mentions: 22,
    lastActivity: "1d ago",
  },
]

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [subreddits] = useState<Subreddit[]>(monitoredSubreddits)

  const filteredSubreddits = subreddits.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitored Communities</h1>
              <p className="text-gray-600">
                Track mentions and engagement across your selected subreddits
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subreddits.length}</div>
                  <p className="text-xs text-gray-500">Monitored subreddits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Mentions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subreddits.reduce((sum, sub) => sum + sub.mentions, 0)}</div>
                  <p className="text-xs text-gray-500">Across all communities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(subreddits.reduce((sum, sub) => sum + sub.activity, 0) / subreddits.length)}%
                  </div>
                  <p className="text-xs text-gray-500">Community engagement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Relevance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(subreddits.reduce((sum, sub) => sum + sub.relevance, 0) / subreddits.length)}%
                  </div>
                  <p className="text-xs text-gray-500">Brand alignment</p>
                </CardContent>
              </Card>
            </div>

            {/* Community Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubreddits.map((subreddit) => (
                <Card key={subreddit.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{subreddit.name}</CardTitle>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {subreddit.members}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {subreddit.mentions} mentions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">{subreddit.description}</p>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Activity Level</span>
                          <span className="font-medium">{subreddit.activity}%</span>
                        </div>
                        <Progress value={subreddit.activity} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Relevance</span>
                          <span className="font-medium">{subreddit.relevance}%</span>
                        </div>
                        <Progress value={subreddit.relevance} className="h-2 bg-green-100">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${subreddit.relevance}%` }}
                          />
                        </Progress>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last activity: {subreddit.lastActivity}</span>
                      <Button variant="outline" size="sm">
                        View Mentions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSubreddits.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
