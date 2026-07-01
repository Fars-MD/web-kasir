import { useState, useEffect } from 'react'
import { TrendingUp, Package, Banknote, Hash, ShoppingBag, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { useCountUp } from '../hooks/useCountUp'
import type { DashboardStats } from '../types'

function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const count = useCountUp(value)
  return <>{format ? formatCurrency(count) : count}</>
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => { api.dashboard.stats().then(setStats) }, [])

  if (!stats) return (
    <div className="p-4 text-slate-400 flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  const cards = [
    { label: 'HARI INI', value: stats.today.total, count: stats.today.count, profit: stats.today.profit, pcs: stats.today.totalPcs, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'MINGGU INI', value: stats.week.total, count: stats.week.count, profit: stats.week.profit, pcs: stats.week.totalPcs, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'BULAN INI', value: stats.month.total, count: stats.month.count, profit: stats.month.profit, pcs: stats.month.totalPcs, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'PRODUK', value: stats.productCount, count: null, profit: null, pcs: null, icon: Package, color: 'text-slate-600', bg: 'bg-slate-100' },
  ]

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto pb-20 lg:pb-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{c.label}</p>
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon size={16} className={c.color} />
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-slate-800 tabular-nums">
              {typeof c.value === 'number' && c.label !== 'PRODUK' ? <AnimatedNumber value={c.value} /> : c.value}
            </p>
            {c.count !== null && <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">{c.count} transaksi</p>}
            {c.pcs !== null && c.pcs > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                <Hash size={10} className="text-blue-400" />
                <p className="text-[9px] sm:text-[10px] text-blue-600 font-semibold">{c.pcs} pcs</p>
              </div>
            )}
            {c.profit !== null && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                <Banknote size={10} className="text-emerald-500" />
                <p className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold">+{formatCurrency(c.profit)}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-2">
          <ShoppingBag size={14} className="text-slate-400" />
          <h2 className="font-bold text-[13px] sm:text-sm text-slate-800">Transaksi Terakhir</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentTransactions.length === 0 ? (
            <p className="p-6 text-slate-400 text-[12px] text-center">Belum ada transaksi</p>
          ) : (
            stats.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-700">{tx.tabLabel}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-mono font-bold text-emerald-600 tabular-nums">{formatCurrency(tx.total)}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{tx.paymentMethod}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
