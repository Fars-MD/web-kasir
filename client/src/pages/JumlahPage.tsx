import { ShoppingCart, ArrowLeft } from 'lucide-react'
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
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 bg-white">
        <button onClick={() => { haptic('light'); setCurrentPage('pos') }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-[15px] font-bold text-slate-800">Jumlah</h1>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart size={28} className="text-slate-200 mb-2" />
            <p className="text-[13px] font-medium text-slate-400">Belum ada item</p>
          </div>
        ) : (
          cart.map((item, i) => (
            <div key={item.productId} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-[11px] text-slate-300 font-mono">{i + 1}</span>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{item.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
              </div>
              <p className="text-[13px] font-mono font-bold text-slate-800 tabular-nums">{formatCurrency(item.subtotal)}</p>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {cart.length > 0 && (
        <div className="shrink-0 px-4 pt-4 pb-5 border-t border-slate-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500 font-medium">Total Harga</span>
            <span className="text-lg font-bold font-mono text-emerald-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
          </div>
          <p className="text-[10px] text-slate-400">{total.itemCount} item ({total.totalItems} jenis)</p>
          <div className="flex gap-2 pt-1">
            <button
              onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); if (confirm('Reset?')) { clearCart(); setCurrentPage('pos') } }}
              className="flex-1 h-11 bg-slate-100 active:bg-slate-200 rounded-xl font-bold text-[13px] text-slate-500 transition-colors"
            >
              Reset
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); setCurrentPage('keuntungan') }}
              className="flex-[2] h-11 bg-amber-500 active:bg-amber-600 rounded-xl font-bold text-[13px] text-white transition-colors shadow-lg shadow-amber-500/25"
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
