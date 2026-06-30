import { useState, useEffect, useRef } from 'react'
import { Search, Download, Printer, Package, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProductStore } from '../stores/productStore'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'

export function PriceListPage() {
  const { products, categories, fetchProducts, fetchCategories } = useProductStore()
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [selectedTag, setSelectedTag] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchProducts(); fetchCategories(); api.products.tags().then(setAllTags).catch(() => {}) }, [fetchProducts, fetchCategories])

  const filtered = products
    .filter(p => {
      const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags?.toLowerCase().includes(search.toLowerCase())
      const mc = selectedCat === 'all' || p.categoryId === selectedCat
      const mt = !selectedTag || p.tags?.split(',').some(t => t.trim() === selectedTag)
      return ms && mc && mt
    })
    .sort((a, b) => sortBy === 'name' ? a.name.localeCompare(b.name) : a.sellPrice - b.sellPrice)

  const lowStockCount = filtered.filter(p => p.stock <= p.minStock && p.stock > 0).length
  const outOfStockCount = filtered.filter(p => p.stock === 0).length

  const handlePrint = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>Daftar Harga</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:20px;color:#1a1a1a}h1{text-align:center;font-size:20px}.sub{text-align:center;color:#666;font-size:12px;margin-bottom:16px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#f0f0f0;padding:6px 8px;text-align:left;border:1px solid #ccc;font-weight:600}td{padding:5px 8px;border:1px solid #ddd}.r{text-align:right;font-weight:600}.f{margin-top:16px;text-align:center;font-size:10px;color:#999}@media print{body{padding:10px}}</style></head><body><h1>DAFTAR HARGA PRODUK</h1><p class="sub">Toko Zhafar - ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p><table><thead><tr><th>No</th><th>Nama</th><th>Tags</th><th>Stok</th><th style="text-align:right">Harga</th></tr></thead><tbody>${filtered.map((p,i)=>`<tr><td>${i+1}</td><td>${p.name}</td><td>${p.tags||'-'}</td><td>${p.stock}</td><td class="r">${formatCurrency(p.sellPrice)}</td></tr>`).join('')}</tbody></table><p class="f">Dicetak ${new Date().toLocaleString('id-ID')} | ${filtered.length} produk</p></body></html>`)
    w.document.close(); w.print()
  }

  const handleCSV = () => {
    const h = ['Nama','Kategori','Tags','Stok','Modal','Jual','Margin']
    const r = filtered.map(p => [p.name, p.category?.name||'', p.tags||'-', p.stock, p.costPrice, p.sellPrice, `${((p.sellPrice-p.costPrice)/p.costPrice*100).toFixed(1)}%`])
    const csv = [h.join(','), ...r.map(x=>x.join(','))].join('\n')
    const b = new Blob([csv], { type: 'text/csv' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a'); a.href = u; a.download = `stok-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(u)
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="shrink-0 p-3 sm:p-4 lg:p-6 border-b border-slate-100 dark:border-slate-700 pb-3 lg:pb-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Stok Produk</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {filtered.length} produk
              {outOfStockCount > 0 && (
                <span className="ml-2 text-danger-600 dark:text-danger-400 flex items-center gap-1 inline-flex">
                  <AlertTriangle size={10} /> {outOfStockCount} habis
                </span>
              )}
              {lowStockCount > 0 && (
                <span className="ml-2 text-warning-600 dark:text-warning-400 flex items-center gap-1 inline-flex">
                  <AlertTriangle size={10} /> {lowStockCount} menipis
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-[11px] lg:text-[13px] active:scale-[0.97]">
              <Printer size={13} /><span className="hidden sm:inline">Cetak</span>
            </button>
            <button onClick={handleCSV} className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors text-[11px] lg:text-[13px] active:scale-[0.97] shadow-sm shadow-primary-500/20">
              <Download size={13} />CSV
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2.5 text-[12px] lg:text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-primary-400 dark:focus:border-primary-500 transition-all" />
          </div>
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all appearance-none cursor-pointer">
            <option value="all">Semua</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {allTags.length > 0 && (
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all appearance-none cursor-pointer">
              <option value="">Semua Tag</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all appearance-none cursor-pointer">
            <option value="name">Nama</option>
            <option value="price">Harga</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-4" ref={printRef}>
        {/* Desktop */}
        <table className="hidden lg:table w-full">
          <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700"><tr>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-12">No</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nama</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Kategori</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tags</th>
            <th className="text-right p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-20">Stok</th>
            <th className="text-right p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-32">Harga</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-slate-400 dark:text-slate-500 text-[13px]">Tidak ada produk</td></tr>
            ) : filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
              >
                <td className="p-4 text-[12px] text-slate-400 dark:text-slate-500">{i+1}</td>
                <td className="p-4 text-[12px] font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                <td className="p-4 text-[12px] text-slate-500 dark:text-slate-400">{p.category?.name}</td>
                <td className="p-4 text-[12px]">{p.tags ? <div className="flex flex-wrap gap-1">{p.tags.split(',').map((t,i) => <span key={i} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] rounded-full font-medium">{t.trim()}</span>)}</div> : <span className="text-slate-300 dark:text-slate-600">-</span>}</td>
                <td className="p-4 text-[12px] text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      p.stock === 0
                        ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'
                        : p.stock <= p.minStock
                          ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                          : 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                    }`}>
                      {p.stock === 0 ? 'HABIS' : p.stock <= p.minStock ? 'MENIPIS' : 'AMAN'}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">{p.stock}</span>
                  </div>
                </td>
                <td className="p-4 text-[12px] text-right font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">{formatCurrency(p.sellPrice)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Mobile/Tablet */}
        <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-[13px] text-slate-400 dark:text-slate-500">Tidak ada produk</p>
            </div>
          ) : filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300 dark:text-slate-600 w-5 font-mono">{i+1}</span>
                  <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-7">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{p.category?.name}</span>
                  {p.tags && <div className="flex gap-0.5">{p.tags.split(',').slice(0,2).map((t,i) => <span key={i} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[9px] rounded-full font-medium">{t.trim()}</span>)}</div>}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-[12px] font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">{formatCurrency(p.sellPrice)}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                    p.stock === 0
                      ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'
                      : p.stock <= p.minStock
                        ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
                        : 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
                  }`}>
                    {p.stock === 0 ? 'HABIS' : p.stock <= p.minStock ? 'MENIPIS' : 'AMAN'}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500">{p.stock}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {filtered.length} dari {products.length} produk
          {outOfStockCount > 0 && ` • ${outOfStockCount} habis`}
          {lowStockCount > 0 && ` • ${lowStockCount} menipis`}
        </p>
      </div>
    </div>
  )
}
