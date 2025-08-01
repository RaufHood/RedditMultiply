import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface DocFile {
  name: string
  path: string
  title: string
  type: 'file' | 'folder'
  children?: DocFile[]
}

function getMarkdownTitle(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const firstLine = lines[0]?.trim()
    
    // Extract title from first heading
    if (firstLine?.startsWith('# ')) {
      return firstLine.substring(2).trim()
    }
    
    // Fallback to filename
    const filename = path.basename(filePath, '.md')
    return filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  } catch {
    const filename = path.basename(filePath, '.md')
    return filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

function scanDirectory(dirPath: string, relativePath: string = ''): DocFile[] {
  const items: DocFile[] = []
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name
      
      // Skip hidden files and specific directories
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue
      }
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const children = scanDirectory(fullPath, itemRelativePath)
        if (children.length > 0) {
          items.push({
            name: entry.name,
            path: itemRelativePath,
            title: entry.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'folder',
            children
          })
        }
      } else if (entry.name.endsWith('.md')) {
        // Add markdown files
        const title = getMarkdownTitle(fullPath)
        items.push({
          name: entry.name,
          path: itemRelativePath.replace('.md', ''),
          title,
          type: 'file'
        })
      }
    }
  } catch (error) {
    console.error('Error scanning directory:', error)
  }
  
  return items.sort((a, b) => {
    // Sort folders first, then files, alphabetically
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

export async function GET() {
  try {
    const docsDir = path.join(process.cwd(), 'app/knowledge-base-2/docs')
    
    if (!fs.existsSync(docsDir)) {
      return NextResponse.json({ error: 'Docs directory not found' }, { status: 404 })
    }
    
    const fileTree = scanDirectory(docsDir)
    
    return NextResponse.json({
      success: true,
      files: fileTree,
      total: countFiles(fileTree)
    })
    
  } catch (error) {
    console.error('Error listing docs:', error)
    return NextResponse.json(
      { error: 'Failed to list documentation files' }, 
      { status: 500 }
    )
  }
}

function countFiles(items: DocFile[]): number {
  let count = 0
  for (const item of items) {
    if (item.type === 'file') {
      count++
    } else if (item.children) {
      count += countFiles(item.children)
    }
  }
  return count
}