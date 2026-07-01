import { useState } from 'react'
import { Calculator, Sigma, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductGrid } from '../components/ProductGrid'
import { CartPanel, CartItemRow } from '../components/CartPanel'
import { BottomSheet } from '../components/BottomSheet'
import { Particles } from '../components/Particles'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'

export function POSPage() {
  const { setCurrentPage } = useUIStore()
  const [showCart, setShowCart] = useState(false)
  const cart = useTransactionStore((s) => s.cart)
  const total = useTransactionStore((s) => s.getCartTotal())
  const haptic = useHaptic()

  const handleJumlah = () => {
    haptic('heavy')
    setShowCart(false)
    setTimeout(() => setCurrentPage('jumlah'), 300)
  }

  return (
    <div className="h-full flex flex-col min-h-0 relative">
      <Particles />
      <div className="flex-1 flex min-h-0 relative z-10">
        <div className="flex-1 min-w-0 min-h-0 p-2 sm:p-3 lg:p-5 overflow-hidden">
          <ProductGrid />
        </div>
        <div className="hidden sm:flex sm:flex-col">
          <CartPanel onJumlah={handleJumlah} />
        </div>
      </div>

      {/* Phone: floating FAB cart button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => { haptic('medium'); setShowCart(true) }}
            aria-label={`Buka penjumlahan, ${total.itemCount} item`}
            className="sm:hidden fixed right-4 bottom-[88px] z-30 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ShoppingBag size={22} aria-hidden="true" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-blue-600 text-[10px] font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1 leading-none shadow-lg ring-2 ring-blue-500">
              {total.itemCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Phone: cart BottomSheet */}
      <BottomSheet open={showCart} onClose={() => setShowCart(false)}>
        <div className="flex items-center justify-between pb-3 shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Sigma size={16} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-800">Penjumlahan</h2>
              {total.itemCount > 0 && (
                <p className="text-[9px] text-slate-400 font-medium -mt-0.5">{total.itemCount} item ditambahkan</p>
              )}
            </div>
          </div>
          <button onClick={() => { haptic('light'); setShowCart(false) }} aria-label="Tutup" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 active:bg-slate-200 transition-colors">
            <X size={16} className="text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <Calculator size={28} className="text-slate-300" aria-hidden="true" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">Belum ada item</p>
            <p className="text-[11px] text-slate-300 mt-1">Pilih produk untuk mulai menghitung</p>
          </div>
        ) : (
          <div className="py-3 space-y-2">
            {cart.map(item => <CartItemRow key={item.productId} item={item} />)}
          </div>
        )}

        {cart.length > 0 && (
          <div className="sticky bottom-0 pt-3 pb-2 border-t border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{total.itemCount} barang ({total.totalItems} jenis)</p>
              </div>
              <span className="text-xl font-bold font-mono text-blue-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
            </div>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleJumlah() }}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] rounded-xl font-bold text-[14px] text-white transition-all shadow-lg shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 flex items-center justify-center gap-2 animate-[pulse-glow_2s_ease-in-out_infinite]"
            >
              <Sigma size={18} aria-hidden="true" />
              Hitung
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
