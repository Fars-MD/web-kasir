import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CreditCard, Receipt, ArrowRight, Banknote, Smartphone, CircleDollarSign, Search } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import { ReceiptModal } from '../components/ReceiptModal'
import type { Transaction } from '../types'

const paymentMethodLabels: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  cash: { label: 'Tunai', icon: Banknote, color: 'text-success-600 bg-success-50 dark:bg-success-900/30 dark:text-success-400' },
  qris: { label: 'QRIS', icon: Smartphone, color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' },
  transfer: { label: 'Transfer', icon: CircleDollarSign, color: 'text-accent-600 bg-accent-50 dark:bg-accent-900/30 dark:text-accent-400' },
}

export function TransactionHistoryPage() {
  const { addToast } = useUIStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'all' | 'cash' | 'qris' | 'transfer'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.from = dateFrom
      if (dateTo) params.to = dateTo
      const data = await api.transactions.list(Object.keys(params).length > 0 ? params : undefined)
      setTransactions(data)
    } catch {
      addToast('error', 'Gagal memuat transaksi')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = transactions
    if (paymentMethod !== 'all') {
      result = result.filter(t => t.paymentMethod === paymentMethod)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.tabLabel.toLowerCase().includes(q) ||
        t.items.some(i => i.productName.toLowerCase().includes(q))
      )
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [transactions, paymentMethod, searchQuery])

  const handleRowClick = (t: Transaction) => {
    setSelectedTransaction(t)
    setShowReceipt(true)
  }

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0)
  const totalTransactions = filtered.length

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (d: string) => {
    const date = new Date(d)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="shrink-0 p-3 sm:p-4 lg:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Riwayat Transaksi</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {totalTransactions} transaksi • Total: {formatCurrency(totalRevenue)}
            </p>
          </div>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors text-[11px] lg:text-[13px] active:scale-[0.97] shadow-sm shadow-primary-500/20"
          >
            <Receipt size={13} />Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari ID atau item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2.5 text-[12px] lg:text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 focus:border-primary-400 dark:focus:border-primary-500 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all"
            />
          </div>
          <div className="relative">
            <ArrowRight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all"
            />
          </div>
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as typeof paymentMethod)}
            className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-[12px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer</option>
          </select>
          {(dateFrom || dateTo || paymentMethod !== 'all') && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setPaymentMethod('all'); setSearchQuery('') }}
              className="px-3 py-2.5 text-[11px] text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-xl transition-colors font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Receipt size={24} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500">Tidak ada transaksi</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <table className="hidden lg:table w-full">
              <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="text-left p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Metode</th>
                  <th className="text-right p-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((t, i) => {
                  const pm = paymentMethodLabels[t.paymentMethod] || paymentMethodLabels.cash
                  const Icon = pm.icon
                  return (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => handleRowClick(t)}
                      className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-[12px] font-mono text-slate-500 dark:text-slate-400">#{t.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="text-[12px] text-slate-700 dark:text-slate-200">{formatDate(t.createdAt)}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{formatTime(t.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200">
                          {t.items.length} item
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                          {t.items.map(item => item.productName).join(', ')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${pm.color}`}>
                          <Icon size={12} />
                          {pm.label}
                        </span>
                      </td>
                      <td className="p-4 text-[12px] text-right font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                        {formatCurrency(t.total)}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {/* Mobile/Tablet */}
            <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {filtered.map((t, i) => {
                const pm = paymentMethodLabels[t.paymentMethod] || paymentMethodLabels.cash
                const Icon = pm.icon
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleRowClick(t)}
                    className="flex items-center justify-between px-4 py-3 active:bg-slate-50 dark:active:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">#{t.id.slice(0, 8)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${pm.color}`}>
                          <Icon size={10} />
                          {pm.label}
                        </span>
                      </div>
                      <div className="text-[12px] font-medium text-slate-700 dark:text-slate-200 mt-1 truncate">
                        {t.items.length} item: {t.items.slice(0, 2).map(i => i.productName).join(', ')}
                        {t.items.length > 2 && '...'}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDate(t.createdAt)} {formatTime(t.createdAt)}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-[13px] font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                        {formatCurrency(t.total)}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {filtered.length} dari {transactions.length} transaksi
          {filtered.length > 0 && ` • Total: ${formatCurrency(totalRevenue)}`}
        </p>
      </div>

      {/* Receipt Modal */}
      {selectedTransaction && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  )
}
