'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUp, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  Lightbulb,
  Loader2
} from 'lucide-react'
// Removed framer-motion to avoid dependency issues

interface AICommandInputProps {
  onCommand: (command: string) => Promise<void>
  isProcessing?: boolean
  className?: string
}

const suggestedCommands = [
  {
    icon: TrendingUp,
    text: "Show me high priority competitor threats this week",
    category: "competitive"
  },
  {
    icon: Users,
    text: "What are customers saying about our pricing?",
    category: "sentiment"  
  },
  {
    icon: Lightbulb,
    text: "Find emerging market trends in our industry",
    category: "trends"
  },
  {
    icon: AlertTriangle,
    text: "Any urgent insights that need immediate attention?",
    category: "alerts"
  }
]

export function AICommandInput({ onCommand, isProcessing = false, className = "" }: AICommandInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight()
    }
  }, [input])

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return
    
    setShowSuggestions(false)
    await onCommand(input.trim())
    setInput('')
    
    // Reset height after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    onCommand(suggestion)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (e.target.value.length === 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* AI Command Input */}
      <Card className="p-4 shadow-lg border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="relative">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your market intelligence... 

Examples:
• Show competitor moves this month
• What sentiment trends should I know?
• Find insights related to pricing strategy"
                  className="min-h-[56px] max-h-[200px] resize-none border-0 bg-transparent focus:ring-0 focus:outline-none text-base placeholder:text-gray-500 px-0"
                  style={{ boxShadow: 'none' }}
                />
                
                {/* Send Button */}
                <div className="absolute bottom-2 right-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
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
                <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your knowledge base...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Suggested Commands */}
      {showSuggestions && !isProcessing && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            Quick insights you can ask for:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(command.text)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-start space-x-3">
                  <command.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 group-hover:text-gray-900">
                      {command.text}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {command.category}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}