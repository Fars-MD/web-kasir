import { Minus, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CartItem as CartItemType } from '../types'
import { formatCurrency } from '../lib/utils'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic } from '../hooks/useAndroid'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useTransactionStore()
  const haptic = useHaptic()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex items-center justify-between py-2.5 border-b border-border-light group"
    >
      <div className="flex-1 min-w-0 mr-2">
        <p className="text-[12px] font-medium text-text-primary truncate">{item.productName}</p>
        <p className="text-[10px] text-text-tertiary font-mono">{formatCurrency(item.unitPrice)}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-surface-3 rounded-xl">
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              haptic('light')
              if (item.quantity <= 1) {
                removeFromCart(item.productId)
              } else {
                updateQuantity(item.productId, item.quantity - 1)
              }
            }}
            className="p-1.5 active:bg-surface-4 rounded-l-xl transition-colors"
          >
            {item.quantity === 1 ? <Trash2 size={12} className="text-danger" /> : <Minus size={12} />}
          </button>
          <span className="w-7 text-center text-[12px] font-mono">{item.quantity}</span>
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              haptic('light')
              updateQuantity(item.productId, item.quantity + 1)
            }}
            className="p-1.5 active:bg-surface-4 rounded-r-xl transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="w-20 text-right text-[12px] font-mono font-medium text-text-primary">
          {formatCurrency(item.subtotal)}
        </p>
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            haptic('medium')
            removeFromCart(item.productId)
          }}
          className="p-1.5 active:text-danger transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  )
}
