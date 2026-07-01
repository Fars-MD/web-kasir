import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}

interface UIStore {
  toasts: Toast[]
  currentPage: 'pos' | 'products' | 'dashboard' | 'priceList' | 'jumlah' | 'keuntungan'
  pageHistory: string[]

  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
  setCurrentPage: (page: UIStore['currentPage']) => void
  goBack: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  toasts: [],
  currentPage: 'pos',
  pageHistory: [],

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setCurrentPage: (page) => set((state) => ({
    currentPage: page,
    pageHistory: [...state.pageHistory, state.currentPage],
  })),

  goBack: () => {
    const { pageHistory } = get()
    if (pageHistory.length === 0) return
    const prev = pageHistory[pageHistory.length - 1]
    set((state) => ({
      currentPage: prev as UIStore['currentPage'],
      pageHistory: state.pageHistory.slice(0, -1),
    }))
  },
}))
