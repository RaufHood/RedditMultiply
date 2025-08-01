'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Folder, FolderOpen, Search, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"

interface DocFile {
  name: string
  path: string
  title: string
  type: 'file' | 'folder'
  children?: DocFile[]
}

interface DocBrowserProps {
  onFileSelect?: (file: DocFile) => void
}

export function DocBrowser({ onFileSelect }: DocBrowserProps) {
  const [files, setFiles] = useState<DocFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['']))
  const [totalFiles, setTotalFiles] = useState(0)

  useEffect(() => {
    loadFileTree()
  }, [])

  const loadFileTree = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/docs/list')
      
      if (!response.ok) {
        throw new Error('Failed to load documentation files')
      }
      
      const data = await response.json()
      setFiles(data.files || [])
      setTotalFiles(data.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error loading file tree:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const filterFiles = (items: DocFile[], query: string): DocFile[] => {
    if (!query.trim()) return items

    const filtered: DocFile[] = []
    
    for (const item of items) {
      if (item.type === 'file') {
        if (item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.path.toLowerCase().includes(query.toLowerCase())) {
          filtered.push(item)
        }
      } else if (item.children) {
        const filteredChildren = filterFiles(item.children, query)
        if (filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren
          })
        }
      }
    }
    
    return filtered
  }

  const renderFileTree = (items: DocFile[], level: number = 0) => {
    const filteredItems = filterFiles(items, searchQuery)

    return filteredItems.map((item) => (
      <div key={item.path} style={{ marginLeft: `${level * 16}px` }}>
        {item.type === 'folder' ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFolder(item.path)}
              className="w-full justify-start text-left h-8 mb-1"
            >
              {expandedFolders.has(item.path) ? (
                <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-gray-600" />
              )}
              <span className="text-sm font-medium">{item.title}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {item.children?.length || 0}
              </Badge>
            </Button>
            {expandedFolders.has(item.path) && item.children && (
              <div className="ml-2">
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <Link href={`/knowledge-base-2/docs/${item.path}`}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-8 mb-1 hover:bg-blue-50"
              onClick={() => onFileSelect?.(item)}
            >
              <FileText className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm truncate">{item.title}</span>
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </Button>
          </Link>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading documentation...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation Browser
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadFileTree} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Documentation Browser
          <Badge variant="outline" className="ml-auto">
            {totalFiles} files
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documentation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* File Tree */}
        <div className="max-h-96 overflow-y-auto space-y-1">
          {files.length > 0 ? (
            renderFileTree(files)
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documentation files found</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Access</h4>
          <div className="flex flex-wrap gap-2">
            <Link href="/knowledge-base-2/docs/index">
              <Button variant="outline" size="sm" className="text-xs">
                Getting Started
              </Button>
            </Link>
            <Link href="/knowledge-base-2/docs/agents">
              <Button variant="outline" size="sm" className="text-xs">
                Agents
              </Button>
            </Link>
            <Link href="/knowledge-base-2/docs/quickstart">
              <Button variant="outline" size="sm" className="text-xs">
                Quickstart
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}