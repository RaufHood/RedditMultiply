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
import { Navigation } from "@/components/navigation"
import { api, BrandContext } from "@/lib/api"
import { useAppStore, convertLocalToBrandContext } from "@/lib/store"

const steps = [
  { title: "Brand Basics", description: "Tell us about your brand" },
  { title: "Target & Value", description: "Who you serve and why" },
  { title: "Voice & Competitors", description: "Your tone and competition" },
  { title: "Keywords & Disclosure", description: "What to monitor and how to identify" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { setBrandContext, setLoading, setError, error, isLoading } = useAppStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [brandData, setBrandData] = useState<Partial<BrandContext>>({
    brand_name: "",
    one_line: "",
    products: [],
    target_users: [],
    value_props: [],
    tone: { formality: "neutral", voice_keywords: [] },
    keywords: [],
    competitors: [],
    prohibited: [],
    disclosure_template: "",
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateBrandData = (field: keyof BrandContext, value: any) => {
    setBrandData((prev) => ({ ...prev, [field]: value }))
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !brandData.keywords?.includes(newKeyword.trim())) {
      setBrandData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()],
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setBrandData((prev) => ({
      ...prev,
      keywords: prev.keywords?.filter((k) => k !== keyword) || [],
    }))
  }

  const generateKeywords = () => {
    // Auto-generate keywords based on brand data
    const generated = [
      brandData.brand_name?.toLowerCase(),
      ...(brandData.products || []).map((p) => p.toLowerCase()),
      ...(brandData.value_props || []).map((v) => v.toLowerCase()),
      "customer support",
      "alternatives",
      "reviews",
    ].filter((k) => k && k.length > 2) as string[]

    setBrandData((prev) => ({
      ...prev,
      keywords: [...new Set([...(prev.keywords || []), ...generated])],
    }))
  }

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 2) {
        // Auto-generate keywords when moving to step 4
        generateKeywords()
        setBrandData((prev) => ({
          ...prev,
          disclosure_template: `I work at ${prev.brand_name} and wanted to share some insights.`,
        }))
      }
    } else {
      // Save brand context and move to discovery
      try {
        setIsSubmitting(true)
        setError(null)
        setLoading(true)
        
        // Save to backend (if available)
        try {
          await api.saveBrandContext(brandData)
        } catch (apiError) {
          console.warn('Backend not available, saving to local storage only:', apiError)
        }
        
        // Save to local store
        const completeBrandContext: BrandContext = {
          brand_name: brandData.brand_name || "",
          one_line: brandData.one_line || "",
          products: brandData.products || [],
          target_users: brandData.target_users || [],
          value_props: brandData.value_props || [],
          tone: brandData.tone || { formality: "neutral", voice_keywords: [] },
          keywords: brandData.keywords || [],
          competitors: brandData.competitors || [],
          prohibited: brandData.prohibited || [],
          disclosure_template: brandData.disclosure_template || "",
        }
        
        setBrandContext(completeBrandContext)
        router.push("/discovery")
      } catch (error) {
        console.error('Failed to save brand context:', error)
        setError("Failed to save brand context. Please try again.")
      } finally {
        setIsSubmitting(false)
        setLoading(false)
      }
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
        return brandData.brand_name && brandData.one_line
      case 1:
        return brandData.products && brandData.products.length > 0 && brandData.target_users && brandData.target_users.length > 0 && brandData.value_props && brandData.value_props.length > 0
      case 2:
        return brandData.tone && brandData.tone.formality && brandData.competitors && brandData.competitors.length > 0
      case 3:
        return brandData.keywords && brandData.keywords.length > 0 && brandData.disclosure_template
      default:
        return false
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                      value={brandData.brand_name || ""}
                      onChange={(e) => updateBrandData("brand_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oneLiner">One-liner Description *</Label>
                    <Input
                      id="oneLiner"
                      placeholder="e.g., AI-powered project management for remote teams"
                      value={brandData.one_line || ""}
                      onChange={(e) => updateBrandData("one_line", e.target.value)}
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
                      value={brandData.products?.join(', ') || ""}
                      onChange={(e) => updateBrandData("products", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetUsers">Target Users *</Label>
                    <Textarea
                      id="targetUsers"
                      placeholder="e.g., Remote team managers, startup founders, project coordinators"
                      value={brandData.target_users?.join(', ') || ""}
                      onChange={(e) => updateBrandData("target_users", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valueProps">Value Propositions *</Label>
                    <Textarea
                      id="valueProps"
                      placeholder="e.g., Increase productivity by 40%, reduce meeting time, seamless integration"
                      value={brandData.value_props?.join(', ') || ""}
                      onChange={(e) => updateBrandData("value_props", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
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
                      value={brandData.tone?.voice_keywords?.join(', ') || ""}
                      onChange={(e) => updateBrandData("tone", { formality: "neutral", voice_keywords: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitors">Main Competitors *</Label>
                    <Textarea
                      id="competitors"
                      placeholder="e.g., Asana, Monday.com, Trello, Notion"
                      value={brandData.competitors?.join(', ') || ""}
                      onChange={(e) => updateBrandData("competitors", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prohibited">Prohibited Topics (Optional)</Label>
                    <Textarea
                      id="prohibited"
                      placeholder="e.g., Politics, controversial topics, competitor bashing"
                      value={brandData.prohibited?.join(', ') || ""}
                      onChange={(e) => updateBrandData("prohibited", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
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
                        {brandData.keywords?.map((keyword) => (
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
                        value={brandData.disclosure_template || ""}
                        onChange={(e) => updateBrandData("disclosure_template", e.target.value)}
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={nextStep} disabled={!canProceed() || isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? "Saving..." : currentStep === steps.length - 1 ? "Find Subreddits" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
