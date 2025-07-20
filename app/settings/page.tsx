"use client"

import { useState } from "react"
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
  const [brandData, setBrandData] = useState<BrandData>({
    name: "TechFlow Solutions",
    oneLiner: "AI-powered project management for remote teams",
    products: "SaaS platform, mobile app, consulting services",
    targetUsers: "Remote team managers, startup founders, project coordinators",
    valueProps: "Increase productivity by 40%, reduce meeting time, seamless integration",
    tone: "Professional but friendly, helpful, data-driven, conversational",
    competitors: "Asana, Monday.com, Trello, Notion",
    prohibitedTopics: "Politics, controversial topics, competitor bashing",
    keywords: ["project management", "remote teams", "productivity", "alternatives", "Monday.com", "Asana"],
    disclosure: "I work at TechFlow Solutions and wanted to share some insights.",
  })

  const [newKeyword, setNewKeyword] = useState("")

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

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving brand data:", brandData)
    // Show success message or redirect
    router.push("/dashboard")
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

          <div className="flex justify-end mt-8">
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