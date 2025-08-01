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

function loadAllDocuments(): DocFile[] {
  const docsDir = path.join(process.cwd(), 'app/knowledge-base-2/docs')
  const documents: DocFile[] = []
  
  function scanDirectory(dirPath: string, relativePath: string = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name
        
        if (entry.name.startsWith('.')) continue
        
        if (entry.isDirectory()) {
          scanDirectory(fullPath, itemRelativePath)
        } else if (entry.name.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8')
            const title = getMarkdownTitle(content)
            
            documents.push({
              name: entry.name,
              path: itemRelativePath.replace('.md', ''),
              title: title,
              content: content
            })
          } catch (err) {
            console.error(`Error reading ${fullPath}:`, err)
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning ${dirPath}:`, err)
    }
  }
  
  scanDirectory(docsDir)
  return documents
}

function getMarkdownTitle(content: string): string {
  const lines = content.split('\n')
  const firstLine = lines[0]?.trim()
  
  if (firstLine?.startsWith('# ')) {
    return firstLine.substring(2).trim()
  }
  
  return 'Documentation'
}

function calculateDocumentRelevance(userInput: string, doc: DocFile): number {
  const lowerInput = userInput.toLowerCase()
  const docPath = doc.path.toLowerCase()
  const docTitle = doc.title.toLowerCase()
  const docContent = doc.content.toLowerCase()
  
  let score = 0
  
  // Split input into meaningful words
  const inputWords = lowerInput.split(/\s+/).filter(word => word.length > 2)
  
  // Path relevance (highest priority)
  if (docPath === lowerInput.replace(/\s+/g, '')) score += 100
  for (const word of inputWords) {
    if (docPath === word) score += 80
    if (docPath.includes(word)) score += 30
  }
  
  // Title relevance
  if (docTitle.includes(lowerInput)) score += 60
  for (const word of inputWords) {
    if (docTitle.includes(word)) score += 20
  }
  
  // Content relevance (TF-IDF style)
  const totalWords = docContent.split(/\s+/).length
  for (const word of inputWords) {
    const wordCount = (docContent.match(new RegExp(word, 'g')) || []).length
    const tf = wordCount / totalWords
    score += tf * 500 // Scale factor
  }
  
  // Semantic relevance for common technical terms
  const semanticPairs = [
    ['agent', ['llm', 'model', 'instruction', 'tool']],
    ['install', ['setup', 'pip', 'package', 'environment']],
    ['stream', ['realtime', 'live', 'websocket', 'event']],
    ['quick', ['start', 'begin', 'first', 'getting']],
    ['example', ['demo', 'tutorial', 'guide', 'sample']],
  ]
  
  for (const [primaryTerm, relatedTerms] of semanticPairs) {
    if (lowerInput.includes(primaryTerm)) {
      for (const related of relatedTerms) {
        if (docContent.includes(related)) {
          score += 15
        }
      }
    }
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
2. If relevant (score > 30), suggest how to update the document intelligently:
   - For numerical data: Update existing numbers rather than append
   - For new features: Add to appropriate existing sections
   - For missing information: Fill gaps in existing sections
   - For corrections: Replace old information with new information
   - For contradictory info: Note the conflict for user review

Respond in JSON format:
{
    "relevant": true/false,
    "confidence": 85,
    "action": "replace|add_after", 
    "section": "## Exact Section Name From Document",
    "reasoning": "Why this update makes sense and where it fits",
    "updated_content": "Full updated document content with changes intelligently applied"
}

If not relevant, respond: {"relevant": false, "confidence": 0}`
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
        max_tokens: 2000
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
    const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/)
    if (jsonObjectMatch && !jsonContent.startsWith('{')) {
      jsonContent = jsonObjectMatch[0]
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

    return {
      document: doc.path,
      section: analysis.section || '## Updates',
      action: analysis.action || 'add_after',
      content: userInput.trim(),
      confidence: Math.min(analysis.confidence, 90),
      reason: analysis.reasoning || `Relevant to ${doc.title}`,
      icon,
      color,
      title: doc.title,
      before_content: doc.content,
      after_content: analysis.updated_content || doc.content + `\n\n## Updates\n\n${userInput.trim()}`,
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
    
    // Load all documents
    const documents = loadAllDocuments()
    
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
    
    // STEP 1: Fast pre-filtering to get top candidates
    const scoredDocs = documents
      .map(doc => ({
        doc,
        score: calculateDocumentRelevance(input.trim(), doc)
      }))
      .filter(item => item.score > 5) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 candidates for LLM analysis
    
    console.log('Top candidates:', scoredDocs.map(item => `${item.doc.path}: ${item.score}`))
    
    // STEP 2: Use LLM to analyze top candidates
    const suggestions: Suggestion[] = []
    
    for (const { doc } of scoredDocs) {
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
      analyzed_documents: scoredDocs.length,
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