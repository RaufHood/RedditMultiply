'use client'

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Save, Edit3, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import path from "path"

interface MarkdownDocument {
  title: string
  content: string
  filePath: string
}

export default function DynamicDocPage() {
  const params = useParams()
  const router = useRouter()
  const slug = Array.isArray(params.slug) ? params.slug : [params.slug || '']
  
  const [document, setDocument] = useState<MarkdownDocument | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load markdown file content
  useEffect(() => {
    async function loadDocument() {
      setIsLoading(true)
      setError(null)
      
      try {
        // Construct file path from slug
        const filePath = slug.join('/') + (slug.join('/').endsWith('.md') ? '' : '.md')
        
        // Use Next.js API route to get file content
        const response = await fetch(`/api/docs/${filePath}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`)
        }
        
        let content = await response.text()
        
        // Check if there's a localStorage override for this document
        const storageKey = `kb2-doc-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
        const storedDoc = localStorage.getItem(storageKey)
        if (storedDoc) {
          try {
            const parsedDoc = JSON.parse(storedDoc)
            content = parsedDoc.content || content
          } catch (err) {
            console.error('Error parsing stored document:', err)
          }
        }
        
        // Extract title from first line if it's a heading, otherwise use filename
        const lines = content.split('\n')
        const firstLineTitle = lines[0]?.startsWith('# ') ? lines[0].substring(2) : null
        const filename = slug[slug.length - 1] || 'document'
        
        setDocument({
          title: firstLineTitle || filename.replace('.md', '').replace(/-/g, ' '),
          content,
          filePath
        })
      } catch (err) {
        console.error('Error loading document:', err)
        setError(err instanceof Error ? err.message : 'Failed to load document')
        
        // Fallback: create a basic document structure
        const filename = slug[slug.length - 1] || 'document'
        setDocument({
          title: filename.replace('.md', '').replace(/-/g, ' '),
          content: `# ${filename.replace('.md', '').replace(/-/g, ' ')}\n\nThis document is being loaded...`,
          filePath: slug.join('/') + '.md'
        })
      }
      
      setIsLoading(false)
    }

    loadDocument()
  }, [slug])

  const saveDocument = async () => {
    if (!document) return
    
    setIsSaving(true)
    try {
      // Save to localStorage for now (in real app, would save to backend)
      const storageKey = `kb2-doc-${document.filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
      localStorage.setItem(storageKey, JSON.stringify(document))
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error('Error saving document:', err)
    }
    setIsSaving(false)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
    saveDocument()
  }

  const handleContentSave = () => {
    setIsEditingContent(false)
    saveDocument()
  }

  const goBack = () => {
    router.push('/knowledge-base-2')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !document) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!document) return null

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header with navigation and save button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Button onClick={goBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="text-sm text-gray-600">
                  Knowledge Base 2 / {slug.join(' / ')}
                </div>
              </div>
              <Button 
                onClick={saveDocument}
                disabled={isSaving}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>

            {/* Document Content */}
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                {/* Editable Title */}
                <div className="mb-8">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={document.title}
                      onChange={(e) => setDocument({...document, title: e.target.value})}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                      className="text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-full resize-none"
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className="text-4xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 group flex items-center gap-2"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {document.title}
                      <Edit3 className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h1>
                  )}
                </div>

                {/* Editable Content */}
                <div className="prose prose-lg max-w-none">
                  {isEditingContent ? (
                    <textarea
                      value={document.content}
                      onChange={(e) => setDocument({...document, content: e.target.value})}
                      onBlur={handleContentSave}
                      className="w-full min-h-[500px] bg-transparent border-none outline-none resize-none text-gray-700 leading-relaxed font-mono text-sm"
                      style={{ lineHeight: '1.7' }}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-gray-50 rounded p-3 -m-3 min-h-[500px] whitespace-pre-wrap text-gray-700 leading-relaxed group"
                      onClick={() => setIsEditingContent(true)}
                      style={{ fontSize: '16px', lineHeight: '1.7' }}
                    >
                      {document.content}
                      <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Click to edit</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    File: {document.filePath} • Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}