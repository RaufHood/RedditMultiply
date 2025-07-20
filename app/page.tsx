"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Plus, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

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

const steps = [
  { title: "Brand Basics", description: "Tell us about your brand" },
  { title: "Target & Value", description: "Who you serve and why" },
  { title: "Voice & Competitors", description: "Your tone and competition" },
  { title: "Keywords & Disclosure", description: "What to monitor and how to identify" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
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

  const generateKeywords = () => {
    // Auto-generate keywords based on brand data
    const generated = [
      brandData.name.toLowerCase(),
      ...brandData.products.split(",").map((p) => p.trim().toLowerCase()),
      ...brandData.valueProps.split(",").map((v) => v.trim().toLowerCase()),
      "customer support",
      "alternatives",
      "reviews",
    ].filter((k) => k && k.length > 2)

    setBrandData((prev) => ({
      ...prev,
      keywords: [...new Set([...prev.keywords, ...generated])],
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 2) {
        // Auto-generate keywords when moving to step 4
        generateKeywords()
        setBrandData((prev) => ({
          ...prev,
          disclosure: `I work at ${prev.name} and wanted to share some insights.`,
        }))
      }
    } else {
      // Move to discovery screen
      router.push("/discovery")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return brandData.name && brandData.oneLiner
      case 1:
        return brandData.products && brandData.targetUsers && brandData.valueProps
      case 2:
        return brandData.tone && brandData.competitors
      case 3:
        return brandData.keywords.length > 0 && brandData.disclosure
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RedditReach Setup</h1>
          <p className="text-gray-600">Let's understand your brand and find the right communities</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${index <= currentStep ? "text-blue-600" : "text-gray-500"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${index < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <>
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
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="products">Products/Services *</Label>
                  <Textarea
                    id="products"
                    placeholder="e.g., SaaS platform, mobile app, consulting services"
                    value={brandData.products}
                    onChange={(e) => updateBrandData("products", e.target.value)}
                  />
                </div>
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
              </>
            )}

            {currentStep === 2 && (
              <>
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
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Auto-generated Keywords</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Based on your brand info, we've generated these keywords to monitor:
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
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
                        placeholder="Add custom keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? "Find Subreddits" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
