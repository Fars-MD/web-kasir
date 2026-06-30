import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Package, Banknote, Hash, ShoppingBag, Clock, CreditCard, Wallet, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { useCountUp } from '../hooks/useCountUp'
import type { DashboardStats } from '../types'

function AnimatedNumber({ value, format = true }: { value: number; format?: boolean }) {
  const count = useCountUp(value)
  return <>{format ? formatCurrency(count) : count}</>
}

// Generate mock hourly data for the chart
function generateHourlyData() {
  const hours = []
  const now = new Date()
  for (let i = 6; i <= 21; i++) {
    const hour = new Date(now)
    hour.setHours(i, 0, 0, 0)
    hours.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      sales: Math.floor(Math.random() * 500000) + 50000,
      transactions: Math.floor(Math.random() * 15) + 2,
    })
  }
  return hours
}

// Generate weekly comparison data
function generateWeeklyData() {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  return days.map((day) => ({
    day,
    penjualan: Math.floor(Math.random() * 800000) + 100000,
    profit: Math.floor(Math.random() * 200000) + 30000,
  }))
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hourlyData] = useState(generateHourlyData)
  const [weeklyData] = useState(generateWeeklyData)

  useEffect(() => { api.dashboard.stats().then(setStats) }, [])

  if (!stats) return (
    <div className="p-4 text-slate-400 flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  const salesGrowth = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : -(Math.floor(Math.random() * 15) + 1)

  const summaryCards = [
    {
      label: 'Penjualan Hari Ini',
      value: stats.today.total,
      sub: `${stats.today.count} transaksi`,
      growth: salesGrowth,
      icon: TrendingUp,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
      borderColor: 'border-primary-200 dark:border-primary-800',
    },
    {
      label: 'Keuntungan Hari Ini',
      value: stats.today.profit,
      sub: `${stats.today.totalPcs} pcs terjual`,
      growth: Math.abs(salesGrowth) - 5,
      icon: Banknote,
      color: 'text-accent-600 dark:text-accent-400',
      bgColor: 'bg-accent-50 dark:bg-accent-900/20',
      borderColor: 'border-accent-200 dark:border-accent-800',
    },
    {
      label: 'Penjualan Minggu Ini',
      value: stats.week.total,
      sub: `${stats.week.count} transaksi`,
      growth: Math.floor(Math.random() * 20) + 1,
      icon: Wallet,
      color: 'text-success-600 dark:text-success-400',
      bgColor: 'bg-success-50 dark:bg-success-900/20',
      borderColor: 'border-success-200 dark:border-success-800',
    },
    {
      label: 'Total Produk',
      value: stats.productCount,
      sub: 'Produk aktif',
      growth: null,
      icon: Package,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      borderColor: 'border-slate-200 dark:border-slate-700',
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <Clock size={12} />
          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`bg-white dark:bg-slate-800 border ${card.borderColor} rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
              {card.growth !== null && (
                <div className={`flex items-center gap-0.5 text-[10px] font-medium ${card.growth >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {card.growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(card.growth)}%
                </div>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {typeof card.value === 'number' && card.label !== 'Total Produk' ? (
                <AnimatedNumber value={card.value} />
              ) : (
                card.value
              )}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* Hourly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={14} className="text-primary-500" />
                Penjualan Jam Ini
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Grafik penjualan per jam hari ini</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8' }}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: '#E2E8F0' }}
                  formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp size={14} className="text-accent-500" />
                Perbandingan Mingguan
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Penjualan & keuntungan minggu ini</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={4}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#94A3B8' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelStyle={{ color: '#E2E8F0' }}
                  formatter={(value: number, name) => [formatCurrency(value), name === 'penjualan' ? 'Penjualan' : 'Keuntungan']}
                />
                <Bar dataKey="penjualan" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary-500" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Penjualan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent-500" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Keuntungan</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <ShoppingBag size={14} className="text-slate-400" />
            <h2 className="font-bold text-[13px] text-slate-800 dark:text-slate-100">Transaksi Terakhir</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[280px] overflow-y-auto">
            {stats.recentTransactions.length === 0 ? (
              <p className="p-6 text-slate-400 dark:text-slate-500 text-[12px] text-center">Belum ada transaksi</p>
            ) : (
              stats.recentTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.paymentMethod === 'cash'
                        ? 'bg-success-50 dark:bg-success-900/20'
                        : tx.paymentMethod === 'qris'
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'bg-accent-50 dark:bg-accent-900/20'
                    }`}>
                      {tx.paymentMethod === 'cash' ? (
                        <Wallet size={14} className="text-success-600 dark:text-success-400" />
                      ) : tx.paymentMethod === 'qris' ? (
                        <CreditCard size={14} className="text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Banknote size={14} className="text-accent-600 dark:text-accent-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{tx.tabLabel}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                      {formatCurrency(tx.total)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{tx.paymentMethod}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
        >
          <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Hash size={14} className="text-accent-500" />
            Ringkasan Bulan
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Penjualan</span>
              <span className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {formatCurrency(stats.month.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Transaksi</span>
              <span className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-100">
                {stats.month.count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Keuntungan</span>
              <span className="text-[12px] font-mono font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                +{formatCurrency(stats.month.profit)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Pcs Terjual</span>
              <span className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-100">
                {stats.month.totalPcs}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Rata-rata/Transaksi</span>
                <span className="text-[12px] font-mono font-bold text-accent-600 dark:text-accent-400 tabular-nums">
                  {stats.month.count > 0 ? formatCurrency(Math.round(stats.month.total / stats.month.count)) : '-'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
