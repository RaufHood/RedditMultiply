import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    if (!slug || slug.length === 0) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
    }

    // Construct the file path
    let filePath = slug.join('/')
    if (!filePath.endsWith('.md')) {
      filePath += '.md'
    }

    // Build absolute path to the markdown file
    const docsDir = path.join(process.cwd(), 'app/knowledge-base-2/docs')
    const fullPath = path.join(docsDir, filePath)

    // Security check: ensure the path is within the docs directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedDocsDir = path.resolve(docsDir)
    
    if (!resolvedPath.startsWith(resolvedDocsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read and return file content
    const content = fs.readFileSync(resolvedPath, 'utf-8')
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error reading markdown file:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}