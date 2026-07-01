import { Home, LayoutGrid, ClipboardList, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '../stores/uiStore'
import { useHaptic } from '../hooks/useAndroid'
import { cn } from '../lib/utils'

const navItems = [
  { id: 'pos' as const, label: 'Beranda', icon: Home },
  { id: 'products' as const, label: 'Produk', icon: LayoutGrid },
  { id: 'priceList' as const, label: 'Stok', icon: ClipboardList },
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
      {/* TABLET: icon + label rail */}
      <div className="hidden sm:flex w-[72px] lg:w-[200px] bg-white flex-col py-5 shrink-0 border-r border-slate-100 transition-all duration-200">
        <div className="flex items-center gap-3 px-3 lg:px-4 mb-6">
          <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-extrabold text-[10px]">K</span>
          </div>
          <span className="hidden lg:block text-[13px] font-bold text-slate-700 truncate">Kasirku</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1 px-2 lg:px-3" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const active = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNav(item.id)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 h-11 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                  active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="tablet-nav"
                    className="absolute inset-0 bg-blue-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center justify-center w-11">
                  <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </div>
                <span className={cn(
                  'relative z-10 hidden lg:block text-[12px] font-semibold',
                  active ? 'text-blue-600' : 'text-slate-500'
                )}>
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </nav>
        <div className="lg:hidden flex flex-col items-center mt-4 px-2">
          {navItems.find(i => i.id === currentPage) && (
            <span className="text-[9px] font-bold text-blue-500 tracking-wider uppercase text-center leading-tight">
              {navItems.find(i => i.id === currentPage)!.label}
            </span>
          )}
        </div>
      </div>

      {/* PHONE: floating bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <nav className="flex items-center justify-around h-[64px] max-w-lg mx-auto px-1">
            {navItems.map((item) => {
              const active = currentPage === item.id
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleNav(item.id)}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 w-[72px] h-14 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                    active ? 'text-blue-600' : 'text-slate-400'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-12 h-8 rounded-xl transition-colors relative',
                    active ? 'bg-blue-50' : ''
                  )}>
                    <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                    {active && (
                      <motion.div
                        layoutId="mobile-nav"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
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
