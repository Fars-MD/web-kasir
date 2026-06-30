import { useState, useRef } from 'react'
import { ShoppingCart, Minus, Plus, Trash2, X, Search, CreditCard, Keyboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductGrid } from '../components/ProductGrid'
import { CartPanel } from '../components/CartPanel'
import { BottomSheet } from '../components/BottomSheet'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic, useBackButton } from '../hooks/useAndroid'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { formatCurrency } from '../lib/utils'

export function POSPage() {
  const { updateQuantity, removeFromCart } = useTransactionStore()
  const { setCurrentPage } = useUIStore()
  const [showCart, setShowCart] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const cart = useTransactionStore((s) => s.cart)
  const total = useTransactionStore((s) => s.getCartTotal())
  const haptic = useHaptic()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useBackButton(() => { if (showCart) { haptic('light'); setShowCart(false) } })

  // Keyboard shortcuts for POS page
  useKeyboardShortcuts([
    {
      key: 'F2',
      action: () => {
        if (cart.length > 0) {
          handleJumlah()
        }
      },
    },
    {
      key: 'F3',
      action: () => {
        searchInputRef.current?.focus()
      },
    },
    {
      key: '?',
      shift: true,
      action: () => setShowShortcuts(true),
    },
  ])

  const handleJumlah = () => {
    haptic('heavy')
    setShowCart(false)
    setTimeout(() => setCurrentPage('jumlah'), 150)
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Mobile header with search */}
      <div className="sm:hidden shrink-0 px-3 py-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari produk... (F3)"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-10 pr-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => { haptic('medium'); setShowCart(true) }}
            className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 active:scale-95 transition-transform"
          >
            <ShoppingCart size={18} strokeWidth={2} />
            {total.itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-danger-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none shadow-md"
              >
                {total.itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Product Grid - Left Side */}
        <div className="flex-1 min-w-0 min-h-0 p-2 sm:p-3 lg:p-4 overflow-hidden">
          <ProductGrid
            searchInputRef={searchInputRef}
          />
        </div>

        {/* Cart Panel - Right Side (Desktop/Tablet) */}
        <div className="hidden sm:flex sm:flex-col">
          <CartPanel onJumlah={handleJumlah} />
        </div>
      </div>

      {/* Mobile FAB for quick pay */}
      {cart.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={handleJumlah}
          className="sm:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/30 active:scale-95 transition-transform"
        >
          <CreditCard size={18} />
          <span className="font-bold text-[13px]">{formatCurrency(total.subtotal)}</span>
        </motion.button>
      )}

      {/* Phone cart bottom sheet */}
      <BottomSheet open={showCart} onClose={() => setShowCart(false)}>
        <div className="flex items-center justify-between py-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-primary-500" />
            <h2 className="font-bold text-[13px] text-slate-800 dark:text-slate-100">Pesanan</h2>
            {total.itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[10px] text-slate-400 dark:text-slate-500 font-medium"
              >
                ({total.itemCount})
              </motion.span>
            )}
          </div>
          <button
            onClick={() => { haptic('light'); setShowCart(false) }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
          >
            <X size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
              <ShoppingCart size={24} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">Keranjang kosong</p>
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Tap produk untuk menambahkan</p>
          </div>
        ) : (
          <div className="pb-2">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="flex items-center gap-2 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
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
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center active:bg-danger-50 dark:active:bg-danger-900/30 active:text-danger-500 transition-colors"
                    >
                      {item.quantity <= 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="w-8 text-center text-[13px] font-bold tabular-nums text-slate-800 dark:text-slate-100"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault()
                        haptic('light')
                        updateQuantity(item.productId, item.quantity + 1)
                      }}
                      className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center active:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="w-[72px] text-right text-[11px] font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0 tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {cart.length > 0 && (
          <div className="sticky bottom-0 pt-3 pb-2 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">Total</span>
              <motion.span
                key={total.subtotal}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-[15px] font-bold font-mono text-primary-600 dark:text-primary-400 tabular-nums"
              >
                {formatCurrency(total.subtotal)}
              </motion.span>
            </div>
            <button
              onPointerDown={(e) => { e.preventDefault(); handleJumlah() }}
              className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 active:from-primary-600 active:to-primary-700 rounded-xl font-bold text-[14px] text-white transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
            >
              <span>Bayar</span>
              <span className="text-[10px] opacity-80">F2</span>
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Keyboard shortcuts hint */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="hidden lg:flex fixed bottom-4 right-4 z-20 w-10 h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <Keyboard size={16} />
      </button>

      {/* Keyboard shortcuts modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Keyboard size={18} className="text-primary-500" />
                Shortcut Keyboard
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'F2', desc: 'Bayar / Proses' },
                  { key: 'F3', desc: 'Cari Produk' },
                  { key: 'Esc', desc: 'Tutup Modal' },
                  { key: 'Ctrl+D', desc: 'Dark Mode' },
                  { key: 'Home', desc: 'Beranda' },
                  { key: '?', desc: 'Bantuan' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{s.desc}</span>
                    <kbd className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 w-full py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
