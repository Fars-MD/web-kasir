import { create } from 'zustand'
import type { Product, Category } from '../types'
import { api } from '../lib/api'

interface ProductStore {
  products: Product[]
  categories: Category[]
  searchQuery: string
  loading: boolean

  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  setSearchQuery: (query: string) => void
  createProduct: (data: any) => Promise<Product>
  updateProduct: (id: string, data: any) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  categories: [],
  searchQuery: '',
  loading: false,

  fetchProducts: async () => {
    set({ loading: true })
    try {
      const products = await api.products.list()
      set({ products, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await api.categories.list()
      set({ categories })
    } catch (error) {
      throw error
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  createProduct: async (data: any) => {
    const product = await api.products.create(data)
    set((state) => ({ products: [...state.products, product] }))
    return product
  },

  updateProduct: async (id: string, data: any) => {
    const product = await api.products.update(id, data)
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? product : p)),
    }))
    return product
  },

  deleteProduct: async (id: string) => {
    await api.products.delete(id)
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },
}))
