import { Hop as Home, LayoutGrid, ClipboardList, ChartBar as BarChart3, Keyboard, Receipt } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../lib/utils'

const navItems = [
  { id: 'pos' as const, label: 'Beranda', icon: Home },
  { id: 'products' as const, label: 'Produk', icon: LayoutGrid },
  { id: 'priceList' as const, label: 'Stok', icon: ClipboardList },
  { id: 'riwayat' as const, label: 'Riwayat', icon: Receipt },
  { id: 'dashboard' as const, label: 'Stats', icon: BarChart3 },
]

export function Sidebar() {
  const { currentPage, setCurrentPage } = useUIStore()
  const haptic = useHaptic()

  const handleNav = (id: typeof navItems[number]['id']) => {
    haptic('light')
    setCurrentPage(id)
  }

  return (
    <>
      {/* TABLET: 64px icon rail */}
      <div className="hidden sm:flex lg:hidden w-[64px] bg-white dark:bg-slate-800 flex-col items-center py-4 gap-1 shrink-0 border-r border-slate-100 dark:border-slate-700 transition-colors">
        <div className="mb-4 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-500/20">
          <span className="text-white font-extrabold text-[10px]">K</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'relative w-11 h-11 flex items-center justify-center rounded-2xl transition-colors',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tablet-nav"
                    className="absolute inset-0.5 bg-primary-50 dark:bg-primary-900/30 rounded-[14px]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} className="relative z-10" />
              </motion.button>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 items-center py-2">
          <ThemeToggle />
        </div>
      </div>

      {/* DESKTOP: 68px icon rail */}
      <div className="hidden lg:flex w-[68px] bg-white dark:bg-slate-800 flex-col items-center py-5 gap-1 shrink-0 border-r border-slate-100 dark:border-slate-700 transition-colors">
        <div className="mb-5 w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <span className="text-white font-extrabold text-xs">K</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNav(item.id)}
                className={cn(
                  'relative w-11 h-11 flex items-center justify-center rounded-2xl transition-colors group',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                )}
                title={item.label}
              >
                {active && (
                  <motion.div
                    layoutId="desktop-nav"
                    className="absolute inset-0.5 bg-primary-50 dark:bg-primary-900/30 rounded-[14px]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} className="relative z-10" />
              </motion.button>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 items-center py-2">
          <ThemeToggle />
          <div className="hidden lg:flex w-8 h-8 items-center justify-center text-slate-400 dark:text-slate-500">
            <Keyboard size={14} />
          </div>
        </div>
      </div>

      {/* PHONE: bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] transition-colors">
          <nav className="flex items-center justify-around h-[64px] max-w-lg mx-auto px-1">
            {navItems.map((item) => {
              const active = currentPage === item.id
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 w-[72px] h-14 rounded-2xl transition-colors',
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="mobile-nav"
                      className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary-500 rounded-b-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    'flex items-center justify-center w-12 h-8 rounded-xl transition-colors',
                    active ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                  )}>
                    <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  </div>
                  <span className={cn(
                    'text-[10px] leading-none',
                    active ? 'font-bold' : 'font-medium'
                  )}>
                    {item.label}
                  </span>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
