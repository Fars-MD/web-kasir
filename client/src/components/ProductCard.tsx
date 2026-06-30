import { Package, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '../types'
import { formatCurrency } from '../lib/utils'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic, useRipple } from '../hooks/useAndroid'

interface ProductCardProps {
  product: Product
}

const categoryEmoji: Record<string, string> = {
  'Minuman': '🥤', 'Rokok': '🚬', 'Makanan': '🍽️', 'Bahan Makanan': '🧂',
  'Shampo': '🧴', 'Sabun Baju & Pewangi': '🫧', 'Obat': '💊',
}

export function ProductCard({ product }: ProductCardProps) {
  const { togglePick } = useTransactionStore()
  const haptic = useHaptic()
  const ripple = useRipple()
  const isOut = product.stock === 0
  const hasPack = product.packPrice > 0
  const emoji = categoryEmoji[product.category?.name || ''] || '📦'

  const addPcs = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOut) return
    haptic('light')
    ripple(e)
    togglePick({ id: product.id, name: product.name, price: product.sellPrice, costPrice: product.costPrice, unitType: 'pcs', unitLabel: 'Pcs' })
  }

  const addPack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOut) return
    haptic('medium')
    ripple(e)
    togglePick({ id: product.id, name: product.name, price: product.packPrice, costPrice: product.costPrice, unitType: 'pack', unitLabel: product.category?.unitLabel || 'Pack' })
  }

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200
      ${isOut
        ? 'opacity-40 cursor-not-allowed border-slate-200'
        : 'cursor-pointer border-slate-200/80 active:scale-[0.97] hover:shadow-lg hover:border-amber-200 hover:-translate-y-0.5'
      }`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <span className="text-3xl opacity-25 select-none">{emoji}</span>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOut ? (
            <span className="px-2 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-md tracking-wider">HABIS</span>
          ) : product.stock <= 10 ? (
            <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500 text-white rounded-md tracking-wider">Sisa {product.stock}</span>
          ) : null}
        </div>
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-semibold bg-white/90 text-slate-500 rounded-md backdrop-blur-sm">
          {product.category?.name}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[12px] text-slate-800 line-clamp-2 mb-2 leading-snug min-h-[1.6rem]">
          {product.name}
        </h3>

        <div className="space-y-0.5 mb-2.5">
          {hasPack && (
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-400 font-medium uppercase tracking-widest">per {product.category?.unitLabel || 'Pack'}</span>
              <span className="text-[11px] font-bold text-slate-800 tabular-nums">{formatCurrency(product.packPrice)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-slate-400 font-medium uppercase tracking-widest">per Pcs</span>
            <span className={`text-[11px] font-bold tabular-nums ${hasPack ? 'text-slate-500' : 'text-slate-800'}`}>
              {formatCurrency(product.sellPrice)}
            </span>
          </div>
        </div>

        {!isOut && (
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={addPcs}
              className="ripple-container flex-1 flex items-center justify-center gap-1 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 active:bg-slate-100 transition-all text-[11px] font-semibold"
            >
              <Box size={12} strokeWidth={2.5} />
              Pcs
            </motion.button>
            {hasPack && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={addPack}
                className="ripple-container flex-1 flex items-center justify-center gap-1 h-9 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-white active:from-amber-500 active:to-amber-600 transition-all text-[11px] font-semibold shadow-md shadow-amber-500/20"
              >
                <Package size={12} strokeWidth={2.5} />
                {product.category?.unitLabel || 'Pack'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
