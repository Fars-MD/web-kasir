import { AnimatePresence } from 'framer-motion'
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic, useSwipeToDelete } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'

function CartItemRow({ item }: { item: any }) {
  const { updateQuantity, removeFromCart } = useTransactionStore()
  const haptic = useHaptic()
  const swipeRef = useSwipeToDelete(() => {
    haptic('medium')
    removeFromCart(item.productId)
  }, { threshold: 80, direction: 'left' })

  return (
    <div ref={swipeRef} className="relative">
      <div className="absolute inset-0 flex items-center justify-end pr-3 bg-red-500 rounded-xl">
        <Trash2 size={14} className="text-white" />
      </div>
      <div className="relative flex items-center gap-2 py-2.5 border-b border-slate-100 last:border-0">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-slate-700 truncate">{item.productName}</p>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{formatCurrency(item.unitPrice)} / {item.unitLabel}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onPointerDown={(e) => { e.preventDefault(); haptic('light'); item.quantity <= 1 ? removeFromCart(item.productId) : updateQuantity(item.productId, item.quantity - 1) }}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center active:bg-red-50 active:text-red-500 transition-colors"
          >
            {item.quantity <= 1 ? <Trash2 size={12} /> : <Minus size={12} />}
          </button>
          <span className="w-8 text-center text-[13px] font-bold tabular-nums text-slate-800">{item.quantity}</span>
          <button
            onPointerDown={(e) => { e.preventDefault(); haptic('light'); updateQuantity(item.productId, item.quantity + 1) }}
            className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center active:bg-amber-600 transition-colors shadow-sm shadow-amber-500/20"
          >
            <Plus size={12} />
          </button>
        </div>
        <p className="w-[72px] text-right text-[11px] font-mono font-bold text-slate-800 shrink-0 tabular-nums">
          {formatCurrency(item.subtotal)}
        </p>
      </div>
    </div>
  )
}

interface CartPanelProps { onJumlah?: () => void }

export function CartPanel({ onJumlah }: CartPanelProps) {
  const cart = useTransactionStore((s) => s.cart)
  const total = useTransactionStore((s) => s.getCartTotal())
  const haptic = useHaptic()

  return (
    <div className="w-[280px] lg:w-[340px] bg-white flex flex-col h-full shrink-0 border-l border-slate-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-amber-500" />
            <h2 className="text-[13px] font-bold text-slate-800">Pesanan</h2>
            {total.itemCount > 0 && <span className="text-[10px] text-slate-400 font-medium">({total.itemCount})</span>}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => { haptic('heavy'); if (confirm('Hapus semua?')) useTransactionStore.getState().clearCart() }}
              className="text-[10px] text-red-400 font-medium px-2 py-1 rounded-lg active:bg-red-50 transition-colors"
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
            <ShoppingCart size={28} className="text-slate-200 mb-2" />
            <p className="text-[12px] font-medium text-slate-300">Kosong</p>
          </div>
        ) : (
          <div className="px-4">
            <AnimatePresence>
              {cart.map(item => <CartItemRow key={item.productId} item={item} />)}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] text-slate-500 font-medium">Total</span>
            <span className="text-[15px] font-bold font-mono text-emerald-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); onJumlah?.() }}
            className="w-full h-11 bg-amber-500 active:bg-amber-600 text-white rounded-xl font-bold text-[13px] transition-colors shadow-lg shadow-amber-500/25"
          >
            Jumlah
          </button>
        </div>
      )}
    </div>
  )
}
