import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Box, Package } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import type { CartItem } from '../types'

interface ProfitBarProps {
  cart: CartItem[]
  totalHarga: number
  totalModal: number
  profit: number
}

export function ProfitBar({ cart, totalHarga, profit }: ProfitBarProps) {
  const [animVal, setAnimVal] = useState(0)
  const isProfit = profit >= 0
  const maxVal = Math.max(totalHarga, Math.abs(profit), 1)
  const hargaPct = (totalHarga / maxVal) * 100
  const profitPct = Math.abs(profit) > 0 ? (Math.abs(profit) / maxVal) * 100 : 0

  useEffect(() => {
    const timer = setTimeout(() => setAnimVal(1), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isProfit ? (
            <TrendingUp size={20} className="text-emerald-500" />
          ) : (
            <TrendingDown size={20} className="text-red-500" />
          )}
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
            {isProfit ? 'Untung' : 'Rugi'}
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-2xl font-mono font-bold tabular-nums ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {isProfit ? '+' : '-'}{formatCurrency(Math.abs(profit))}
          </motion.p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Harga</span>
            <span className="text-[15px] font-mono font-bold text-blue-600 tabular-nums">{formatCurrency(totalHarga)}</span>
          </div>
          <div className="space-y-1.5 pl-1">
            {cart.map((item) => {
              const pcsRev = item.qtyPcs * item.sellPrice
              const packRev = item.qtyPack * item.packPrice
              return (
                <div key={item.productId} className="border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                  <p className="text-[11px] font-medium text-slate-700">{item.productName}</p>
                  <div className="space-y-0.5 pl-2">
                    {item.qtyPcs > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Box size={10} className="text-blue-400 shrink-0" aria-hidden="true" />
                        <span>{item.qtyPcs} Pcs &times; {formatCurrency(item.sellPrice)}</span>
                        <span className="font-mono text-slate-600 ml-auto tabular-nums">{formatCurrency(pcsRev)}</span>
                      </div>
                    )}
                    {item.qtyPack > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Package size={10} className="text-blue-400 shrink-0" aria-hidden="true" />
                        <span>{item.qtyPack} {item.unitLabel} (isi {item.pcsPerPack} Pcs) &times; {formatCurrency(item.packPrice)}</span>
                        <span className="font-mono text-slate-600 ml-auto tabular-nums">{formatCurrency(packRev)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hargaPct * animVal}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
            />
          </div>
        </div>

        <div className="pt-1">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span className={`font-semibold ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
              {isProfit ? 'Keuntungan' : 'Kerugian'}
            </span>
            <span className={`font-mono font-bold tabular-nums ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
              {isProfit ? '+' : '-'}{formatCurrency(Math.abs(profit))}
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profitPct * animVal}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className={`h-full rounded-full relative ${isProfit ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
