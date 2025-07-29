"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Search, X, ArrowRight, Loader2, Plus, Hash, Sparkles, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { api, SubredditProfile, formatMemberCount } from "@/lib/api"
import { useAppStore } from "@/lib/store"

interface Subreddit extends SubredditProfile {
  selected: boolean
}

export default function DiscoveryPage() {
  const router = useRouter()
  const { brandContext, setBrandContext, monitoringConfig, setMonitoringConfig, setLoading, setError, error, isLoading } = useAppStore()
  const [subreddits, setSubreddits] = useState<Subreddit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubreddits, setDiscoveredSubreddits] = useState<SubredditProfile[]>([]) // Store discovered subreddits

  // Load existing keywords and discovered subreddits on component mount
  useEffect(() => {
    if (brandContext?.keywords && brandContext.keywords.length > 0) {
      setKeywords(brandContext.keywords)
    } else {
      // Generate suggested keywords from brand context
      generateSuggestedKeywords()
    }

    // Load previously discovered subreddits from localStorage
    const savedSubreddits = localStorage.getItem('discoveredSubreddits')
    if (savedSubreddits) {
      try {
        const parsed = JSON.parse(savedSubreddits)
        setDiscoveredSubreddits(parsed)
        
        // Convert to our interface format with selected state
        const formattedSubreddits: Subreddit[] = parsed.map((sub: SubredditProfile) => ({
          ...sub,
          selected: monitoringConfig?.subreddits?.includes(sub.name) || false
        }))
        
        setSubreddits(formattedSubreddits)
      } catch (error) {
        console.error('Error parsing saved subreddits:', error)
      }
    }
  }, [brandContext, monitoringConfig])

  const generateSuggestedKeywords = () => {
    if (!brandContext) return
    
    const suggested: string[] = []
    
    // Add brand name
    if (brandContext.brand_name) {
      suggested.push(brandContext.brand_name.toLowerCase())
    }
    
    // Add products
    if (brandContext.products && brandContext.products.length > 0) {
      suggested.push(...brandContext.products.map(p => p.toLowerCase()))
    }
    
    // Add some generic keywords based on value props
    if (brandContext.value_props && brandContext.value_props.length > 0) {
      suggested.push(...brandContext.value_props.map(v => v.toLowerCase()))
    }
    
    // Add common keywords
    suggested.push('customer support', 'alternatives', 'reviews', 'help')
    
    // Filter and dedupe
    const uniqueKeywords = [...new Set(suggested.filter(k => k && k.length > 2))]
    setKeywords(uniqueKeywords.slice(0, 8)) // Limit to 8 suggestions
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      const updatedKeywords = [...keywords, newKeyword.trim().toLowerCase()]
      setKeywords(updatedKeywords)
      updateBrandContextKeywords(updatedKeywords)
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = keywords.filter(k => k !== keyword)
    setKeywords(updatedKeywords)
    updateBrandContextKeywords(updatedKeywords)
  }

  const updateBrandContextKeywords = (updatedKeywords: string[]) => {
    if (brandContext) {
      setBrandContext({
        ...brandContext,
        keywords: updatedKeywords
      })
    }
  }

  const discoverSubreddits = async () => {
    if (keywords.length === 0) {
      setError('Please add at least one keyword to discover subreddits.')
      return
    }

    try {
      setIsDiscovering(true)
      setError(null)
      
      // Discover subreddits based on keywords
      try {
        const discoveredSubreddits = await api.discoverSubreddits(keywords)
        
        // Convert to our interface format
        const formattedSubreddits: Subreddit[] = discoveredSubreddits.map(sub => ({
          ...sub,
          selected: false
        }))
        
        setSubreddits(formattedSubreddits)
        setDiscoveredSubreddits(discoveredSubreddits)
        
        // Save to localStorage for persistence
        localStorage.setItem('discoveredSubreddits', JSON.stringify(discoveredSubreddits))
      } catch (apiError) {
        console.warn('Backend not available for subreddit discovery:', apiError)
        setError('Backend not available. Please try again later.')
      }
    } catch (err) {
      console.error('Failed to discover subreddits:', err)
      setError('Failed to discover subreddits. Please try again.')
    } finally {
      setIsDiscovering(false)
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Communities</h1>
              <p className="text-gray-600">
                First choose keywords to monitor, then discover and select relevant subreddits.
              </p>
            </div>

            {/* Keywords Selection Section */}
            <Card className="mb-8 border-2 border-blue-100 bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-600" />
                  Choose Keywords to Monitor
                </CardTitle>
                <CardDescription>
                  Select keywords that represent your brand, products, and topics you want to track on Reddit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Current Keywords</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {keywords.length} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-white rounded-lg border border-gray-200">
                    {keywords.length === 0 ? (
                      <div className="text-gray-400 text-sm flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Add keywords to start discovering relevant subreddits
                      </div>
                    ) : (
                      keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="default"
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-1 px-3 py-1 hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          <Hash className="h-3 w-3" />
                          {keyword}
                          <X
                            className="h-3 w-3 cursor-pointer hover:bg-white/20 rounded"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Keywords */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword (e.g., customer support, alternatives)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                    className="flex-1"
                  />
                  <Button onClick={addKeyword} size="sm" className="px-4">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Discover Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {keywords.length > 0 ? 
                      `Ready to discover subreddits for ${keywords.length} keyword${keywords.length > 1 ? 's' : ''}` : 
                      'Add at least one keyword to continue'
                    }
                  </div>
                  <Button 
                    onClick={discoverSubreddits}
                    disabled={keywords.length === 0 || isDiscovering}
                    className="flex items-center gap-2"
                  >
                    {isDiscovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Discovering...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Discover Subreddits
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subreddits Section - Only show when we have discovered subreddits */}
            {(subreddits.length > 0 || error) && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Discovered Subreddits</h2>
                  <p className="text-gray-600">Select the communities you want to monitor for your keywords.</p>
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
                    {error ? (
                      <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={discoverSubreddits}>Try Again</Button>
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
