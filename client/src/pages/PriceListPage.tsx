import { useState, useEffect, useRef } from 'react'
import { Search, Download, Printer } from 'lucide-react'
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-3 sm:p-4 lg:p-6 border-b border-slate-100 pb-3 lg:pb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Stok Produk</h1>
          <div className="flex gap-1.5">
            <button onClick={handlePrint} aria-label="Cetak daftar harga" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-[11px] lg:text-[13px] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <Printer size={13} aria-hidden="true" /><span className="hidden sm:inline">Cetak</span>
            </button>
            <button onClick={handleCSV} aria-label="Download CSV" className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors text-[11px] lg:text-[13px] active:scale-[0.97] shadow-sm shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <Download size={13} aria-hidden="true" />CSV
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" name="search-product" autoComplete="off" placeholder="Cari\u2026" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[12px] lg:text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200/60 focus:border-blue-300 transition-all" />
          </div>
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} name="filter-category" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200/60 focus:border-blue-300 transition-all appearance-none cursor-pointer">
            <option value="all">Semua</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {allTags.length > 0 && (
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} name="filter-tag" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200/60 focus:border-blue-300 transition-all appearance-none cursor-pointer">
              <option value="">Semua Tag</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} name="sort-by" className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-200/60 focus:border-blue-300 transition-all appearance-none cursor-pointer">
            <option value="name">Nama</option>
            <option value="price">Harga</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-4" ref={printRef}>
        {/* Desktop */}
        <table className="hidden lg:table w-full">
          <thead className="sticky top-0 bg-white border-b border-slate-100"><tr>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-12">No</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
            <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tags</th>
            <th className="text-right p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-20">Stok</th>
            <th className="text-right p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-32">Harga</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-[13px]">Tidak ada produk</td></tr> : filtered.map((p,i) => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 text-[12px] text-slate-400">{i+1}</td>
                <td className="p-4 text-[12px] font-medium text-slate-700">{p.name}</td>
                <td className="p-4 text-[12px] text-slate-500">{p.category?.name}</td>
                <td className="p-4 text-[12px]">{p.tags ? <div className="flex flex-wrap gap-1">{p.tags.split(',').map((t,i) => <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full font-medium">{t.trim()}</span>)}</div> : <span className="text-slate-300">-</span>}</td>
                <td className="p-4 text-[12px] text-right font-mono tabular-nums"><span className={p.stock <= p.minStock ? 'text-blue-600 font-bold' : 'text-slate-500'}>{p.stock}</span></td>
                <td className="p-4 text-[12px] text-right font-mono font-bold text-emerald-600 tabular-nums">{formatCurrency(p.sellPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile/Tablet */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? <div className="p-12 text-center text-slate-400 text-[13px]">Tidak ada produk</div> : filtered.map((p,i) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 active:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300 w-5 font-mono">{i+1}</span>
                  <p className="text-[12px] font-medium text-slate-700 truncate">{p.name}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-7">
                  <span className="text-[10px] text-slate-400">{p.category?.name}</span>
                  {p.tags && <div className="flex gap-0.5">{p.tags.split(',').slice(0,2).map((t,i) => <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded-full font-medium">{t.trim()}</span>)}</div>}
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-[12px] font-mono font-bold text-emerald-600 tabular-nums">{formatCurrency(p.sellPrice)}</p>
                <p className={`text-[10px] font-mono tabular-nums ${p.stock <= p.minStock ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>Stok: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-slate-100 bg-white" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">{filtered.length} dari {products.length} produk</p>
      </div>
    </div>
  )
}
