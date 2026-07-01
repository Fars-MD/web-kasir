import { create } from 'zustand'
import type { CartItem } from '../types'

interface TransactionStore {
  cart: CartItem[]

  addPcs: (product: { id: string; name: string; sellPrice: number; packPrice: number; costPrice: number; pcsPerPack: number; unitLabel: string }) => void
  addPack: (product: { id: string; name: string; sellPrice: number; packPrice: number; costPrice: number; pcsPerPack: number; unitLabel: string }) => void
  updateQtyPcs: (productId: string, qty: number) => void
  updateQtyPack: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  isPicked: (productId: string) => boolean
  getCartTotal: () => { subtotal: number; total: number; itemCount: number; totalItems: number }
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  cart: [],

  addPcs: (product) => {
    set((state) => {
      const existing = state.cart.find((c) => c.productId === product.id)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productId === product.id
              ? { ...c, qtyPcs: c.qtyPcs + 1 }
              : c
          ),
        }
      }
      return {
        cart: [
          ...state.cart,
          {
            productId: product.id,
            productName: product.name,
            sellPrice: product.sellPrice,
            packPrice: product.packPrice,
            costPrice: product.costPrice,
            pcsPerPack: product.pcsPerPack,
            qtyPcs: 1,
            qtyPack: 0,
            unitLabel: product.unitLabel,
            discount: 0,
          },
        ],
      }
    })
  },

  addPack: (product) => {
    set((state) => {
      const existing = state.cart.find((c) => c.productId === product.id)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productId === product.id
              ? { ...c, qtyPack: c.qtyPack + 1 }
              : c
          ),
        }
      }
      return {
        cart: [
          ...state.cart,
          {
            productId: product.id,
            productName: product.name,
            sellPrice: product.sellPrice,
            packPrice: product.packPrice,
            costPrice: product.costPrice,
            pcsPerPack: product.pcsPerPack,
            qtyPcs: 0,
            qtyPack: 1,
            unitLabel: product.unitLabel,
            discount: 0,
          },
        ],
      }
    })
  },

  updateQtyPcs: (productId, qty) => {
    const safeQty = Math.max(0, Math.min(10000, Math.floor(qty)))
    set((state) => ({
      cart: safeQty === 0 && state.cart.find((c) => c.productId === productId)?.qtyPack === 0
        ? state.cart.filter((c) => c.productId !== productId)
        : state.cart.map((c) =>
            c.productId === productId
              ? { ...c, qtyPcs: safeQty }
              : c
          ),
    }))
  },

  updateQtyPack: (productId, qty) => {
    const safeQty = Math.max(0, Math.min(10000, Math.floor(qty)))
    set((state) => ({
      cart: safeQty === 0 && state.cart.find((c) => c.productId === productId)?.qtyPcs === 0
        ? state.cart.filter((c) => c.productId !== productId)
        : state.cart.map((c) =>
            c.productId === productId
              ? { ...c, qtyPack: safeQty }
              : c
          ),
    }))
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    }))
  },

  clearCart: () => set({ cart: [] }),

  isPicked: (productId) => {
    return get().cart.some((c) => c.productId === productId)
  },

  getCartTotal: () => {
    const { cart } = get()
    const subtotal = cart.reduce((sum, item) => sum + (item.qtyPcs * item.sellPrice) + (item.qtyPack * item.packPrice), 0)
    const itemCount = cart.reduce((sum, item) => sum + item.qtyPcs + item.qtyPack, 0)
    const totalItems = cart.length
    return { subtotal, total: subtotal, itemCount, totalItems }
  },
}))
