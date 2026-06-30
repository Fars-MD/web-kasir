import { Package, Box, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import type { Product } from '../types'
import { formatCurrency } from '../lib/utils'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic } from '../hooks/useAndroid'

interface ProductCardProps {
  product: Product
}

const categoryEmoji: Record<string, string> = {
  'Minuman': '🥤', 'Rokok': '🚬', 'Makanan': '🍽️', 'Bahan Makanan': '🧂',
  'Shampo': '🧴', 'Sabun Baju & Pewangi': '🫧', 'Obat': '💊',
}

export function ProductCard({ product }: ProductCardProps) {
  const { togglePick, cart } = useTransactionStore()
  const haptic = useHaptic()
  const cardRef = useRef<HTMLDivElement>(null)
  const [adding, setAdding] = useState<'pcs' | 'pack' | null>(null)

  const isOut = product.stock === 0
  const hasPack = product.packPrice > 0
  const emoji = categoryEmoji[product.category?.name || ''] || '📦'

  // Check if product is in cart
  const inCart = cart.find(c => c.productId === product.id)
  const cartQuantity = inCart?.quantity || 0

  const addToCart = (unitType: 'pcs' | 'pack', e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOut) return

    haptic(unitType === 'pcs' ? 'light' : 'medium')

    // Show adding animation
    setAdding(unitType)

    // Get price based on unit type
    const price = unitType === 'pack' ? product.packPrice : product.sellPrice
    const unitLabel = unitType === 'pack' ? (product.category?.unitLabel || 'Pack') : 'Pcs'

    togglePick({
      id: product.id,
      name: product.name,
      price,
      costPrice: product.costPrice,
      unitType,
      unitLabel,
    })

    // Create ripple effect at click position
    const card = cardRef.current
    if (card) {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const ripple = document.createElement('span')
      ripple.className = 'absolute pointer-events-none rounded-full bg-primary-500/30 animate-ping'
      ripple.style.cssText = `
        width: 100px;
        height: 100px;
        left: ${x - 50}px;
        top: ${y - 50}px;
        transform: scale(0);
        animation: ripple-expand 0.6s ease-out forwards;
      `
      card.style.position = 'relative'
      card.style.overflow = 'hidden'
      card.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    setTimeout(() => setAdding(null), 300)
  }

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: isOut ? 1 : 1.02 }}
      whileTap={{ scale: isOut ? 1 : 0.98 }}
      className={`relative bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-all duration-200
        ${isOut
          ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700'
          : 'cursor-pointer border-slate-200/80 dark:border-slate-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 active:shadow-md'
        }
        ${cartQuantity > 0 ? 'ring-2 ring-primary-400 dark:ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
      `}
    >
      {/* In cart indicator */}
      <AnimatePresence>
        {cartQuantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute top-2 right-2 z-20 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30"
          >
            <span className="text-[10px] font-bold text-white">{cartQuantity}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add animation overlay */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-primary-500/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40"
            >
              <Check size={24} className="text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span className="text-3xl select-none opacity-30 dark:opacity-20">{emoji}</span>
        )}

        {/* Stock Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOut ? (
            <span className="px-2.5 py-1 text-[8px] font-bold bg-danger-500 text-white rounded-lg tracking-wider shadow-sm">
              HABIS
            </span>
          ) : product.stock <= product.minStock ? (
            <span className="px-2.5 py-1 text-[8px] font-bold bg-warning-500 text-white rounded-lg tracking-wider shadow-sm animate-pulse">
              MENIPIS
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[8px] font-bold bg-success-500 text-white rounded-lg tracking-wider shadow-sm">
              AMAN
            </span>
          )}
        </div>
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-semibold bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 rounded-lg backdrop-blur-sm">
          {product.category?.name}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[12px] text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 leading-snug min-h-[1.6rem]">
          {product.name}
        </h3>

        <div className="space-y-0.5 mb-2.5">
          {hasPack && (
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
                per {product.category?.unitLabel || 'Pack'}
              </span>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {formatCurrency(product.packPrice)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
              per Pcs
            </span>
            <span className={`text-[11px] font-bold tabular-nums ${
              hasPack
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-primary-600 dark:text-primary-400'
            }`}>
              {formatCurrency(product.sellPrice)}
            </span>
          </div>
        </div>

        {!isOut && (
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => addToCart('pcs', e)}
              className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl transition-all text-[11px] font-semibold ${
                cartQuantity > 0
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 active:bg-primary-50 dark:active:bg-primary-900/30'
              }`}
            >
              <Box size={12} strokeWidth={2.5} />
              Pcs
            </motion.button>
            {hasPack && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => addToCart('pack', e)}
                className={`flex-1 flex items-center justify-center gap-1 h-9 rounded-xl transition-all text-[11px] font-semibold ${
                  cartQuantity > 0
                    ? 'bg-primary-500 text-white'
                    : 'bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-md shadow-primary-500/20'
                }`}
              >
                <Package size={12} strokeWidth={2.5} />
                {product.category?.unitLabel || 'Pack'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
