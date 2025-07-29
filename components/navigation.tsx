"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  MessageSquare,
  Search,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Brain,
  Target,
  Heart,
  TrendingUp,
  ChevronDown,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
  subpages?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Discovery",
    href: "/discovery",
    icon: Search,
    description: "Find subreddits",
  },
  {
    title: "Mentions",
    href: "/dashboard",
    icon: MessageSquare,
    badge: "12",
    description: "New mentions to review",
  },
  {
    title: "Knowledge Base",
    href: "/knowledge-base-2",
    icon: Brain,
    description: "AI-powered document intelligence",
    subpages: [
      {
        title: "Competitor Analysis",
        href: "/knowledge-base-2/competitor-analysis",
        icon: Target,
        description: "Track competitor insights",
      },
      {
        title: "Customer Sentiment",
        href: "/knowledge-base-2/customer-sentiment",
        icon: Heart,
        description: "Monitor customer feedback",
      },
      {
        title: "Market Trends",
        href: "/knowledge-base-2/market-trends",
        icon: TrendingUp,
        description: "Analyze market developments",
      },
      {
        title: "Product Intelligence",
        href: "/knowledge-base-2/product-intelligence",
        icon: Search,
        description: "Product insights and feedback",
      },
    ],
  },
]

const bottomNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account and preferences",
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
    description: "Support and docs",
  },
]

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "Knowledge Base": true
  })
  const pathname = usePathname()

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle]
    }))
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">RedditReach</h1>
                <p className="text-xs text-gray-500">Marketing Automation</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0])
            const hasSubpages = item.subpages && item.subpages.length > 0
            const isExpanded = expandedItems[item.title]
            const hasActiveSubpage = hasSubpages && item.subpages!.some(subpage => pathname === subpage.href)
            
            return (
              <div key={`${item.title}-${item.href}`}>
                {/* Main Navigation Item */}
                {hasSubpages ? (
                  <div className="flex items-center">
                    <Link href={item.href} className="flex-1">
                      <div
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive || hasActiveSubpage
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive || hasActiveSubpage ? "text-blue-700" : "text-gray-400")} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="h-5 px-2 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </Link>
                    {!collapsed && (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 transition-transform text-gray-400", 
                            isExpanded ? "rotate-180" : ""
                          )} 
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-700" : "text-gray-400")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="h-5 px-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                )}
                
                {/* Subpages */}
                {hasSubpages && isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subpages!.map((subpage) => {
                      const isSubpageActive = pathname === subpage.href
                      return (
                        <Link key={`${subpage.title}-${subpage.href}`} href={subpage.href}>
                          <div
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                              isSubpageActive
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
                            )}
                          >
                            <subpage.icon className={cn("h-4 w-4 flex-shrink-0", isSubpageActive ? "text-blue-800" : "text-gray-400")} />
                            <span className="flex-1">{subpage.title}</span>
                            {subpage.badge && (
                              <Badge variant="secondary" className="h-4 px-1 text-xs">
                                {subpage.badge}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-gray-200">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={`${item.title}-${item.href}`} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-blue-700" : "text-gray-400")} />
                  {!collapsed && <span className="flex-1">{item.title}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">john@company.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
