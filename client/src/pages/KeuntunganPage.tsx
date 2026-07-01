import { ArrowLeft, TrendingUp, TrendingDown, Check, Loader2, Box, Package } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import { Confetti } from '../components/Confetti'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { CartItem } from '../types'

function ItemProfitCard({ item, index }: { item: CartItem; index: number }) {
  const modalPerPcs = item.costPrice / item.pcsPerPack
  const pcsRev = item.qtyPcs * item.sellPrice
  const pcsCost = item.qtyPcs * modalPerPcs
  const pcsProfit = pcsRev - pcsCost

  const packRev = item.qtyPack * item.packPrice
  const packCost = item.qtyPack * item.costPrice
  const packProfit = packRev - packCost

  const totalRev = pcsRev + packRev
  const totalProfit = pcsProfit + packProfit
  const margin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2"
    >
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-semibold text-slate-800">{item.productName}</p>
        {totalProfit >= 0 ? (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 shrink-0 ml-2">
            <TrendingUp size={12} />+{formatCurrency(totalProfit)}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1 shrink-0 ml-2">
            <TrendingDown size={12} />{formatCurrency(totalProfit)}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {item.qtyPcs > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Box size={10} className="text-blue-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.qtyPcs} Pcs &times; {formatCurrency(item.sellPrice)}</span>
            <div className="ml-auto flex gap-2 tabular-nums">
              <span>M: {formatCurrency(pcsCost)}</span>
              <span className={pcsProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>{pcsProfit >= 0 ? '+' : ''}{formatCurrency(pcsProfit)}</span>
            </div>
          </div>
        )}
        {item.qtyPack > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Package size={10} className="text-blue-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.qtyPack} {item.unitLabel} &times; {formatCurrency(item.packPrice)}</span>
            <div className="ml-auto flex gap-2 tabular-nums">
              <span>M: {formatCurrency(packCost)}</span>
              <span className={packProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>{packProfit >= 0 ? '+' : ''}{formatCurrency(packProfit)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${margin > 0 ? 'bg-emerald-400' : margin < 0 ? 'bg-red-400' : 'bg-slate-300'}`}
            style={{ width: `${Math.min(Math.abs(margin), 100)}%` }}
          />
        </div>
        <span className={`text-[9px] font-mono font-semibold tabular-nums ${margin > 0 ? 'text-emerald-600' : margin < 0 ? 'text-red-500' : 'text-slate-400'}`}>
          {margin > 0 ? '+' : ''}{margin.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  )
}

export function KeuntunganPage() {
  const { cart, clearCart } = useTransactionStore()
  const { setCurrentPage, addToast } = useUIStore()
  const haptic = useHaptic()
  const total = useTransactionStore((s) => s.getCartTotal())
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const totalModal = cart.reduce(
    (s, i) => s + (i.costPrice / i.pcsPerPack * i.qtyPcs) + (i.costPrice * i.qtyPack),
    0
  )
  const totalProfit = total.subtotal - totalModal

  const handleDone = async () => {
    if (saving || cart.length === 0) return
    haptic('heavy')
    setSaving(true)
    try {
      const items: { productId: string; quantity: number; unitType: 'pcs' | 'pack' }[] = []
      for (const i of cart) {
        if (i.qtyPcs > 0) items.push({ productId: i.productId, quantity: i.qtyPcs, unitType: 'pcs' })
        if (i.qtyPack > 0) items.push({ productId: i.productId, quantity: i.qtyPack, unitType: 'pack' })
      }
      await api.transactions.create({
        items,
        discount: 0, paymentMethod: 'cash', amountPaid: total.subtotal, tabLabel: 'POS',
      })
      setShowConfetti(true)
      addToast('success', 'Transaksi tersimpan, stok dikurangi')
      clearCart()
      setTimeout(() => setCurrentPage('pos'), 800)
    } catch (e: any) {
      addToast('error', e?.message || 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const maxVal = Math.max(total.subtotal, totalModal, 1)

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="h-full flex flex-col bg-slate-50">
        <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 bg-white">
          <button onClick={() => { haptic('light'); setCurrentPage('jumlah') }} aria-label="Kembali" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <ArrowLeft size={18} className="text-slate-600" aria-hidden="true" />
          </button>
          <h1 className="text-[15px] font-bold text-slate-800">Keuntungan</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.map((item, i) => (
            <ItemProfitCard key={item.productId} item={item} index={i} />
          ))}
        </div>

        {cart.length > 0 && (
          <div className="shrink-0 px-4 pt-4 pb-5 sm:pb-5 border-t border-slate-100 bg-white space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-500">Uang Masuk (Penjualan)</span>
                <span className="font-mono font-bold text-blue-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(total.subtotal / maxVal) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-slate-500">Uang Keluar (Modal)</span>
                <span className="font-mono font-bold text-slate-600 tabular-nums">{formatCurrency(totalModal)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalModal / maxVal) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[13px] pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-700">Keuntungan</span>
                <span className={`font-mono font-bold tabular-nums ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {totalProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalProfit))}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); if (confirm('Reset?')) { clearCart(); setCurrentPage('pos') } }}
                className="flex-1 h-11 bg-slate-100 active:bg-slate-200 rounded-xl font-bold text-[13px] text-slate-500 transition-colors"
              >
                Reset
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); handleDone() }}
                disabled={saving}
                className="flex-[2] h-11 bg-blue-500 active:bg-blue-600 disabled:bg-slate-300 rounded-xl font-bold text-[13px] text-white transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan\u2026</> : <><Check size={16} aria-hidden="true" /> Selesai</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
