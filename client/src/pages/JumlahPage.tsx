import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'

export function JumlahPage() {
  const { cart, clearCart } = useTransactionStore()
  const { setCurrentPage } = useUIStore()
  const haptic = useHaptic()
  const total = useTransactionStore((s) => s.getCartTotal())

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => { haptic('light'); setCurrentPage('pos') }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Ringkasan</h1>
        <div className="ml-auto flex items-center gap-2">
          <CreditCard size={14} className="text-primary-500" />
          <span className="text-[12px] text-slate-500 dark:text-slate-400">{cart.length} item</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <ShoppingCart size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500">Belum ada item</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0"
          >
            {cart.map((item, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-[11px] text-slate-300 dark:text-slate-600 font-mono">{i + 1}</span>
                  <div>
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{item.productName}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {item.quantity} × {formatCurrency(item.unitPrice)} = <span className="text-primary-600 dark:text-primary-400 font-bold">{formatCurrency(item.subtotal)}</span>
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400">{item.quantity}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 px-4 pt-4 pb-5 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3"
        >
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-primary-600 dark:text-primary-400 font-medium">Total Pembayaran</span>
              <span className="text-2xl font-bold font-mono text-primary-700 dark:text-primary-300 tabular-nums">
                {formatCurrency(total.subtotal)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{total.itemCount} pcs ({total.totalItems} jenis produk)</p>
          <div className="flex gap-2 pt-1">
            <button
              onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); if (confirm('Reset?')) { clearCart(); setCurrentPage('pos') } }}
              className="flex-1 h-11 bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 rounded-xl font-bold text-[13px] text-slate-500 dark:text-slate-300 transition-colors"
            >
              Reset
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); setCurrentPage('keuntungan') }}
              className="flex-[2] h-11 bg-gradient-to-r from-primary-500 to-primary-600 active:from-primary-600 active:to-primary-700 rounded-xl font-bold text-[13px] text-white transition-all shadow-lg shadow-primary-500/25"
            >
              Lanjut
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
