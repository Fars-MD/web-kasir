import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { POSPage } from './pages/POSPage'
import { ProductsPage } from './pages/ProductsPage'
import { DashboardPage } from './pages/DashboardPage'
import { PriceListPage } from './pages/PriceListPage'
import { JumlahPage } from './pages/JumlahPage'
import { KeuntunganPage } from './pages/KeuntunganPage'
import { TransactionHistoryPage } from './pages/TransactionHistoryPage'
import { Toast } from './components/Toast'
import { useUIStore } from './stores/uiStore'
import { useThemeStore } from './stores/themeStore'
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts'
import { useState, useEffect } from 'react'

const pageVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
}

export default function App() {
  const currentPage = useUIStore((s) => s.currentPage)
  const setCurrentPage = useUIStore((s) => s.setCurrentPage)
  const toasts = useUIStore((s) => s.toasts)
  const { setTheme, theme } = useThemeStore()
  const [showHelp, setShowHelp] = useState(false)

  // Apply theme class on mount and changes
  useEffect(() => {
    document.documentElement.classList.toggle('theme-transition', true)
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'F2',
      action: () => {
        if (currentPage === 'pos') {
          setCurrentPage('jumlah')
        }
      },
      description: 'Bayar',
    },
    {
      key: 'F3',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Cari"]')
        searchInput?.focus()
      },
      description: 'Fokus pencarian',
    },
    {
      key: 'F1',
      action: () => setShowHelp(true),
    },
    {
      key: 'Escape',
      action: () => {
        if (showHelp) {
          setShowHelp(false)
        } else if (['jumlah', 'keuntungan'].includes(currentPage)) {
          setCurrentPage('pos')
        }
      },
    },
    {
      key: 'd',
      ctrl: true,
      action: () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
      },
      description: 'Toggle dark mode',
    },
    {
      key: 'Home',
      action: () => setCurrentPage('pos'),
    },
    {
      key: 'p',
      action: () => !['jumlah', 'keuntungan'].includes(currentPage) && setCurrentPage('products'),
    },
    {
      key: 's',
      action: () => !['jumlah', 'keuntungan'].includes(currentPage) && setCurrentPage('priceList'),
    },
    {
      key: 'r',
      action: () => !['jumlah', 'keuntungan'].includes(currentPage) && setCurrentPage('riwayat'),
    },
    {
      key: 'd',
      action: () => !['jumlah', 'keuntungan'].includes(currentPage) && setCurrentPage('dashboard'),
    },
  ])

  const renderPage = () => {
    switch (currentPage) {
      case 'pos': return <POSPage key="pos" />
      case 'products': return <ProductsPage key="products" />
      case 'dashboard': return <DashboardPage key="dashboard" />
      case 'priceList': return <PriceListPage key="priceList" />
      case 'jumlah': return <JumlahPage key="jumlah" />
      case 'keuntungan': return <KeuntunganPage key="keuntungan" />
      case 'riwayat': return <TransactionHistoryPage key="riwayat" />
      default: return <POSPage key="pos" />
    }
  }

  const showSidebar = !['jumlah', 'keuntungan'].includes(currentPage)

  return (
    <div className="h-screen flex flex-col sm:flex-row overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
      {showSidebar && <Sidebar />}
      <main className="flex-1 min-h-0 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[60] space-y-2 max-w-[calc(100vw-1.5rem)]">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  )
}
