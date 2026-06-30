import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react'
import { ProductGrid } from '../components/ProductGrid'
import { CartPanel } from '../components/CartPanel'
import { BottomSheet } from '../components/BottomSheet'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic, useBackButton } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'

export function POSPage() {
  const { updateQuantity, removeFromCart } = useTransactionStore()
  const { setCurrentPage } = useUIStore()
  const [showCart, setShowCart] = useState(false)
  const cart = useTransactionStore((s) => s.cart)
  const total = useTransactionStore((s) => s.getCartTotal())
  const haptic = useHaptic()

  useBackButton(() => { if (showCart) { haptic('light'); setShowCart(false) } })

  const handleJumlah = () => {
    haptic('heavy')
    setShowCart(false)
    setTimeout(() => setCurrentPage('jumlah'), 150)
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 min-h-0 p-2 sm:p-3 lg:p-5 overflow-hidden">
          <ProductGrid onCartTap={() => { haptic('medium'); setShowCart(true) }} cartCount={total.itemCount} />
        </div>
        <div className="hidden sm:flex sm:flex-col">
          <CartPanel onJumlah={handleJumlah} />
        </div>
      </div>

      {/* Phone cart bottom sheet */}
      <BottomSheet open={showCart} onClose={() => setShowCart(false)}>
        <div className="flex items-center justify-between py-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-amber-500" />
            <h2 className="font-bold text-[13px] text-slate-800">Pesanan</h2>
            {total.itemCount > 0 && <span className="text-[10px] text-slate-400 font-medium">({total.itemCount})</span>}
          </div>
          <button onClick={() => { haptic('light'); setShowCart(false) }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart size={28} className="text-slate-200 mb-2" />
            <p className="text-[12px] font-medium text-slate-300">Kosong</p>
          </div>
        ) : (
          <div className="pb-2">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 py-2.5 border-b border-slate-100 last:border-0">
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
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="sticky bottom-0 pt-3 pb-2 border-t border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-slate-500 font-medium">Total</span>
              <span className="text-[15px] font-bold font-mono text-emerald-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
            </div>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleJumlah() }}
              className="w-full h-12 bg-amber-500 active:bg-amber-600 rounded-xl font-bold text-[14px] text-white transition-colors shadow-lg shadow-amber-500/25"
            >
              Jumlah
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
