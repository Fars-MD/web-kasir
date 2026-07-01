import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react'
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
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-100 bg-white">
        <button onClick={() => { haptic('light'); setCurrentPage('pos') }} aria-label="Kembali" className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          <ArrowLeft size={18} className="text-slate-600" aria-hidden="true" />
        </button>
        <h1 className="text-[15px] font-bold text-slate-800">Jumlah</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart size={28} className="text-slate-200 mb-2" />
            <p className="text-[13px] font-medium text-slate-400">Belum ada item</p>
          </div>
        ) : (
          cart.map((item, i) => {
            const subtotal = (item.qtyPcs * item.sellPrice) + (item.qtyPack * item.packPrice)
            return (
              <div key={item.productId} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="w-6 text-center text-[11px] text-slate-300 font-mono mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">{item.productName}</p>
                    {item.qtyPcs > 0 && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pcs: {item.qtyPcs} &times; {formatCurrency(item.sellPrice)}</p>
                    )}
                    {item.qtyPack > 0 && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.unitLabel}: {item.qtyPack} &times; {formatCurrency(item.packPrice)}</p>
                    )}
                  </div>
                </div>
                <p className="text-[13px] font-mono font-bold text-slate-800 tabular-nums shrink-0">{formatCurrency(subtotal)}</p>
              </div>
            )
          })
        )}
      </div>

      {cart.length > 0 && (
        <div className="shrink-0 px-4 pt-4 pb-5 sm:pb-5 border-t border-slate-100 bg-white space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-500 font-medium">Total Harga</span>
            <span className="text-lg font-bold font-mono text-blue-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
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
              className="flex-[2] h-11 bg-blue-500 active:bg-blue-600 rounded-xl font-bold text-[13px] text-white transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              Oke <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
