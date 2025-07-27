'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Brain, Sparkles, ArrowUp, Loader2 } from "lucide-react"

export default function KnowledgeBase2Page() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewText, setPreviewText] = useState('Your knowledge base insights will appear here...')

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return
    
    setIsProcessing(true)
    setPreviewText('Processing your request...')
    
    // Simulate processing
    setTimeout(() => {
      setPreviewText(`Updated knowledge base preview: "${input.trim()}"`)
      setInput('')
      setIsProcessing(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <div className="flex-1">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Knowledge Base 2</h1>
                  <p className="text-gray-600">Clean interface for knowledge management</p>
                </div>
              </div>
            </div>

            {/* AI Input Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Update Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your knowledge base update or query here...

Examples:
• Add new market insight
• Update competitor information
• Record customer feedback"
                      className="min-h-[120px] resize-none pr-12"
                    />
                    
                    {/* Send Button */}
                    <div className="absolute bottom-3 right-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={!input.trim() || isProcessing}
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing your knowledge base update...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </div>
    </div>
  )
}