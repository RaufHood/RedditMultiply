# Knowledge Base Implementation Guide

## Overview

The Knowledge Base feature is an AI-powered documentation editor that allows users to input natural language requests and get intelligent suggestions for updating documentation. It uses OpenAI's GPT models to analyze user input and suggest relevant changes to specific documentation files.

## Architecture Overview

```
User Input → LLM Scoring → Document Analysis → Suggestion Generation → UI Display → localStorage Persistence
```

## Core Components

### 1. Frontend Interface (`/app/knowledge-base-2/page.tsx`)

**Main Component**: `KnowledgeBase2Page`

The primary user interface includes:
- **Input textarea** for user queries
- **Suggestion cards** displaying AI recommendations
- **Code comparison** view showing before/after changes
- **Accept/Reject** buttons for suggestions

**Key Functions:**

```typescript
// Handles user input submission
const handleSubmit = async () => {
  // Calls the smart suggestion API with user input and localStorage data
  const response = await fetch('/api/docs/suggest-smart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      input: input.trim(),
      storage: getAllStorageData() // Passes current localStorage state
    })
  })
}

// Saves accepted suggestions to localStorage
const acceptSuggestion = () => {
  const filePath = (selectedSuggestion.file_path || selectedSuggestion.document) + '.md'
  const storageKey = `kb2-doc-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
  const documentData = {
    title: selectedSuggestion.title,
    content: selectedSuggestion.after_content,
    filePath: filePath
  }
  localStorage.setItem(storageKey, JSON.stringify(documentData))
}
```

### 2. Backend API (`/app/api/docs/suggest-smart/route.ts`)

**Main Function**: `POST` request handler

The API processes user input through a two-stage approach:

### Stage 1: Document Scoring

**Function**: `scoreDocumentsWithLLM(userInput, docs)`

```typescript
// LLM Prompt for document scoring
const prompt = `You are a documentation assistant. Score each document's relevance to the user's query on a scale of 0-100.

Available documents:
sessions: Sessions - Session memory and conversation history management
agents: Agents - Creating and configuring AI agents with instructions
tools: Tools - Function calling and tool integration
...

Return ONLY a JSON object with document paths as keys and scores as values:
{"sessions": 85, "agents": 20, "tools": 5}`
```

This stage:
1. **Sends all 24 document summaries** to the LLM in one call
2. **Gets relevance scores** for each document (0-100)
3. **Filters documents** with score > 20
4. **Returns top 3** most relevant documents

### Stage 2: Individual Document Analysis

**Function**: `analyzeDocumentWithLLM(userInput, doc, llmScore)`

```typescript
// LLM Prompt for document analysis
const prompt = `You are an expert documentation editor. Analyze if the user input is relevant to the given document and suggest intelligent updates.

Your task:
1. Determine if the user input is relevant to this document (relevance score 0-100)
2. If relevant (score > 30), identify WHERE to add the new information

Document: ${doc.title}
Path: ${doc.path}
Current Content: ${doc.content}
User Input: ${userInput}

Respond in JSON format ONLY:
{
    "relevant": true,
    "confidence": 85,
    "action": "add_after", 
    "section": "## Memory operations",
    "reasoning": "Brief explanation",
    "new_content": "ONLY the new content to add, not the full document"
}`
```

This stage:
1. **Analyzes each top document** individually
2. **Determines exact section** to modify (e.g., "## Memory operations")
3. **Generates new content** to add
4. **Creates updated document** with intelligent placement

### 3. Document Storage System

**Core Concept**: Hybrid approach using markdown files + localStorage

#### Base Documents (`MAIN_DOCS` array)

```typescript
const MAIN_DOCS = [
  { path: 'sessions', title: 'Sessions', description: 'Session memory and conversation history management' },
  { path: 'agents', title: 'Agents', description: 'Creating and configuring AI agents with instructions' },
  { path: 'tools', title: 'Tools', description: 'Function calling and tool integration' },
  // ... 24 total documents
]
```

#### Document Loading (`loadMainDocuments()`)

```typescript
function loadMainDocuments(storage?: Record<string, string>): DocFile[] {
  for (const doc of MAIN_DOCS) {
    let content = fs.readFileSync(filePath, 'utf-8') // Read from markdown file
    
    // Check if there's a localStorage override
    if (storage) {
      const storageKey = `kb2-doc-${doc.path.replace(/[^a-zA-Z0-9]/g, '-')}`
      if (storage[storageKey]) {
        const storedDoc = JSON.parse(storage[storageKey])
        content = storedDoc.content || content // Use localStorage version
      }
    }
  }
}
```

**Priority**: localStorage content > Original markdown files

### 4. Document Display (`/app/knowledge-base-2/docs/[...slug]/page.tsx`)

**Component**: `DynamicDocPage`

This handles individual document viewing and editing:

```typescript
// Load document with localStorage override
useEffect(() => {
  const response = await fetch(`/api/docs/${filePath}`)
  let content = await response.text()
  
  // Check localStorage for user edits
  const storageKey = `kb2-doc-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
  const storedDoc = localStorage.getItem(storageKey)
  if (storedDoc) {
    const parsedDoc = JSON.parse(storedDoc)
    content = parsedDoc.content || content // Use localStorage version
  }
}, [slug])

// Save edits to localStorage
const saveDocument = async () => {
  const storageKey = `kb2-doc-${document.filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
  localStorage.setItem(storageKey, JSON.stringify(document))
}
```

## Data Flow

### 1. User Makes Query

**Example**: "In addition to session memory, with the notion integration you can export the conversation to notion with the .to_notion method"

### 2. Document Scoring (1 LLM Call)

```
Input: User query + 24 document summaries
Output: { "sessions": 90, "agents": 20, "tools": 15 }
Result: Top 3 candidates → ["sessions", "agents", "tools"]
```

### 3. Document Analysis (3 LLM Calls)

**For each top candidate:**

```
Input: User query + Full document content
Output: {
  "relevant": true,
  "confidence": 85,
  "action": "add_after",
  "section": "## Memory operations", 
  "new_content": "### Notion Integration\n\nYou can export session conversations to Notion using the `.to_notion()` method:\n\n```python\nresult = session.to_notion(\"Notion_Page_ID\")\n```"
}
```

### 4. Suggestion Generation

The system creates a `Suggestion` object:

```typescript
interface Suggestion {
  document: string          // "sessions"
  section: string          // "## Memory operations"
  action: 'add_after'      // Where to place content
  content: string          // Original user input
  confidence: number       // 90 (from scoring stage)
  reason: string          // LLM reasoning
  title: string           // "Sessions"
  before_content: string  // Original document
  after_content: string   // Document with new content added
  file_path: string       // "sessions"
}
```

### 5. UI Display & Code Comparison

The frontend shows:
- **Suggestion cards** with confidence percentages
- **Before/after comparison** using `CodeComparison` component
- **Accept/Reject buttons**

### 6. Persistence (localStorage)

When user accepts a suggestion:

```typescript
const storageKey = `kb2-doc-sessions-md`  // Consistent format
const documentData = {
  title: "Sessions",
  content: suggestion.after_content,       // Updated content
  filePath: "sessions.md"
}
localStorage.setItem(storageKey, JSON.stringify(documentData))
```

## Storage Key Format

**Critical Detail**: All localStorage operations use the same key format:

```
kb2-doc-{path-with-dashes}-md
```

Examples:
- `sessions.md` → `kb2-doc-sessions-md`
- `voice/quickstart.md` → `kb2-doc-voice-quickstart-md`
- `models/litellm.md` → `kb2-doc-models-litellm-md`

## Agent SDK Integration

The knowledge base documents **Agent SDK functionality**, including:

### Core Agent Concepts
- **Sessions** (`sessions.md`): Memory and conversation history
- **Agents** (`agents.md`): Creating and configuring AI agents
- **Tools** (`tools.md`): Function calling and integrations
- **Running Agents** (`running_agents.md`): Execution and management

### Advanced Features
- **Multi-Agent** (`multi_agent.md`): Multi-agent systems
- **Handoffs** (`handoffs.md`): Agent-to-agent collaboration
- **Streaming** (`streaming.md`): Real-time responses
- **Voice** (`voice/quickstart.md`): Voice input/output

### Development Tools
- **Tracing** (`tracing.md`): Debugging and monitoring
- **Visualization** (`visualization.md`): Execution monitoring
- **REPL** (`repl.md`): Interactive development

## Vercel Deployment Strategy

**Challenge**: Vercel has a read-only filesystem - can't write to markdown files.

**Solution**: localStorage-first approach
- ✅ **Base content**: Markdown files (read-only, part of deployment)
- ✅ **User edits**: localStorage (browser-persistent)
- ✅ **Suggestions**: localStorage (browser-persistent)
- ✅ **Loading priority**: localStorage > Markdown files

## Key Benefits

1. **No Backend Database Required**: Perfect for Vercel deployment
2. **Real-time Changes**: Immediate persistence and loading
3. **Intelligent Suggestions**: Context-aware document updates
4. **Section-Aware**: Places content in appropriate sections
5. **Code Comparison**: Visual before/after preview
6. **Development Friendly**: Easy to reset by clearing localStorage

## Performance Characteristics

- **Initial Query**: ~4-18 seconds (4 LLM calls total)
- **Document Loading**: ~50-200ms (localStorage + file read)
- **Suggestion Display**: Immediate (already processed)
- **Accept Changes**: <100ms (localStorage write)

## Error Handling

The system includes robust error handling:
- **LLM API failures**: Fallback to keyword matching
- **JSON parsing errors**: Graceful degradation with null returns
- **Missing documents**: Skip and continue processing
- **localStorage errors**: Fall back to original content

This implementation provides a complete AI-powered documentation editing experience while remaining deployable on serverless platforms like Vercel.