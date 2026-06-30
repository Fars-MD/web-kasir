import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, X, AlertTriangle } from 'lucide-react'
import { useProductStore } from '../stores/productStore'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { BottomSheet } from '../components/BottomSheet'
import { formatCurrency } from '../lib/utils'
import { api } from '../lib/api'

type SortKey = 'name' | 'sellPrice' | 'costPrice' | 'packPrice' | 'stock'
type SortDir = 'asc' | 'desc'

export function ProductsPage() {
  const { products, categories, fetchProducts, fetchCategories, deleteProduct, updateProduct, createProduct } = useProductStore()
  const { addToast } = useUIStore()
  const haptic = useHaptic()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterTag, setFilterTag] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [form, setForm] = useState({ name: '', categoryId: '', tags: '', description: '', costPrice: 0, sellPrice: 0, packPrice: 0, pcsPerPack: 1, stock: 0, minStock: 5, imageUrl: '' })

  useEffect(() => { fetchProducts(); fetchCategories(); api.products.tags().then(setAllTags).catch(() => {}) }, [fetchProducts, fetchCategories])

  const filtered = useMemo(() => {
    let r = products
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(q) || p.tags?.toLowerCase().includes(q)) }
    if (filterCat !== 'all') r = r.filter(p => p.categoryId === filterCat)
    if (filterTag) r = r.filter(p => p.tags?.split(',').some(t => t.trim() === filterTag))
    return [...r].sort((a, b) => {
      let c = 0
      if (sortKey === 'name') c = a.name.localeCompare(b.name)
      else if (sortKey === 'sellPrice') c = a.sellPrice - b.sellPrice
      else if (sortKey === 'costPrice') c = a.costPrice - b.costPrice
      else if (sortKey === 'packPrice') c = (a.packPrice || 0) - (b.packPrice || 0)
      else if (sortKey === 'stock') c = a.stock - b.stock
      return sortDir === 'asc' ? c : -c
    })
  }, [products, search, filterCat, filterTag, sortKey, sortDir])

  const handleSort = (key: SortKey) => { haptic('light'); if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc') } }
  const SortIcon = ({ col }: { col: SortKey }) => sortKey !== col ? <ArrowUpDown size={12} className="text-slate-300" /> : sortDir === 'asc' ? <ArrowUp size={12} className="text-amber-500" /> : <ArrowDown size={12} className="text-amber-500" />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) { await updateProduct(editingId, form); addToast('success', 'Produk diperbarui') }
      else {
        if (products.find(p => p.name.toLowerCase().trim() === form.name.toLowerCase().trim())) { addToast('warning', 'Produk sudah ada'); return }
        await createProduct(form); addToast('success', 'Produk ditambahkan')
      }
      haptic('success'); setShowForm(false); setEditingId(null); resetForm(); api.products.tags().then(setAllTags).catch(() => {})
    } catch { addToast('error', 'Gagal menyimpan') }
  }

  const handleEdit = (p: any) => { haptic('light'); setForm({ name: p.name, categoryId: p.categoryId, tags: p.tags || '', description: p.description || '', costPrice: p.costPrice, sellPrice: p.sellPrice, packPrice: p.packPrice || 0, pcsPerPack: p.pcsPerPack || 1, stock: p.stock, minStock: p.minStock, imageUrl: p.imageUrl || '' }); setEditingId(p.id); setShowForm(true) }
  const handleDelete = async (id: string) => { haptic('heavy'); if (!confirm('Hapus?')) return; try { await deleteProduct(id); addToast('success', 'Dihapus') } catch { addToast('error', 'Gagal') } }
  const resetForm = () => setForm({ name: '', categoryId: '', tags: '', description: '', costPrice: 0, sellPrice: 0, packPrice: 0, pcsPerPack: 1, stock: 0, minStock: 5, imageUrl: '' })
  const addTag = (t: string) => { haptic('light'); const c = form.tags ? form.tags.split(',').map(x => x.trim()) : []; if (!c.includes(t)) setForm({ ...form, tags: [...c, t].join(',') }) }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-3">Produk</h1>
      </div>

      {/* Form Bottom Sheet */}
      <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditingId(null) }}>
        <div className="flex items-center justify-between pb-3 shrink-0">
          <h2 className="text-[15px] font-bold text-slate-800">{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Nama Produk</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 transition-all ${!editingId && form.name && products.some(p => p.name.toLowerCase().trim() === form.name.toLowerCase().trim()) ? 'focus:ring-amber-200/60' : 'focus:ring-amber-200/60 focus:border-amber-300'}`}
              placeholder="Nama produk" required maxLength={255} />
            {!editingId && form.name && products.some(p => p.name.toLowerCase().trim() === form.name.toLowerCase().trim()) && (
              <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> Sudah ada</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Kategori</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" required>
                <option value="">Pilih</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Tags</label>
              <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="mineral,air" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" maxLength={500} />
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.slice(0, 8).map(t => (
                <button key={t} type="button" onClick={() => addTag(t)} className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200/60 rounded-full text-[11px] font-medium active:bg-amber-100 transition-colors">+ {t}</button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Harga per {categories.find(c => c.id === form.categoryId)?.unitLabel || 'Pack'}</label>
              <input type="number" value={form.packPrice || ''} onChange={e => setForm({ ...form, packPrice: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" placeholder="0" min={0} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Harga per Pcs</label>
              <input type="number" value={form.sellPrice || ''} onChange={e => setForm({ ...form, sellPrice: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" placeholder="0" required min={0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Isi per Pack</label>
              <input type="number" value={form.pcsPerPack || ''} onChange={e => setForm({ ...form, pcsPerPack: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" placeholder="1" min={1} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Stok (Pcs)</label>
              <input type="number" value={form.stock || ''} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" placeholder="0" min={0} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Foto Produk</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-all text-[13px] text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Pilih Foto
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 2*1024*1024) { addToast('error', 'Maks 2MB'); return } const r = new FileReader(); r.onload = () => setForm({ ...form, imageUrl: r.result as string }); r.readAsDataURL(f) }} />
              </label>
              {form.imageUrl && <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="px-3 py-2 text-[11px] text-red-500 hover:bg-red-50 rounded-xl transition-colors">Hapus</button>}
            </div>
            {form.imageUrl && <div className="mt-2"><img src={form.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200" /></div>}
          </div>
        </form>
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 pb-2">
          <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-[13px] font-medium active:scale-[0.97]">Batal</button>
          <button type="submit" form="product-form" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-[13px] active:scale-[0.97] shadow-md shadow-amber-500/20">Simpan</button>
        </div>
      </BottomSheet>

      {/* Filter */}
      <div className="shrink-0 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto w-full">
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[140px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all appearance-none cursor-pointer">
            <option value="all">Semua</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {allTags.length > 0 && (
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:border-amber-300 transition-all appearance-none cursor-pointer">
              <option value="">Semua Tag</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {(search || filterCat !== 'all' || filterTag) && (
            <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterTag('') }} className="px-3 py-2.5 text-[11px] text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">Reset</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto w-full pb-20 lg:pb-4">
        {/* Desktop */}
        <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600" onClick={() => handleSort('name')}><div className="flex items-center gap-1">Nama <SortIcon col="name" /></div></th>
              <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
              <th className="text-left p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tags</th>
              <th className="text-right p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600" onClick={() => handleSort('packPrice')}><div className="flex items-center justify-end gap-1">Pack <SortIcon col="packPrice" /></div></th>
              <th className="text-right p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600" onClick={() => handleSort('sellPrice')}><div className="flex items-center justify-end gap-1">Pcs <SortIcon col="sellPrice" /></div></th>
              <th className="text-right p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600" onClick={() => handleSort('stock')}><div className="flex items-center justify-end gap-1">Stok <SortIcon col="stock" /></div></th>
              <th className="text-center p-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-slate-400 text-[13px]">Tidak ada produk</td></tr> : filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-amber-50/30 transition-colors">
                  <td className="p-4 text-[12px] font-medium text-slate-700">{p.name}</td>
                  <td className="p-4 text-[12px] text-slate-500">{p.category?.name}</td>
                  <td className="p-4 text-[12px]">{p.tags ? <div className="flex flex-wrap gap-1">{p.tags.split(',').slice(0,2).map((t,i) => <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] rounded-full font-medium">{t.trim()}</span>)}{p.tags.split(',').length > 2 && <span className="text-slate-400 text-[10px]">+{p.tags.split(',').length - 2}</span>}</div> : <span className="text-slate-300">-</span>}</td>
                  <td className="p-4 text-[12px] text-right font-mono text-slate-500 tabular-nums">{p.packPrice > 0 ? formatCurrency(p.packPrice) : '-'}</td>
                  <td className="p-4 text-[12px] text-right font-mono font-bold text-slate-700 tabular-nums">{formatCurrency(p.sellPrice)}</td>
                  <td className="p-4 text-[12px] text-right font-mono text-slate-500 tabular-nums">{p.stock}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleEdit(p)} className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors mr-1"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet */}
        <div className="lg:hidden space-y-2">
          {filtered.length === 0 ? <div className="p-12 text-center text-slate-400 text-[13px]">Tidak ada produk</div> : filtered.map(p => (
            <div key={p.id} className="bg-white border border-slate-200/80 rounded-2xl p-3">
              <div className="flex items-start gap-2.5">
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[12px] font-semibold text-slate-700 truncate">{p.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.category?.name}</p>
                  {p.tags && <div className="flex flex-wrap gap-1 mt-1.5">{p.tags.split(',').slice(0,3).map((t,i) => <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] rounded-full font-medium">{t.trim()}</span>)}</div>}
                </div>
                <div className="flex gap-0.5 ml-1">
                  <button onClick={() => handleEdit(p)} className="p-2.5 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {p.packPrice > 0 && <div><p className="text-[9px] text-slate-400">{p.category?.unitLabel || 'Pack'}</p><p className="text-[11px] font-mono text-slate-500 tabular-nums">{formatCurrency(p.packPrice)}</p></div>}
                  <div><p className="text-[9px] text-slate-400">Pcs</p><p className="text-[11px] font-mono font-bold text-slate-700 tabular-nums">{formatCurrency(p.sellPrice)}</p></div>
                </div>
                <div className="text-right"><p className="text-[9px] text-slate-400">Stok</p><p className="text-[11px] font-mono text-slate-500 tabular-nums">{p.stock}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => { haptic('medium'); resetForm(); setEditingId(null); setShowForm(true) }} className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-90 transition-transform">
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
