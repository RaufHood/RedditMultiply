import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface DocFile {
  name: string
  path: string
  title: string
  content: string
}

interface Suggestion {
  document: string
  section: string
  action: 'add_after' | 'replace'
  content: string
  confidence: number
  reason: string
  icon: string
  color: string
  title: string
  before_content: string
  after_content: string
  file_path: string
}

// Simple main documents with one-liner descriptions
const MAIN_DOCS = [
  // Core functionality
  { path: 'sessions', title: 'Sessions', description: 'Session memory and conversation history management' },
  { path: 'agents', title: 'Agents', description: 'Creating and configuring AI agents with instructions' },
  { path: 'tools', title: 'Tools', description: 'Function calling and tool integration' },
  { path: 'streaming', title: 'Streaming', description: 'Real-time streaming responses and events' },
  { path: 'results', title: 'Results', description: 'Agent execution results and output handling' },
  { path: 'running_agents', title: 'Running Agents', description: 'Executing and managing agent runs' },
  
  // Getting started
  { path: 'index', title: 'Overview', description: 'Main documentation overview and introduction' },
  { path: 'quickstart', title: 'Quick Start', description: 'Getting started tutorial and basic examples' },
  { path: 'examples', title: 'Examples', description: 'Code examples and tutorials' },
  
  // Advanced features
  { path: 'tracing', title: 'Tracing', description: 'Debugging and monitoring agent execution' },
  { path: 'voice/quickstart', title: 'Voice', description: 'Voice input/output and audio processing' },
  { path: 'voice/pipeline', title: 'Voice Pipeline', description: 'Voice processing pipeline configuration' },
  { path: 'realtime/quickstart', title: 'Realtime', description: 'Real-time conversation and WebSocket integration' },
  { path: 'realtime/guide', title: 'Realtime Guide', description: 'Comprehensive real-time integration guide' },
  { path: 'multi_agent', title: 'Multi-Agent', description: 'Multi-agent systems and handoffs' },
  { path: 'handoffs', title: 'Handoffs', description: 'Agent-to-agent handoffs and collaboration' },
  { path: 'visualization', title: 'Visualization', description: 'Agent execution visualization and monitoring' },
  
  // Configuration
  { path: 'models/index', title: 'Models', description: 'Language models and provider configuration' },
  { path: 'models/litellm', title: 'LiteLLM', description: 'LiteLLM integration and configuration' },
  { path: 'config', title: 'Configuration', description: 'Agent and system configuration options' },
  { path: 'context', title: 'Context', description: 'Context management and variable handling' },
  { path: 'guardrails', title: 'Guardrails', description: 'Safety controls and content filtering' },
  { path: 'mcp', title: 'MCP', description: 'Model Context Protocol integration' },
  
  // Development tools
  { path: 'repl', title: 'REPL', description: 'Interactive development and testing environment' },
  { path: 'release', title: 'Release Notes', description: 'Version history and release information' },
  
  // Voice features (comprehensive)
  { path: 'voice/tracing', title: 'Voice Tracing', description: 'Debugging and monitoring voice interactions' },
]

function loadMainDocuments(): DocFile[] {
  const docsDir = path.join(process.cwd(), 'app/knowledge-base-2/docs')
  const documents: DocFile[] = []
  
  for (const doc of MAIN_DOCS) {
    try {
      const filePath = path.join(docsDir, `${doc.path}.md`)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        documents.push({
          name: path.basename(doc.path) + '.md',
          path: doc.path,
          title: doc.title,
          content: content
        })
      }
    } catch (err) {
      console.error(`Error reading ${doc.path}:`, err)
    }
  }
  
  return documents
}


async function scoreDocumentsWithLLM(userInput: string, docs: DocFile[]): Promise<Array<{doc: DocFile, score: number}>> {
  try {
    // Create a summary of each document for the LLM
    const docSummaries = docs.map(doc => {
      const description = MAIN_DOCS.find(d => d.path === doc.path)?.description || 'Documentation file'
      return `${doc.path}: ${doc.title} - ${description}`
    }).join('\n')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: `You are a documentation assistant. Score each document's relevance to the user's query on a scale of 0-100.

Available documents:
${docSummaries}

Return ONLY a JSON object with document paths as keys and scores as values:
{"sessions": 85, "agents": 20, "tools": 5}`
        }, {
          role: 'user',
          content: `User query: "${userInput}"`
        }],
        temperature: 0.1,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse scores
    let scores: Record<string, number>
    try {
      scores = JSON.parse(content)
    } catch {
      // Fallback to simple keyword matching if LLM fails
      return docs.map(doc => ({
        doc,
        score: simpleKeywordScore(userInput, doc)
      }))
    }

    // Convert to array with doc objects
    return docs.map(doc => ({
      doc,
      score: scores[doc.path] || 0
    })).sort((a, b) => b.score - a.score)

  } catch (error) {
    console.error('Error scoring documents with LLM:', error)
    // Fallback to simple keyword matching
    return docs.map(doc => ({
      doc,
      score: simpleKeywordScore(userInput, doc)
    })).sort((a, b) => b.score - a.score)
  }
}

function simpleKeywordScore(userInput: string, doc: DocFile): number {
  const input = userInput.toLowerCase()
  const title = doc.title.toLowerCase()
  const path = doc.path.toLowerCase()
  
  let score = 0
  
  // Exact title match
  if (title === input) score += 100
  if (path === input) score += 100
  
  // Title contains input
  if (title.includes(input)) score += 50
  if (path.includes(input)) score += 50
  
  // Word matching
  const words = input.split(/\s+/).filter(w => w.length > 2)
  for (const word of words) {
    if (title.includes(word)) score += 20
    if (path.includes(word)) score += 20
  }
  
  return score
}

async function analyzeDocumentWithLLM(userInput: string, doc: DocFile): Promise<Suggestion | null> {
  try {
    // Use OpenAI to intelligently analyze the document
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert documentation editor. Analyze if the user input is relevant to the given document and suggest intelligent updates.

Your task:
1. Determine if the user input is relevant to this document (relevance score 0-100)
2. If relevant (score > 30), identify WHERE to add the new information

IMPORTANT: Only provide the NEW content to add, NOT the entire document.

Respond in JSON format ONLY:
{
    "relevant": true,
    "confidence": 85,
    "action": "add_after", 
    "section": "## Memory operations",
    "reasoning": "Brief explanation",
    "new_content": "ONLY the new content to add, not the full document"
}

If not relevant: {"relevant": false, "confidence": 0}`
          },
          {
            role: 'user',
            content: `Document: ${doc.title}
Path: ${doc.path}

Current Content:
${doc.content}

User Input: ${userInput}

Analyze relevance and suggest intelligent updates.`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Extract JSON from response, handling cases where model adds extra text
    let jsonContent = content.trim()
    
    // Look for JSON block if wrapped in markdown
    const jsonMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1]
    }
    
    // Try to find JSON object if it's embedded in text
    const jsonObjectMatch = jsonContent.match(/\{[\s\S]*?\}(?=\s*$|\s*```|$)/)
    if (jsonObjectMatch && !jsonContent.startsWith('{')) {
      jsonContent = jsonObjectMatch[0]
    }
    
    // Handle incomplete JSON by trying to complete it
    if (jsonContent.includes('"reasoning"') && !jsonContent.trim().endsWith('}')) {
      // Find the last complete quote and close the JSON
      const lastQuoteIndex = jsonContent.lastIndexOf('"')
      if (lastQuoteIndex > -1) {
        const beforeLastQuote = jsonContent.substring(0, lastQuoteIndex + 1)
        if (!beforeLastQuote.endsWith('"}')) {
          jsonContent = beforeLastQuote + '}'
        }
      }
    }

    let analysis
    try {
      analysis = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', {
        original: content,
        extracted: jsonContent,
        error: parseError
      })
      // Return null for unparseable responses instead of crashing
      return null
    }
    
    if (!analysis.relevant || analysis.confidence < 30) {
      return null
    }

    // Determine icon and color based on document path/type
    let icon = 'FileText'
    let color = 'text-blue-600'
    
    if (doc.path.includes('agent')) { icon = 'Brain'; color = 'text-blue-600' }
    else if (doc.path.includes('quick') || doc.path.includes('start')) { icon = 'Zap'; color = 'text-yellow-600' }
    else if (doc.path.includes('example')) { icon = 'BookOpen'; color = 'text-green-600' }
    else if (doc.path.includes('voice') || doc.path.includes('audio')) { icon = 'Mic'; color = 'text-pink-600' }
    else if (doc.path.includes('stream') || doc.path.includes('realtime')) { icon = 'Radio'; color = 'text-purple-600' }
    else if (doc.path.includes('trace') || doc.path.includes('debug')) { icon = 'Search'; color = 'text-red-600' }

    // Create the updated content by intelligently inserting the new content
    let updatedContent = doc.content
    const newContent = analysis.new_content || userInput.trim()
    const targetSection = analysis.section || '## Updates'
    
    if (analysis.action === 'add_after' && targetSection) {
      // Find the target section and add content after it
      const sectionRegex = new RegExp(`(${targetSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?)(?=\n## |\n# |$)`, 's')
      const match = updatedContent.match(sectionRegex)
      
      if (match) {
        const sectionContent = match[1]
        const replacement = sectionContent + '\n\n' + newContent
        updatedContent = updatedContent.replace(sectionRegex, replacement)
      } else {
        // Section not found, append at the end
        updatedContent = updatedContent + `\n\n${targetSection}\n\n${newContent}`
      }
    } else {
      // Default: append at the end
      updatedContent = updatedContent + `\n\n## Updates\n\n${newContent}`
    }

    return {
      document: doc.path,
      section: targetSection,
      action: analysis.action || 'add_after',
      content: userInput.trim(),
      confidence: Math.min(analysis.confidence, 90),
      reason: analysis.reasoning || `Relevant to ${doc.title}`,
      icon,
      color,
      title: doc.title,
      before_content: doc.content,
      after_content: updatedContent,
      file_path: doc.path
    }

  } catch (error) {
    console.error(`Error analyzing document ${doc.path}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, storage } = body
    
    if (!input?.trim()) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }
    
    // Load main documents only
    const documents = loadMainDocuments()
    
    if (documents.length === 0) {
      return NextResponse.json({ error: 'No documentation files found' }, { status: 404 })
    }
    
    // Update document contents with user's current edits from storage
    if (storage) {
      for (const doc of documents) {
        const storageKey = `kb2-doc-${doc.path.replace(/[^a-zA-Z0-9]/g, '-')}`
        if (storage[storageKey]) {
          try {
            const storedDoc = JSON.parse(storage[storageKey])
            if (storedDoc.content) {
              doc.content = storedDoc.content
            }
          } catch (err) {
            // Ignore parsing errors
          }
        }
      }
    }
    
    console.log('Loaded documents:', documents.map(d => d.path))
    
    // STEP 1: Use LLM to score all main documents
    const scoredDocs = await scoreDocumentsWithLLM(input.trim(), documents)
    const topCandidates = scoredDocs
      .filter(item => item.score > 20) // Minimum relevance threshold
      .slice(0, 3) // Top 3 candidates
    
    console.log('NEW Top candidates:', topCandidates.map(item => `${item.doc.path}: ${item.score}`))
    
    // STEP 2: Generate suggestions for top candidates
    const suggestions: Suggestion[] = []
    
    for (const { doc } of topCandidates) {
      const suggestion = await analyzeDocumentWithLLM(input.trim(), doc)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    }
    
    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence)
    
    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 3),
      analyzed_documents: topCandidates.length,
      total_documents: documents.length
    })
    
  } catch (error) {
    console.error('Error generating document suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' }, 
      { status: 500 }
    )
  }
}