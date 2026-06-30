import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Package, Check, Loader as Loader2, Sparkles } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'

export function KeuntunganPage() {
  const cart = useTransactionStore((s) => s.cart)
  const { setCurrentPage, addToast } = useUIStore()
  const haptic = useHaptic()
  const [saving, setSaving] = useState(false)

  const totalHarga = cart.reduce((s, i) => s + i.subtotal, 0)
  const totalModal = cart.reduce((s, i) => s + (i.costPrice * i.quantity), 0)
  const totalProfit = totalHarga - totalModal
  const totalItem = cart.reduce((s, i) => s + i.quantity, 0)

  const handleDone = async () => {
    if (saving) return
    haptic('heavy')
    setSaving(true)
    try {
      await api.transactions.create({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, unitType: i.unitType })),
        discount: 0, paymentMethod: 'cash', amountPaid: totalHarga, tabLabel: 'POS',
      })
      addToast('success', 'Transaksi tersimpan, stok dikurangi')
      useTransactionStore.getState().clearCart()
      setCurrentPage('pos')
    } catch (e: any) {
      addToast('error', e?.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const profitPercentage = totalHarga > 0 ? ((totalProfit / totalHarga) * 100).toFixed(1) : '0'

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={() => { haptic('light'); setCurrentPage('jumlah') }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Konfirmasi</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Profit card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 text-white shadow-lg shadow-primary-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/80 font-semibold tracking-wider uppercase">Keuntungan</p>
              <p className="text-2xl font-mono font-bold tabular-nums">+{formatCurrency(totalProfit)}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-white/70">Margin</p>
              <p className="text-lg font-bold">{profitPercentage}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
            <div>
              <p className="text-[9px] text-white/70 font-medium">Total Harga Jual</p>
              <p className="text-[13px] font-bold font-mono tabular-nums">{formatCurrency(totalHarga)}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/70 font-medium">Total Modal</p>
              <p className="text-[13px] font-bold font-mono tabular-nums">{formatCurrency(totalModal)}</p>
            </div>
          </div>
        </motion.div>

        {/* Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-primary-500" />
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Detail Item</p>
          </div>
          {cart.map((item, i) => {
            const profit = (item.unitPrice - item.costPrice) * item.quantity
            return (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </p>
                  <p className="text-[10px] font-mono text-primary-500 font-medium">
                    +{formatCurrency(profit)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-2.5"
        >
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500 dark:text-slate-400">Total Item</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{totalItem} pcs ({cart.length} jenis)</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500 dark:text-slate-400">Total Harga Jual</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatCurrency(totalHarga)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500 dark:text-slate-400">Total Modal</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-200 tabular-nums">{formatCurrency(totalModal)}</span>
          </div>
          <div className="flex justify-between text-[13px] pt-2.5 border-t border-slate-100 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary-500" />
              Keuntungan Bersih
            </span>
            <span className="font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">+{formatCurrency(totalProfit)}</span>
          </div>
        </motion.div>
      </div>

      {/* Button */}
      <div className="shrink-0 px-4 py-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onPointerDown={(e) => { e.preventDefault(); handleDone() }}
          disabled={saving || cart.length === 0}
          className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 active:from-primary-600 active:to-primary-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 rounded-xl font-bold text-[14px] text-white disabled:text-slate-500 dark:disabled:text-slate-500 transition-all shadow-lg shadow-primary-500/25 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>Selesai & Simpan</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
