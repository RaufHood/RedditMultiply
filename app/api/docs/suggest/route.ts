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

function getMarkdownTitle(content: string): string {
  const lines = content.split('\n')
  const firstLine = lines[0]?.trim()
  
  if (firstLine?.startsWith('# ')) {
    return firstLine.substring(2).trim()
  }
  
  return 'Documentation'
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

function analyzeInputForDocuments(userInput: string, documents: DocFile[]): Suggestion[] {
  const lowerInput = userInput.toLowerCase()
  
  // STEP 1: Smart pre-filtering to find top 5 most relevant documents
  // This avoids calling LLM on all 100 files
  const candidateDocs = documents
    .map(doc => {
      let score = 0
      const docPath = doc.path.toLowerCase()
      const docTitle = doc.title.toLowerCase()
      const docContent = doc.content.toLowerCase().slice(0, 1000) // First 1000 chars for speed
      
      // Direct matches get highest priority
      if (docPath.includes(lowerInput) || docTitle.includes(lowerInput)) {
        score += 100
      }
      
      // Keyword relevance
      const inputWords = lowerInput.split(/\s+/).filter(word => word.length > 3)
      for (const word of inputWords) {
        if (docPath.includes(word)) score += 30
        if (docTitle.includes(word)) score += 20
        if (docContent.includes(word)) score += 5
      }
      
      // Path-based relevance (agents/streaming -> high score for "streaming agents")
      const pathSegments = docPath.split('/')
      const relevantSegments = pathSegments.filter(segment => 
        inputWords.some(word => segment.includes(word))
      )
      score += relevantSegments.length * 15
      
      return { doc, score }
    })
    .filter(item => item.score > 10) // Only consider docs with some relevance
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 candidates
  
  // STEP 2: For time pressure, use smart pattern-based updates instead of LLM
  // This gives you intelligent updates without the LLM cost/latency
  const suggestions: Suggestion[] = []
  
  for (const { doc, score } of candidateDocs) {
    const suggestion = createSmartSuggestion(userInput, doc, score)
    if (suggestion) {
      suggestions.push(suggestion)
    }
  }
  
  return suggestions.slice(0, 3) // Return top 3
}

function createSmartSuggestion(userInput: string, doc: DocFile, relevanceScore: number): Suggestion | null {
  const lowerInput = userInput.toLowerCase()
  
  // Detect update type and create appropriate suggestion
  let updateType: 'replace' | 'add_after' = 'add_after'
  let targetSection = '## Updates'
  let smartContent = userInput.trim()
  let reason = `Content relevance to ${doc.title}`
  
  // Find existing sections in the document
  const sections = doc.content.match(/^##\s+.+$/gm) || []
  
  // Debug: log sections for first few docs to understand structure
  if (relevanceScore > 50) {
    console.log(`Document: ${doc.path}`)
    console.log(`Sections found:`, sections.slice(0, 5)) // First 5 sections
    console.log(`---`)
  }
  
  // SMART UPDATE LOGIC
  
  // 1. Number updates (e.g., "supports 35 models" vs "supports 30 models")
  const numberMatch = userInput.match(/(\d+)/g)
  const existingNumbers = doc.content.match(/(\d+)/g)
  
  if (numberMatch && existingNumbers) {
    // Look for numerical updates in the same context
    const contextWords = lowerInput.split(/\s+/).filter(word => word.length > 3)
    const docLines = doc.content.split('\n')
    
    for (const line of docLines) {
      const lineHasNumbers = /\d+/.test(line)
      const lineHasContext = contextWords.some(word => line.toLowerCase().includes(word))
      
      if (lineHasNumbers && lineHasContext) {
        updateType = 'replace'
        reason = `Updating numerical data: detected potential number update`
        // Find the section this line belongs to
        const lineIndex = docLines.indexOf(line)
        for (let i = lineIndex; i >= 0; i--) {
          if (docLines[i].startsWith('##')) {
            targetSection = docLines[i]
            break
          }
        }
        break
      }
    }
  }
  
  // 2. Feature additions (streaming, new functionality)
  if (lowerInput.includes('add') || lowerInput.includes('support') || lowerInput.includes('new')) {
    // Look for more specific sections first
    let bestSection = null
    
    // Check for streaming-related sections
    if (lowerInput.includes('stream')) {
      bestSection = sections.find(s => 
        s.toLowerCase().includes('stream') || 
        s.toLowerCase().includes('realtime') ||
        s.toLowerCase().includes('response')
      )
    }
    
    // Check for agent-related sections
    if (!bestSection && lowerInput.includes('agent')) {
      bestSection = sections.find(s => 
        s.toLowerCase().includes('agent') || 
        s.toLowerCase().includes('configuration') ||
        s.toLowerCase().includes('basic') ||
        s.toLowerCase().includes('usage')
      )
    }
    
    // Fallback to general feature sections
    if (!bestSection) {
      bestSection = sections.find(s => 
        s.toLowerCase().includes('feature') || 
        s.toLowerCase().includes('function') || 
        s.toLowerCase().includes('api') ||
        s.toLowerCase().includes('example') ||
        s.toLowerCase().includes('usage') ||
        s.toLowerCase().includes('method')
      )
    }
    
    if (bestSection) {
      targetSection = bestSection
      reason = `Adding new feature information to existing ${bestSection}`
    } else if (sections.length > 0) {
      // Use the second section if available (skip main title)
      targetSection = sections.length > 1 ? sections[1]! : sections[0]!
      reason = `Adding to ${targetSection} section`
    }
  }
  
  // 3. Installation/setup updates
  if (lowerInput.includes('install') || lowerInput.includes('setup') || lowerInput.includes('step')) {
    const setupSections = sections.filter(s => 
      s.toLowerCase().includes('install') || 
      s.toLowerCase().includes('setup') || 
      s.toLowerCase().includes('start') ||
      s.toLowerCase().includes('quick')
    )
    if (setupSections.length > 0) {
      targetSection = setupSections[0]
      reason = `Updating installation/setup information`
    }
  }
  
  // 4. Missing content
  if (lowerInput.includes('missing') || lowerInput.includes('need') || lowerInput.includes('lack')) {
    updateType = 'add_after'
    smartContent = `### Missing Information\n\n${userInput.trim()}`
    reason = `Adding missing information identified by user`
  }
  
  // Choose appropriate icon and color based on document type
  let icon = 'FileText'
  let color = 'text-blue-600'
  
  if (doc.path.includes('agent')) { icon = 'Brain'; color = 'text-blue-600' }
  else if (doc.path.includes('quick') || doc.path.includes('start')) { icon = 'Zap'; color = 'text-yellow-600' }
  else if (doc.path.includes('example')) { icon = 'BookOpen'; color = 'text-green-600' }
  else if (doc.path.includes('voice') || doc.path.includes('audio')) { icon = 'Mic'; color = 'text-pink-600' }
  else if (doc.path.includes('stream') || doc.path.includes('realtime')) { icon = 'Radio'; color = 'text-purple-600' }
  else if (doc.path.includes('trace') || doc.path.includes('debug')) { icon = 'Search'; color = 'text-red-600' }
  
  // Format content appropriately for the target section
  if (updateType === 'add_after' && targetSection !== '## Updates') {
    // If we found a real section, format content to fit within it
    smartContent = `\n\n${userInput.trim()}`
  } else if (targetSection === '## Updates') {
    // If falling back to Updates section, format as a proper update
    smartContent = `\n\n## Updates\n\n### ${new Date().toLocaleDateString()}\n\n${userInput.trim()}`
  }
  
  // Create updated content
  const updatedContent = updateType === 'replace' 
    ? replaceSmartContent(doc.content, userInput, targetSection)
    : doc.content + smartContent
  
  // Calculate more realistic confidence based on multiple factors
  let confidence = relevanceScore
  
  // Boost confidence for exact matches
  if (doc.path.toLowerCase().includes(lowerInput) || doc.title.toLowerCase().includes(lowerInput)) {
    confidence += 20
  }
  
  // Boost for finding appropriate sections
  if (targetSection !== '## Updates') {
    confidence += 15
  }
  
  // Boost for replace operations (more precise)
  if (updateType === 'replace') {
    confidence += 10
  }
  
  // Cap confidence at reasonable levels
  confidence = Math.min(confidence, 85) // Max 85% to avoid overconfidence
  confidence = Math.max(confidence, 25) // Min 25% to avoid too low scores
  
  return {
    document: doc.path,
    section: targetSection,
    action: updateType,
    content: smartContent,
    confidence,
    reason,
    icon,
    color,
    title: doc.title,
    before_content: doc.content,
    after_content: updatedContent,
    file_path: doc.path
  }
}

function replaceSmartContent(originalContent: string, userInput: string, targetSection: string): string {
  // For replace operations, try to find and update existing content intelligently
  // This is a simplified version - in a real LLM implementation, this would be much smarter
  
  const lines = originalContent.split('\n')
  const userNumbers = userInput.match(/\d+/g) || []
  
  if (userNumbers.length > 0) {
    // Try to replace numbers in the target section
    let inTargetSection = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      if (line.startsWith('##')) {
        inTargetSection = line === targetSection
        continue
      }
      
      if (inTargetSection && /\d+/.test(line)) {
        // Simple replacement logic - replace the first number found
        const existingNumber = line.match(/\d+/)?.[0]
        const newNumber = userNumbers[0]
        
        if (existingNumber && newNumber) {
          lines[i] = line.replace(existingNumber, newNumber)
          lines.splice(i + 1, 0, `\n*Updated: ${new Date().toLocaleDateString()}*`)
          break
        }
      }
    }
  }
  
  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, storage } = body
    
    if (!input?.trim()) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 })
    }
    
    // Load all documentation files
    const documents = loadAllDocuments()
    
    if (documents.length === 0) {
      return NextResponse.json({ error: 'No documentation files found' }, { status: 404 })
    }
    
    // If storage is provided, update document contents with user's current edits
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
    
    // Analyze input and generate suggestions
    const suggestions = analyzeInputForDocuments(input.trim(), documents)
    
    return NextResponse.json({
      success: true,
      suggestions,
      analyzed_documents: documents.length
    })
    
  } catch (error) {
    console.error('Error generating document suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' }, 
      { status: 500 }
    )
  }
}