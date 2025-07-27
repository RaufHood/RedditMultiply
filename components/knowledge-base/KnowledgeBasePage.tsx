'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { useKnowledgeStore, usePendingInsights } from "@/lib/stores/knowledgeStore"
import { Insight } from "@/lib/api"

import { CategoryNav } from "./CategoryNav"
import { SearchBar } from "./SearchBar"
import { CategoryView } from "./CategoryView"
import { InsightInputForm } from "./InsightInputForm"
import { ReviewQueue } from "./ReviewQueue"

import { 
  Brain, 
  Clock, 
  Plus, 
  FileText, 
  Download, 
  Upload, 
  BarChart3 
} from "lucide-react"

export function KnowledgeBasePage() {
  const { initializeData, getRecentInsights, exportData, importData } = useKnowledgeStore()
  const pendingInsights = usePendingInsights()
  
  const [showInputForm, setShowInputForm] = useState(false)
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null)
  const [activeTab, setActiveTab] = useState('browse')

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const handleAddInsight = () => {
    setEditingInsight(null)
    setShowInputForm(true)
  }

  const handleEditInsight = (insight: Insight) => {
    setEditingInsight(insight)
    setShowInputForm(true)
  }

  const handleExportData = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string
            importData(data)
            alert('Data imported successfully!')
          } catch (error) {
            alert('Failed to import data. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const recentInsights = getRecentInsights(5)

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                <p className="text-gray-600">Organize and explore business insights from Reddit</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddInsight} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Insight</span>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Insights</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {recentInsights.length > 0 ? '12+' : '0'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Pending Review</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {pendingInsights.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {recentInsights.filter(i => i.priority === 'high').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">AI Processed</span>
              </div>
              <p className="text-2xl font-bold mt-1">85%</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Browse Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending Review</span>
              {pendingInsights.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingInsights.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <CategoryNav />
            <SearchBar />
            <CategoryView 
              onAddInsight={handleAddInsight}
              onEditInsight={handleEditInsight}
            />
          </TabsContent>

          <TabsContent value="review">
            <ReviewQueue />
          </TabsContent>
        </Tabs>

            {/* Input Form Dialog */}
            <InsightInputForm
              isOpen={showInputForm}
              onClose={() => {
                setShowInputForm(false)
                setEditingInsight(null)
              }}
              editingInsight={editingInsight}
            />
          </div>
        </div>
      </div>
    </div>
  )
}