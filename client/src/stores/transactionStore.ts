import { create } from 'zustand'
import type { CartItem } from '../types'

interface TransactionStore {
  cart: CartItem[]

  addToCart: (item: Omit<CartItem, 'subtotal'>) => void
  removeFromCart: (productId: string) => void
  togglePick: (product: { id: string; name: string; price: number; costPrice: number; unitType?: 'pcs' | 'pack'; unitLabel?: string }) => void
  isPicked: (productId: string) => boolean
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => { subtotal: number; total: number; itemCount: number; totalItems: number }
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  cart: [],

  addToCart: (item) => {
    set((state) => {
      const existing = state.cart.find((c) => c.productId === item.productId)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.productId === item.productId
              ? { ...c, quantity: c.quantity + item.quantity, subtotal: (c.quantity + item.quantity) * c.unitPrice }
              : c
          ),
        }
      }
      return { cart: [...state.cart, { ...item, subtotal: item.quantity * item.unitPrice }] }
    })
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((c) => c.productId !== productId),
    }))
  },

  togglePick: (product) => {
    const { cart } = get()
    const existing = cart.find((c) => c.productId === product.id)

    if (existing) {
      set((state) => ({
        cart: state.cart.filter((c) => c.productId !== product.id),
      }))
    } else {
      set((state) => ({
        cart: [
          ...state.cart,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.price,
            costPrice: product.costPrice,
            subtotal: product.price,
            discount: 0,
            unitType: product.unitType || 'pcs',
            unitLabel: product.unitLabel || 'Pcs',
          },
        ],
      }))
    }
  },

  isPicked: (productId: string) => {
    return get().cart.some((c) => c.productId === productId)
  },

  updateQuantity: (productId: string, quantity: number) => {
    const safeQty = Math.max(0, Math.min(10000, Math.floor(quantity)))
    set((state) => ({
      cart: safeQty === 0
        ? state.cart.filter((c) => c.productId !== productId)
        : state.cart.map((c) =>
            c.productId === productId
              ? { ...c, quantity: safeQty, subtotal: safeQty * c.unitPrice }
              : c
          ),
    }))
  },

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const { cart } = get()
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalItems = cart.length
    return { subtotal, total: subtotal, itemCount, totalItems }
  },
}))
