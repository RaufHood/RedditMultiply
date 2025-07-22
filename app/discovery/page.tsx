"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Search, X, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { api, SubredditProfile, formatMemberCount } from "@/lib/api"
import { useAppStore } from "@/lib/store"

interface Subreddit extends SubredditProfile {
  selected: boolean
}

export default function DiscoveryPage() {
  const router = useRouter()
  const { brandContext, setMonitoringConfig, setLoading, setError, error, isLoading } = useAppStore()
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Load subreddits from API on component mount
  useEffect(() => {
    const loadSubreddits = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get keywords from store or use defaults
        let keywords: string[]
        if (brandContext?.keywords && brandContext.keywords.length > 0) {
          keywords = brandContext.keywords
        } else {
          try {
            const context = await api.getBrandContext()
            keywords = context.keywords || ['software', 'development', 'tech support']
          } catch (apiError) {
            console.warn('Backend not available, using default keywords:', apiError)
            keywords = ['software', 'development', 'tech support']
          }
        }
        
        // Discover subreddits based on keywords
        try {
          const discoveredSubreddits = await api.discoverSubreddits(keywords)
          
          // Convert to our interface format
          const formattedSubreddits: Subreddit[] = discoveredSubreddits.map(sub => ({
            ...sub,
            selected: false
          }))
          
          setSubreddits(formattedSubreddits)
        } catch (apiError) {
          console.warn('Backend not available for subreddit discovery:', apiError)
          setError('Backend not available. Please try again later.')
        }
      } catch (err) {
        console.error('Failed to load subreddits:', err)
        setError('Failed to load subreddits. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadSubreddits()
  }, [brandContext, setLoading, setError])

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

  const startMonitoring = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const selectedSubredditNames = selectedSubreddits.map(s => s.name)
      const keywords = brandContext?.keywords || []
      
      // Try to configure monitoring on backend
      try {
        await api.configureMonitoring(selectedSubredditNames, keywords)
      } catch (apiError) {
        console.warn('Backend not available, saving to local store only:', apiError)
      }
      
      // Save to local store
      setMonitoringConfig({
        subreddits: selectedSubredditNames,
        keywords: keywords,
        configured_at: Date.now()
      })
      
      router.push("/dashboard")
    } catch (error) {
      console.error('Failed to start monitoring:', error)
      setError('Failed to start monitoring. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading subreddits...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                ) : (
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
                                  {formatMemberCount(subreddit.member_count)}
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
                              <span className="font-medium">{Math.round(subreddit.activity_score)}%</span>
                            </div>
                            <Progress value={subreddit.activity_score} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Relevance</span>
                              <span className="font-medium">{Math.round(subreddit.relevance_score * 100)}%</span>
                            </div>
                            <Progress value={subreddit.relevance_score * 100} className="h-2 bg-green-100">
                              <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${subreddit.relevance_score * 100}%` }}
                              />
                            </Progress>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
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
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Select at least one subreddit to continue
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
