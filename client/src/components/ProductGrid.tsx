import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProductStore } from '../stores/productStore'
import { ProductCard } from './ProductCard'
import { cn } from '../lib/utils'
import type { Product } from '../types'

export function ProductGrid() {
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
      <div className="shrink-0 mb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="search-product"
            autoComplete="off"
            placeholder="Cari produk"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 sm:py-3 text-[13px] focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Hapus pencarian" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={11} className="text-slate-500" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {allCats.map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCat(cat.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap',
              selectedCat === cat.id
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:text-blue-600 active:bg-slate-50'
            )}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      <div className="shrink-0 mb-2 flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-medium">{filtered.length} produk</p>
        {searchQuery && filtered.length > 0 && (
          <p className="text-[10px] text-blue-500 font-medium">{filtered.length} hasil</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
              <Search size={24} className="text-slate-300" />
            </div>
            <p className="text-[13px] font-semibold text-slate-400">Produk tidak ditemukan</p>
            <p className="text-[11px] text-slate-300 mt-1">Coba kata kunci lain</p>
          </div>
        )}
      </div>
    </div>
  )
}
