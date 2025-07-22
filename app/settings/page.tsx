"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Plus, Save, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { api, BrandContext } from "@/lib/api"
import { useAppStore, convertBrandContextToLocal, convertLocalToBrandContext } from "@/lib/store"

interface BrandData {
  name: string
  oneLiner: string
  products: string
  targetUsers: string
  valueProps: string
  tone: string
  competitors: string
  prohibitedTopics: string
  keywords: string[]
  disclosure: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { 
    brandContext, 
    setBrandContext, 
    setLoading, 
    setError, 
    error, 
    isLoading,
    clearAllData
  } = useAppStore()
  
  const [brandData, setBrandData] = useState<BrandData>({
    name: "",
    oneLiner: "",
    products: "",
    targetUsers: "",
    valueProps: "",
    tone: "",
    competitors: "",
    prohibitedTopics: "",
    keywords: [],
    disclosure: "",
  })
  const [newKeyword, setNewKeyword] = useState("")

  // Load brand context from store or backend
  useEffect(() => {
    const loadBrandContext = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First try to load from local store
        if (brandContext) {
          const localData = convertBrandContextToLocal(brandContext)
          setBrandData(localData)
          setLoading(false)
          return
        }
        
        // If not in store, try backend
        try {
          const context = await api.getBrandContext()
          setBrandContext(context)
          const localData = convertBrandContextToLocal(context)
          setBrandData(localData)
        } catch (apiError) {
          console.warn('Backend not available:', apiError)
          setError("No brand context found. Please complete onboarding first.")
        }
      } catch (err) {
        console.error('Failed to load brand context:', err)
        setError("Failed to load brand context. Please complete onboarding first.")
      } finally {
        setLoading(false)
      }
    }

    loadBrandContext()
  }, [brandContext, setBrandContext, setLoading, setError])

  const updateBrandData = (field: keyof BrandData, value: string) => {
    setBrandData((prev) => ({ ...prev, [field]: value }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !brandData.keywords.includes(newKeyword.trim())) {
      setBrandData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setBrandData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Convert local format back to backend format
      const contextData = convertLocalToBrandContext(brandData)

      // Save to backend (if available)
      try {
        await api.saveBrandContext(contextData)
      } catch (apiError) {
        console.warn('Backend not available, saving to local storage only:', apiError)
      }
      
      // Save to local store
      const completeBrandContext: BrandContext = {
        brand_name: contextData.brand_name || "",
        one_line: contextData.one_line || "",
        products: contextData.products || [],
        target_users: contextData.target_users || [],
        value_props: contextData.value_props || [],
        tone: contextData.tone || { formality: "neutral", voice_keywords: [] },
        keywords: contextData.keywords || [],
        competitors: contextData.competitors || [],
        prohibited: contextData.prohibited || [],
        disclosure_template: contextData.disclosure_template || "",
      }
      
      setBrandContext(completeBrandContext)
      router.push("/dashboard")
    } catch (error) {
      console.error('Failed to save brand context:', error)
      setError("Failed to save changes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Loading brand settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => router.push("/")}>
                  Complete Onboarding
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your brand configuration and preferences</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Tabs defaultValue="brand" className="space-y-6">
            <TabsList>
              <TabsTrigger value="brand">Brand Information</TabsTrigger>
              <TabsTrigger value="keywords">Keywords & Monitoring</TabsTrigger>
              <TabsTrigger value="tone">Tone & Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your brand's core details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g., TechFlow Solutions"
                      value={brandData.name}
                      onChange={(e) => updateBrandData("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneLiner">One-liner Description *</Label>
                    <Input
                      id="oneLiner"
                      placeholder="e.g., AI-powered project management for remote teams"
                      value={brandData.oneLiner}
                      onChange={(e) => updateBrandData("oneLiner", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="products">Products/Services *</Label>
                    <Textarea
                      id="products"
                      placeholder="e.g., SaaS platform, mobile app, consulting services"
                      value={brandData.products}
                      onChange={(e) => updateBrandData("products", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Audience & Value</CardTitle>
                  <CardDescription>Who you serve and what you offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetUsers">Target Users *</Label>
                    <Textarea
                      id="targetUsers"
                      placeholder="e.g., Remote team managers, startup founders, project coordinators"
                      value={brandData.targetUsers}
                      onChange={(e) => updateBrandData("targetUsers", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valueProps">Value Propositions *</Label>
                    <Textarea
                      id="valueProps"
                      placeholder="e.g., Increase productivity by 40%, reduce meeting time, seamless integration"
                      value={brandData.valueProps}
                      onChange={(e) => updateBrandData("valueProps", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Context</CardTitle>
                  <CardDescription>Your competitive landscape</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Main Competitors *</Label>
                    <Textarea
                      id="competitors"
                      placeholder="e.g., Asana, Monday.com, Trello, Notion"
                      value={brandData.competitors}
                      onChange={(e) => updateBrandData("competitors", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prohibited">Prohibited Topics (Optional)</Label>
                    <Textarea
                      id="prohibited"
                      placeholder="e.g., Politics, controversial topics, competitor bashing"
                      value={brandData.prohibitedTopics}
                      onChange={(e) => updateBrandData("prohibitedTopics", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Keywords & Monitoring</CardTitle>
                  <CardDescription>Manage the keywords we monitor for mentions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Keywords</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-4">
                      {brandData.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tone" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tone & Voice</CardTitle>
                  <CardDescription>How your brand communicates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Brand Tone & Voice *</Label>
                    <Textarea
                      id="tone"
                      placeholder="e.g., Professional but friendly, helpful, data-driven, conversational"
                      value={brandData.tone}
                      onChange={(e) => updateBrandData("tone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disclosure">Disclosure Statement *</Label>
                    <Textarea
                      id="disclosure"
                      placeholder="How you'll identify yourself when engaging"
                      value={brandData.disclosure}
                      onChange={(e) => updateBrandData("disclosure", e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      This will be included in your replies to maintain transparency
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button 
              onClick={clearAllData} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              Reset All Data
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
