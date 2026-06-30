import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}

interface UIStore {
  toasts: Toast[]
  currentPage: 'pos' | 'products' | 'dashboard' | 'priceList' | 'jumlah' | 'keuntungan' | 'riwayat'

  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
  setCurrentPage: (page: UIStore['currentPage']) => void
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  currentPage: 'pos',

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setCurrentPage: (page) => set({ currentPage: page }),
}))
