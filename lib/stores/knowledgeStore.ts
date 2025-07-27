import { create } from 'zustand'
import { Insight, KnowledgeBase, PendingInsight } from '../api'
import { KnowledgeStorage, PendingQueue } from '../knowledgeStorage'

interface KnowledgeStore {
  // State
  currentCategory: keyof KnowledgeBase
  insights: Insight[]
  searchQuery: string
  pendingInsights: PendingInsight[]
  isLoading: boolean
  
  // Services
  storage: KnowledgeStorage
  pendingQueue: PendingQueue
  
  // Actions
  setCategory: (category: keyof KnowledgeBase) => void
  addInsight: (category: keyof KnowledgeBase, insight: Insight) => void
  updateInsight: (category: keyof KnowledgeBase, insightId: string, updates: Partial<Insight>) => void
  deleteInsight: (category: keyof KnowledgeBase, insightId: string) => void
  searchInsights: (query: string) => void
  clearSearch: () => void
  initializeData: () => void
  
  // Pending queue actions
  addToPending: (insight: PendingInsight) => void
  approvePending: (id: string, category: keyof KnowledgeBase) => void
  rejectPending: (id: string) => void
  updatePending: (id: string, updates: Partial<PendingInsight>) => void
  loadPendingInsights: () => void
  
  // Utility actions
  getInsightsByPriority: (priority: 'high' | 'medium' | 'low') => Insight[]
  getRecentInsights: (limit?: number) => Insight[]
  exportData: () => string
  importData: (jsonData: string) => void
}

export const useKnowledgeStore = create<KnowledgeStore>((set, get) => ({
  // Initial state
  currentCategory: 'competitor-analysis',
  insights: [],
  searchQuery: '',
  pendingInsights: [],
  isLoading: false,
  
  // Services
  storage: new KnowledgeStorage(),
  pendingQueue: new PendingQueue(),
  
  // Actions
  setCategory: (category) => {
    const { storage } = get()
    const insights = storage.getCategory(category)
    set({ 
      currentCategory: category, 
      insights,
      searchQuery: '' // Clear search when switching categories
    })
  },
  
  addInsight: (category, insight) => {
    const { storage, currentCategory } = get()
    storage.saveInsight(category, insight)
    
    // Update current view if we're on this category
    if (currentCategory === category) {
      const updatedInsights = storage.getCategory(category)
      set({ insights: updatedInsights })
    }
  },
  
  updateInsight: (category, insightId, updates) => {
    const { storage, currentCategory } = get()
    storage.updateInsight(category, insightId, updates)
    
    // Update current view if we're on this category
    if (currentCategory === category) {
      const updatedInsights = storage.getCategory(category)
      set({ insights: updatedInsights })
    }
  },
  
  deleteInsight: (category, insightId) => {
    const { storage, currentCategory } = get()
    storage.deleteInsight(category, insightId)
    
    // Update current view if we're on this category
    if (currentCategory === category) {
      const updatedInsights = storage.getCategory(category)
      set({ insights: updatedInsights })
    }
  },
  
  searchInsights: (query) => {
    const { storage } = get()
    
    if (!query.trim()) {
      // If empty query, show current category
      const insights = storage.getCategory(get().currentCategory)
      set({ searchQuery: query, insights })
    } else {
      // Show search results
      const results = storage.searchInsights(query)
      set({ searchQuery: query, insights: results })
    }
  },
  
  clearSearch: () => {
    const { storage, currentCategory } = get()
    const insights = storage.getCategory(currentCategory)
    set({ searchQuery: '', insights })
  },
  
  initializeData: () => {
    set({ isLoading: true })
    
    const { storage, pendingQueue } = get()
    storage.initializeSampleData()
    
    const insights = storage.getCategory('competitor-analysis')
    const pendingInsights = pendingQueue.getPending()
    
    set({ 
      insights,
      pendingInsights,
      isLoading: false 
    })
  },
  
  // Pending queue actions
  addToPending: (insight) => {
    const { pendingQueue } = get()
    pendingQueue.addToPending(insight)
    
    // Refresh pending list
    const updatedPending = pendingQueue.getPending()
    set({ pendingInsights: updatedPending })
  },
  
  approvePending: (id, category) => {
    const { pendingQueue, storage, currentCategory } = get()
    pendingQueue.approvePending(id, category)
    
    // Refresh pending list
    const updatedPending = pendingQueue.getPending()
    set({ pendingInsights: updatedPending })
    
    // Refresh current view if we're on the approved category
    if (currentCategory === category) {
      const updatedInsights = storage.getCategory(category)
      set({ insights: updatedInsights })
    }
  },
  
  rejectPending: (id) => {
    const { pendingQueue } = get()
    pendingQueue.rejectPending(id)
    
    // Refresh pending list
    const updatedPending = pendingQueue.getPending()
    set({ pendingInsights: updatedPending })
  },
  
  updatePending: (id, updates) => {
    const { pendingQueue } = get()
    pendingQueue.updatePending(id, updates)
    
    // Refresh pending list
    const updatedPending = pendingQueue.getPending()
    set({ pendingInsights: updatedPending })
  },
  
  loadPendingInsights: () => {
    const { pendingQueue } = get()
    const pendingInsights = pendingQueue.getPending()
    set({ pendingInsights })
  },
  
  // Utility actions
  getInsightsByPriority: (priority) => {
    const { storage } = get()
    return storage.getInsightsByPriority(priority)
  },
  
  getRecentInsights: (limit) => {
    const { storage } = get()
    return storage.getRecentInsights(limit)
  },
  
  exportData: () => {
    const { storage } = get()
    return storage.exportData()
  },
  
  importData: (jsonData) => {
    const { storage, currentCategory } = get()
    storage.importData(jsonData)
    
    // Refresh current view
    const insights = storage.getCategory(currentCategory)
    set({ insights })
  }
}))

// Selectors for better performance
export const useCurrentInsights = () => useKnowledgeStore(state => state.insights)
export const useCurrentCategory = () => useKnowledgeStore(state => state.currentCategory)
export const useSearchQuery = () => useKnowledgeStore(state => state.searchQuery)
export const usePendingInsights = () => useKnowledgeStore(state => state.pendingInsights)
export const useIsLoading = () => useKnowledgeStore(state => state.isLoading)