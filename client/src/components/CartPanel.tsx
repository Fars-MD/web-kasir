import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic, useSwipeToDelete } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'

function CartItemRow({ item, index }: { item: any; index: number }) {
  const { updateQuantity, removeFromCart } = useTransactionStore()
  const haptic = useHaptic()
  const swipeRef = useSwipeToDelete(() => {
    haptic('medium')
    removeFromCart(item.productId)
  }, { threshold: 80, direction: 'left' })

  return (
    <motion.div
      ref={swipeRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      className="relative"
    >
      <div className="absolute inset-0 flex items-center justify-end pr-3 bg-danger-500 rounded-xl">
        <Trash2 size={14} className="text-white" />
      </div>
      <div className="relative flex items-center gap-2 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{item.productName}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            {formatCurrency(item.unitPrice)} / {item.unitLabel}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              haptic('light')
              item.quantity <= 1 ? removeFromCart(item.productId) : updateQuantity(item.productId, item.quantity - 1)
            }}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center active:bg-danger-50 dark:active:bg-danger-900/30 active:text-danger-500 transition-colors"
          >
            {item.quantity <= 1 ? <Trash2 size={11} /> : <Minus size={11} />}
          </button>
          <motion.span
            key={item.quantity}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="w-7 text-center text-[12px] font-bold tabular-nums text-slate-800 dark:text-slate-100"
          >
            {item.quantity}
          </motion.span>
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              haptic('light')
              updateQuantity(item.productId, item.quantity + 1)
            }}
            className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center active:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
          >
            <Plus size={11} />
          </button>
        </div>
        <p className="w-[60px] text-right text-[11px] font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0 tabular-nums">
          {formatCurrency(item.subtotal)}
        </p>
      </div>
    </motion.div>
  )
}

interface CartPanelProps { onJumlah?: () => void }

export function CartPanel({ onJumlah }: CartPanelProps) {
  const cart = useTransactionStore((s) => s.cart)
  const clearCart = useTransactionStore((s) => s.clearCart)
  const total = useTransactionStore((s) => s.getCartTotal())
  const haptic = useHaptic()

  return (
    <div className="w-[260px] lg:w-[280px] xl:w-[320px] bg-white dark:bg-slate-800 flex flex-col h-full shrink-0 border-l border-slate-100 dark:border-slate-700 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <ShoppingCart size={14} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Pesanan</h2>
              {total.itemCount > 0 && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{total.itemCount} item</p>
              )}
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => {
                haptic('heavy')
                if (confirm('Hapus semua item?')) clearCart()
              }}
              className="text-[10px] text-danger-500 font-medium px-2 py-1 rounded-lg active:bg-danger-50 dark:active:bg-danger-900/30 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
              <ShoppingCart size={22} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">Keranjang kosong</p>
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Tap produk untuk menambahkan</p>
          </div>
        ) : (
          <div className="px-3">
            <AnimatePresence mode="popLayout">
              {cart.map((item, i) => (
                <CartItemRow key={item.productId} item={item} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800"
        >
          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Subtotal</span>
              <motion.span
                key={total.subtotal}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-[13px] font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums"
              >
                {formatCurrency(total.subtotal)}
              </motion.span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Item</span>
              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{total.itemCount} pcs</span>
            </div>
          </div>

          <button
            onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); onJumlah?.() }}
            className="w-full h-11 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 text-white rounded-xl font-bold text-[12px] transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            <span>Bayar</span>
            <span className="text-[9px] opacity-70 bg-white/20 px-1.5 py-0.5 rounded">F2</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}
