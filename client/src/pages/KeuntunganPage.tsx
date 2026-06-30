import { useState } from 'react'
import { ArrowLeft, TrendingUp, Package, Check, Loader2 } from 'lucide-react'
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

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 bg-white">
        <button onClick={() => { haptic('light'); setCurrentPage('jumlah') }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-[15px] font-bold text-slate-800">Total Keuntungan</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Profit card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Keuntungan</p>
              <p className="text-xl font-mono font-bold text-emerald-600 tabular-nums">+{formatCurrency(totalProfit)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Harga</p>
              <p className="text-[13px] font-bold font-mono text-slate-700 tabular-nums">{formatCurrency(totalHarga)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Modal</p>
              <p className="text-[13px] font-bold font-mono text-slate-700 tabular-nums">{formatCurrency(totalModal)}</p>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-slate-400" />
            <p className="text-[11px] font-semibold text-slate-500">Detail Item</p>
          </div>
          {cart.map(item => {
            const profit = (item.unitPrice - item.costPrice) * item.quantity
            return (
              <div key={item.productId} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-700 truncate">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-mono font-bold text-slate-800 tabular-nums">{formatCurrency(item.subtotal)}</p>
                  <p className="text-[10px] font-mono text-emerald-500 font-medium">+{formatCurrency(profit)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500">Total Item</span>
            <span className="font-bold text-slate-700">{totalItem} pcs ({cart.length} jenis)</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500">Total Harga</span>
            <span className="font-mono font-bold text-slate-700 tabular-nums">{formatCurrency(totalHarga)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-slate-500">Total Modal</span>
            <span className="font-mono font-bold text-slate-700 tabular-nums">{formatCurrency(totalModal)}</span>
          </div>
          <div className="flex justify-between text-[13px] pt-2.5 border-t border-slate-100">
            <span className="font-bold text-slate-700">Keuntungan Bersih</span>
            <span className="font-mono font-bold text-emerald-600 tabular-nums">+{formatCurrency(totalProfit)}</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="shrink-0 px-4 py-4 border-t border-slate-100 bg-white">
        <button
          onPointerDown={(e) => { e.preventDefault(); handleDone() }}
          disabled={saving || cart.length === 0}
          className="w-full h-12 bg-amber-500 active:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl font-bold text-[14px] text-white transition-colors shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Check size={18} /> Selesai</>}
        </button>
      </div>
    </div>
  )
}
