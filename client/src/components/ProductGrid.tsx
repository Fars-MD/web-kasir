import { useEffect, useState, RefObject } from 'react'
import { Search, X, Package } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProductStore } from '../stores/productStore'
import { ProductCard } from './ProductCard'
import { cn } from '../lib/utils'
import type { Product } from '../types'

interface ProductGridProps {
  searchInputRef?: RefObject<HTMLInputElement | null>
}

export function ProductGrid({ searchInputRef }: ProductGridProps) {
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
      {/* Search - Desktop/Tablet only (mobile has its own) */}
      <div className="hidden sm:shrink-0 sm:flex sm:items-center sm:gap-2 sm:mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            ref={searchInputRef as React.Ref<HTMLInputElement>}
            type="text"
            placeholder="Cari produk... (F3)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X size={10} className="text-slate-500 dark:text-slate-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="shrink-0 flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {allCats.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCat(cat.id)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap',
              selectedCat === cat.id
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-700'
            )}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      <div className="shrink-0 mb-2 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {filtered.length} produk
          {selectedCat !== 'Semua' && (
            <span className="text-primary-500 dark:text-primary-400 ml-1">
              di {categories.find(c => c.id === selectedCat)?.name}
            </span>
          )}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-primary-500 dark:text-primary-400 font-medium hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-hide">
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Package size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">Produk tidak ditemukan</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery ? 'Coba kata kunci lain' : 'Pilih kategori lain'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
