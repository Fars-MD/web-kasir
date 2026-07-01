import { AnimatePresence } from 'framer-motion'
import { Calculator, Minus, Plus, Trash2, Sigma } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic, useSwipeToDelete } from '../hooks/useAndroid'
import { formatCurrency } from '../lib/utils'
import type { CartItem } from '../types'

function QtyControl({ value, onDecrement, onIncrement, label, minusLabel, plusLabel }: {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  label: string
  minusLabel: string
  plusLabel: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          aria-label={minusLabel}
          className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {value <= 1 ? <Trash2 size={12} className="text-slate-400" aria-hidden="true" /> : <Minus size={12} className="text-slate-400" aria-hidden="true" />}
        </button>
        <span className="w-8 text-center text-[14px] font-bold tabular-nums text-slate-800">{value}</span>
        <button
          onClick={onIncrement}
          aria-label={plusLabel}
          className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center active:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Plus size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQtyPcs, updateQtyPack, removeFromCart } = useTransactionStore()
  const haptic = useHaptic()
  const swipeRef = useSwipeToDelete(() => {
    haptic('medium')
    removeFromCart(item.productId)
  }, { threshold: 80, direction: 'left' })

  const subtotal = (item.qtyPcs * item.sellPrice) + (item.qtyPack * item.packPrice)

  return (
    <div ref={swipeRef} className="relative">
      <div className="absolute inset-0 flex items-center justify-end pr-3 bg-blue-500 rounded-lg">
        <Trash2 size={14} className="text-white" aria-hidden="true" />
      </div>
      <div className="relative bg-white rounded-lg px-3 py-2.5 border border-slate-100 transition-all duration-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{item.productName}</p>
          <p className="text-[13px] font-mono font-bold text-blue-600 tabular-nums shrink-0">{formatCurrency(subtotal)}</p>
        </div>
        <div className="space-y-1.5 pt-2 border-t border-slate-50">
          {item.qtyPcs > 0 && (
            <QtyControl
              value={item.qtyPcs}
              label={`Pcs: ${formatCurrency(item.sellPrice)}`}
              onDecrement={() => { haptic('light'); updateQtyPcs(item.productId, item.qtyPcs - 1) }}
              onIncrement={() => { haptic('light'); updateQtyPcs(item.productId, item.qtyPcs + 1) }}
              minusLabel={item.qtyPcs <= 1 ? `Hapus Pcs ${item.productName}` : `Kurangi Pcs ${item.productName}`}
              plusLabel={`Tambah Pcs ${item.productName}`}
            />
          )}
          {item.qtyPack > 0 && (
            <QtyControl
              value={item.qtyPack}
              label={`${item.unitLabel}: ${formatCurrency(item.packPrice)}`}
              onDecrement={() => { haptic('light'); updateQtyPack(item.productId, item.qtyPack - 1) }}
              onIncrement={() => { haptic('light'); updateQtyPack(item.productId, item.qtyPack + 1) }}
              minusLabel={item.qtyPack <= 1 ? `Hapus ${item.unitLabel} ${item.productName}` : `Kurangi ${item.unitLabel} ${item.productName}`}
              plusLabel={`Tambah ${item.unitLabel} ${item.productName}`}
            />
          )}
        </div>
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
    <div className="w-[320px] lg:w-[400px] bg-slate-50 flex flex-col h-full shrink-0 border-l border-slate-200">
      <div className="px-4 lg:px-5 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <Sigma size={17} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[14px] lg:text-[15px] font-bold text-slate-800">Penjumlahan</h2>
              {total.itemCount > 0 && (
                <p className="text-[9px] lg:text-[10px] text-slate-400 font-medium -mt-0.5">{total.itemCount} item ditambahkan</p>
              )}
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => { haptic('heavy'); if (confirm('Hapus semua item?')) useTransactionStore.getState().clearCart() }}
              className="text-[10px] lg:text-[11px] text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 lg:px-4 py-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <Calculator size={28} className="text-slate-300" aria-hidden="true" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">Belum ada item</p>
            <p className="text-[11px] text-slate-300 mt-1">Pilih produk untuk mulai menghitung</p>
          </div>
        ) : (
          <AnimatePresence>
            {cart.map(item => <CartItemRow key={item.productId} item={item} />)}
          </AnimatePresence>
        )}
      </div>

      {cart.length > 0 && (
        <div className="px-4 lg:px-5 py-4 lg:py-5 bg-white border-t border-slate-200 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] lg:text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
              <p className="text-[9px] lg:text-[10px] text-slate-400 mt-0.5">{total.itemCount} barang ({total.totalItems} jenis)</p>
            </div>
            <span className="text-xl lg:text-2xl font-bold font-mono text-blue-600 tabular-nums">{formatCurrency(total.subtotal)}</span>
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); haptic('heavy'); onJumlah?.() }}
            className="w-full h-12 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-[14px] lg:text-[15px] transition-all shadow-lg shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 flex items-center justify-center gap-2 animate-[pulse-glow_2s_ease-in-out_infinite]"
          >
            <Sigma size={18} aria-hidden="true" />
            Hitung
          </button>
        </div>
      )}
    </div>
  )
}
