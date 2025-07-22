import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BrandContext, Mention, AnalyticsSnapshot } from './api'

interface BrandData {
  name: string
  oneLiner: string
  products: string
  targetUsers: string
  valueProps: string
  tone: string
  competitors: string
  prohibitedTopics: string
  keywords: string[]
  disclosure: string
}

interface AppState {
  // Brand Context
  brandContext: BrandContext | null
  setBrandContext: (context: BrandContext) => void
  updateBrandContext: (updates: Partial<BrandContext>) => void
  
  // Monitoring Configuration
  monitoringConfig: {
    subreddits: string[]
    keywords: string[]
    configured_at?: number
  } | null
  setMonitoringConfig: (config: { subreddits: string[], keywords: string[], configured_at?: number }) => void
  addKeyword: (keyword: string) => void
  removeKeyword: (keyword: string) => void
  
  // Mentions
  mentions: Mention[]
  setMentions: (mentions: Mention[]) => void
  addMentions: (newMentions: Mention[]) => void
  updateMentionStatus: (id: string, status: string) => void
  
  // Analytics
  analytics: AnalyticsSnapshot | null
  setAnalytics: (analytics: AnalyticsSnapshot) => void
  updateAnalytics: () => void
  
  // UI State
  isLoading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  
  // Clear all data (for reset)
  clearAllData: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Brand Context
      brandContext: null,
      setBrandContext: (context) => set({ brandContext: context }),
      updateBrandContext: (updates) => {
        const current = get().brandContext
        if (current) {
          set({ brandContext: { ...current, ...updates } })
        }
      },
      
      // Monitoring Configuration
      monitoringConfig: null,
      setMonitoringConfig: (config) => set({ monitoringConfig: config }),
      addKeyword: (keyword) => {
        const current = get().monitoringConfig
        if (current && !current.keywords.includes(keyword)) {
          set({
            monitoringConfig: {
              ...current,
              keywords: [...current.keywords, keyword]
            }
          })
        }
      },
      removeKeyword: (keyword) => {
        const current = get().monitoringConfig
        if (current) {
          set({
            monitoringConfig: {
              ...current,
              keywords: current.keywords.filter(k => k !== keyword)
            }
          })
        }
      },
      
      // Mentions
      mentions: [],
      setMentions: (mentions) => set({ mentions }),
      addMentions: (newMentions) => {
        const current = get().mentions
        const existingIds = new Set(current.map(m => m.id))
        const uniqueNewMentions = newMentions.filter(m => !existingIds.has(m.id))
        
        if (uniqueNewMentions.length > 0) {
          const allMentions = [...uniqueNewMentions, ...current]
          // Sort by creation time (newest first) and keep only last 500
          const sortedMentions = allMentions
            .sort((a, b) => b.created_utc - a.created_utc)
            .slice(0, 500)
          set({ mentions: sortedMentions })
        }
      },
      updateMentionStatus: (id, status) => {
        const current = get().mentions
        set({
          mentions: current.map(mention =>
            mention.id === id ? { ...mention, status: status as 'NEW' | 'RESPONDED' | 'IGNORED' } : mention
          )
        })
      },
      
      // Analytics
      analytics: null,
      setAnalytics: (analytics) => set({ analytics }),
      updateAnalytics: () => {
        const mentions = get().mentions
        const responded_mentions = mentions.filter(m => m.status === 'RESPONDED')
        
        // Calculate real average response time
        let avg_response_minutes = 0.0
        if (responded_mentions.length > 0) {
          let total_response_time = 0
          let valid_responses = 0
          
          for (const mention of responded_mentions) {
            if (mention.responded_at) {
              const response_time = mention.responded_at - mention.created_utc
              total_response_time += response_time
              valid_responses += 1
            }
          }
          
          if (valid_responses > 0) {
            avg_response_minutes = (total_response_time / valid_responses) / 60 // Convert seconds to minutes
          }
        }
        
        const analytics: AnalyticsSnapshot = {
          timestamp: Math.floor(Date.now() / 1000),
          mention_totals: mentions.length,
          by_sentiment: {
            positive: mentions.filter(m => m.sentiment === 'positive').length,
            neutral: mentions.filter(m => m.sentiment === 'neutral').length,
            negative: mentions.filter(m => m.sentiment === 'negative').length,
          },
          by_subreddit: Object.entries(
            mentions.reduce((acc, mention) => {
              acc[mention.subreddit] = (acc[mention.subreddit] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          )
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          responded_count: responded_mentions.length,
          avg_response_minutes: avg_response_minutes,
        }
        set({ analytics })
      },
      
      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      
      // Clear all data
      clearAllData: () => set({
        brandContext: null,
        monitoringConfig: null,
        mentions: [],
        analytics: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'reddit-pro-storage',
      partialize: (state) => ({
        brandContext: state.brandContext,
        monitoringConfig: state.monitoringConfig,
        mentions: state.mentions
      })
    }
  )
)

// Helper functions for converting between API and local formats
export const convertBrandContextToLocal = (context: BrandContext): BrandData => ({
  name: context.brand_name || "",
  oneLiner: context.one_line || "",
  products: context.products?.join(', ') || "",
  targetUsers: context.target_users?.join(', ') || "",
  valueProps: context.value_props?.join(', ') || "",
  tone: context.tone?.voice_keywords?.join(', ') || "",
  competitors: context.competitors?.join(', ') || "",
  prohibitedTopics: context.prohibited?.join(', ') || "",
  keywords: context.keywords || [],
  disclosure: context.disclosure_template || "",
})

export const convertLocalToBrandContext = (data: BrandData): Partial<BrandContext> => ({
  brand_name: data.name,
  one_line: data.oneLiner,
  products: data.products.split(',').map(s => s.trim()).filter(s => s),
  target_users: data.targetUsers.split(',').map(s => s.trim()).filter(s => s),
  value_props: data.valueProps.split(',').map(s => s.trim()).filter(s => s),
  tone: {
    formality: "neutral",
    voice_keywords: data.tone.split(',').map(s => s.trim()).filter(s => s)
  },
  competitors: data.competitors.split(',').map(s => s.trim()).filter(s => s),
  prohibited: data.prohibitedTopics.split(',').map(s => s.trim()).filter(s => s),
  keywords: data.keywords,
  disclosure_template: data.disclosure,
})
