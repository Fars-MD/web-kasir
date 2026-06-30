import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { POSPage } from './pages/POSPage'
import { ProductsPage } from './pages/ProductsPage'
import { DashboardPage } from './pages/DashboardPage'
import { PriceListPage } from './pages/PriceListPage'
import { JumlahPage } from './pages/JumlahPage'
import { KeuntunganPage } from './pages/KeuntunganPage'
import { Toast } from './components/Toast'
import { useUIStore } from './stores/uiStore'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function App() {
  const currentPage = useUIStore((s) => s.currentPage)
  const toasts = useUIStore((s) => s.toasts)

  const renderPage = () => {
    switch (currentPage) {
      case 'pos': return <POSPage key="pos" />
      case 'products': return <ProductsPage key="products" />
      case 'dashboard': return <DashboardPage key="dashboard" />
      case 'priceList': return <PriceListPage key="priceList" />
      case 'jumlah': return <JumlahPage key="jumlah" />
      case 'keuntungan': return <KeuntunganPage key="keuntungan" />
      default: return <POSPage key="pos" />
    }
  }

  const showSidebar = !['jumlah', 'keuntungan'].includes(currentPage)

  return (
    <div className="h-screen flex flex-col sm:flex-row overflow-hidden bg-slate-50">
      {showSidebar && <Sidebar />}
      <main className="flex-1 min-h-0 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15 }}
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
    </div>
  )
}
