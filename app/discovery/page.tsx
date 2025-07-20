"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Search, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Subreddit {
  name: string
  members: string
  activity: number
  relevance: number
  description: string
  selected: boolean
}

const recommendedSubreddits: Subreddit[] = [
  {
    name: "r/entrepreneur",
    members: "1.2M",
    activity: 85,
    relevance: 92,
    description: "A community of entrepreneurs sharing experiences and advice",
    selected: false,
  },
  {
    name: "r/startups",
    members: "890K",
    activity: 78,
    relevance: 88,
    description: "Startup community for founders and early employees",
    selected: false,
  },
  {
    name: "r/SaaS",
    members: "156K",
    activity: 72,
    relevance: 95,
    description: "Software as a Service discussion and resources",
    selected: false,
  },
  {
    name: "r/ProjectManagement",
    members: "234K",
    activity: 65,
    relevance: 90,
    description: "Project management professionals and enthusiasts",
    selected: false,
  },
  {
    name: "r/remotework",
    members: "445K",
    activity: 80,
    relevance: 85,
    description: "Remote work tips, tools, and discussions",
    selected: false,
  },
  {
    name: "r/productivity",
    members: "678K",
    activity: 75,
    relevance: 82,
    description: "Tips and tools for being more productive",
    selected: false,
  },
  {
    name: "r/smallbusiness",
    members: "1.1M",
    activity: 70,
    relevance: 78,
    description: "Small business owners sharing advice and experiences",
    selected: false,
  },
  {
    name: "r/marketing",
    members: "567K",
    activity: 68,
    relevance: 75,
    description: "Marketing strategies, tools, and discussions",
    selected: false,
  },
]

export default function DiscoveryPage() {
  const router = useRouter()
  const [subreddits, setSubreddits] = useState<Subreddit[]>(recommendedSubreddits)
  const [searchTerm, setSearchTerm] = useState("")

  const selectedSubreddits = subreddits.filter((s) => s.selected)

  const toggleSubreddit = (name: string) => {
    setSubreddits((prev) => prev.map((sub) => (sub.name === name ? { ...sub, selected: !sub.selected } : sub)))
  }

  const removeSelected = (name: string) => {
    setSubreddits((prev) => prev.map((sub) => (sub.name === name ? { ...sub, selected: false } : sub)))
  }

  const filteredSubreddits = subreddits.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const startMonitoring = () => {
    // Save selected subreddits and navigate to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Subreddits to Monitor</h1>
          <p className="text-gray-600">
            We've found relevant communities based on your brand. Select the ones you'd like to monitor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subreddits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subreddit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubreddits.map((subreddit) => (
                <Card
                  key={subreddit.name}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    subreddit.selected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={subreddit.selected}
                          onCheckedChange={() => toggleSubreddit(subreddit.name)}
                        />
                        <div>
                          <CardTitle className="text-lg">{subreddit.name}</CardTitle>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              {subreddit.members}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">{subreddit.description}</p>

                    <div className="space-y-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Selected Subreddits
                </CardTitle>
                <CardDescription>{selectedSubreddits.length} communities selected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {selectedSubreddits.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No subreddits selected yet</p>
                  ) : (
                    selectedSubreddits.map((subreddit) => (
                      <div key={subreddit.name} className="flex items-center justify-between">
                        <Badge variant="secondary" className="flex-1 justify-start">
                          {subreddit.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelected(subreddit.name)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <Button
                  onClick={startMonitoring}
                  disabled={selectedSubreddits.length === 0}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  Start Monitoring
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {selectedSubreddits.length === 0 && (
                  <p className="text-xs text-gray-500 text-center mt-2">Select at least one subreddit to continue</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
