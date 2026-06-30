import { useEffect, useState } from 'react'
import { Search, ShoppingCart, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProductStore } from '../stores/productStore'
import { ProductCard } from './ProductCard'
import { cn } from '../lib/utils'
import type { Product } from '../types'

interface ProductGridProps {
  onCartTap?: () => void
  cartCount?: number
}

export function ProductGrid({ onCartTap, cartCount = 0 }: ProductGridProps) {
  const { products, categories, searchQuery, setSearchQuery, fetchProducts, fetchCategories } = useProductStore()
  const [filtered, setFiltered] = useState<Product[]>([])
  const [selectedCat, setSelectedCat] = useState('Semua')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  useEffect(() => {
    let r = products
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.tags?.toLowerCase().includes(q))
    }
    if (selectedCat !== 'Semua') {
      r = r.filter(p => p.categoryId === selectedCat)
    }
    setFiltered(r)
  }, [searchQuery, selectedCat, products])

  const allCats = [{ id: 'Semua', name: 'Semua' }, ...categories]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search + Cart */}
      <div className="shrink-0 mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={10} className="text-slate-500" />
            </button>
          )}
        </div>
        {onCartTap && (
          <button onClick={onCartTap} className="sm:hidden relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 active:bg-slate-50 transition-colors shrink-0">
            <ShoppingCart size={18} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="shrink-0 flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {allCats.map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCat(cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap',
              selectedCat === cat.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'
            )}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      <p className="shrink-0 mb-2 text-[10px] text-slate-400 font-medium">{filtered.length} produk</p>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <AnimatePresence>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-medium text-slate-400">Produk tidak ditemukan</p>
            <p className="text-[11px] text-slate-300 mt-1">Coba kata kunci lain</p>
          </div>
        )}
      </div>
    </div>
  )
}
