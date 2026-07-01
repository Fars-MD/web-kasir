import { Package, Box } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Product } from '../types'
import { formatCurrency } from '../lib/utils'
import { useTransactionStore } from '../stores/transactionStore'
import { useHaptic } from '../hooks/useAndroid'

interface ProductCardProps {
  product: Product
  index?: number
}

const categoryEmoji: Record<string, string> = {
  'Minuman': '🥤', 'Rokok': '🚬', 'Makanan': '🍽️', 'Bahan Makanan': '🧂',
  'Shampo': '🧴', 'Sabun Baju & Pewangi': '🫧', 'Obat': '💊',
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addPcs: addPcsToCart, addPack: addPackToCart } = useTransactionStore()
  const haptic = useHaptic()
  const isOut = product.stock === 0
  const hasPack = product.packPrice > 0
  const emoji = categoryEmoji[product.category?.name || ''] || '📦'

  const addPcs = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOut) return
    haptic('light')
    addPcsToCart({ id: product.id, name: product.name, sellPrice: product.sellPrice, packPrice: product.packPrice, costPrice: product.costPrice, pcsPerPack: product.pcsPerPack, unitLabel: 'Pcs' })
  }

  const addPack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOut) return
    haptic('medium')
    addPackToCart({ id: product.id, name: product.name, sellPrice: product.sellPrice, packPrice: product.packPrice, costPrice: product.costPrice, pcsPerPack: product.pcsPerPack, unitLabel: product.category?.unitLabel || 'Pack' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-200 group
        ${isOut
          ? 'opacity-40 border-slate-200'
          : 'border-slate-200 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 hover:-translate-y-1 active:scale-[0.97]'
        }`}
    >
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} width={400} height={300} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-3 group-hover:scale-105 transition-transform duration-500">
            <span className="text-4xl opacity-30 select-none mb-2">{emoji}</span>
            <p className="text-[11px] font-semibold text-slate-500 text-center leading-tight line-clamp-2 max-w-full">{product.name}</p>
            <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 tabular-nums">{formatCurrency(product.sellPrice)}</p>
          </div>
        )}

        {!isOut && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOut ? (
            <span className="px-2 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-md">HABIS</span>
          ) : product.stock <= 10 ? (
            <span className="px-2 py-0.5 text-[8px] font-bold bg-blue-500 text-white rounded-md animate-pulse">Sisa {product.stock}</span>
          ) : null}
        </div>
        <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-semibold bg-white/90 text-slate-500 rounded-md backdrop-blur-sm">
          {product.category?.name}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-[12px] text-slate-800 line-clamp-2 leading-snug min-h-[2.2rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-medium">Pcs</span>
          <span className="text-[12px] font-bold font-mono text-slate-800 tabular-nums">{formatCurrency(product.sellPrice)}</span>
        </div>

        {hasPack && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-medium">{product.category?.unitLabel || 'Pack'}</span>
            <span className="text-[12px] font-bold font-mono text-slate-800 tabular-nums">{formatCurrency(product.packPrice)}</span>
          </div>
        )}

        {!isOut && (
          <div className="flex gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.03 }}
              onClick={addPcs}
              aria-label={`Tambah ${product.name} per Pcs`}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-50 text-blue-600 active:bg-blue-100 transition-all text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 relative overflow-hidden"
            >
              <Box size={13} strokeWidth={2.5} aria-hidden="true" />
              Pcs
            </motion.button>
            {hasPack && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                onClick={addPack}
                aria-label={`Tambah ${product.name} per ${product.category?.unitLabel || 'Pack'}`}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white active:from-blue-600 active:to-blue-700 transition-all text-[11px] font-semibold shadow-sm shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 relative overflow-hidden group/btn"
              >
                <Package size={13} strokeWidth={2.5} aria-hidden="true" />
                {product.category?.unitLabel || 'Pack'}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
