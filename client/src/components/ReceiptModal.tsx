import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Receipt } from 'lucide-react'
import type { Transaction } from '../types'
import { formatCurrency } from '../lib/utils'
import { useUIStore } from '../stores/uiStore'

const paymentMethodLabels: Record<string, string> = {
  cash: 'TUNAI',
  qris: 'QRIS',
  transfer: 'TRANSFER',
}

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const { addToast } = useUIStore()

  const handlePrint = () => {
    if (!receiptRef.current) return

    const receiptContent = receiptRef.current.innerHTML

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      addToast('error', 'Tidak dapat membuka jendela cetak')
      return
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Struk - ${transaction.id.slice(0, 8)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      justify-content: center;
    }
    .receipt {
      width: 280px;
      background: white;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .receipt-header {
      text-align: center;
      border-bottom: 1px dashed #333;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .store-name {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .store-info {
      font-size: 9px;
      color: #666;
      margin-top: 4px;
      line-height: 1.4;
    }
    .receipt-meta {
      font-size: 9px;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .receipt-items {
      border-top: 1px dashed #333;
      border-bottom: 1px dashed #333;
      padding: 8px 0;
      margin-bottom: 8px;
    }
    .receipt-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .item-name {
      flex: 1;
      max-width: 140px;
      line-height: 1.3;
    }
    .item-qty {
      text-align: center;
      min-width: 40px;
    }
    .item-price {
      text-align: right;
      min-width: 60px;
    }
    .receipt-total {
      font-size: 11px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #333;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .total-main {
      font-size: 14px;
      font-weight: 700;
    }
    .receipt-footer {
      text-align: center;
      font-size: 9px;
      color: #666;
      line-height: 1.5;
    }
    .divider {
      border-top: 1px dashed #333;
      margin: 8px 0;
    }
    .payment-badge {
      display: inline-block;
      padding: 2px 6px;
      background: #f0f0f0;
      border-radius: 2px;
      font-size: 9px;
      font-weight: 600;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; width: 80mm; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    ${receiptContent.replace(/class="[^"]*"/g, '').replace(/text-\[([^\]]+)\]/g, '')}
  </div>
  <script>
    window.onload = function() { window.print(); window.close(); }
  </script>
</body>
</html>
    `)
    printWindow.document.close()
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatTime = (d: string) => {
    const date = new Date(d)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const totalItems = transaction.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl max-w-[340px] w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-primary-500" />
                  <h2 className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Struk Digital</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Thermal Receipt */}
              <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                <div
                  ref={receiptRef}
                  className="w-[280px] bg-white text-slate-900 p-4 shadow-lg rounded-sm"
                  style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
                >
                  {/* Header */}
                  <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                    <div className="text-lg font-bold tracking-widest">KASIRKU</div>
                    <div className="text-[9px] text-slate-600 mt-1 leading-relaxed">
                      Toko Zhafar<br />
                      Jl. Contoh No. 123<br />
                      Tel: 0812-3456-7890
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-[9px] leading-relaxed mb-3">
                    <div className="flex justify-between">
                      <span>No:</span>
                      <span>#{transaction.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{formatDate(transaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{formatTime(transaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{transaction.tabLabel}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span>Pembayaran:</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-semibold">
                        {paymentMethodLabels[transaction.paymentMethod] || 'TUNAI'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-b border-dashed border-slate-300 py-2 mb-3">
                    <div className="flex justify-between text-[9px] text-slate-500 font-medium mb-2">
                      <span className="flex-1">Item</span>
                      <span className="w-10 text-center">Qty</span>
                      <span className="w-16 text-right">Harga</span>
                    </div>
                    {transaction.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start mb-2 last:mb-0">
                        <span className="flex-1 text-[10px] leading-tight pr-2">{item.productName}</span>
                        <span className="w-10 text-center text-[10px]">{item.quantity}</span>
                        <span className="w-16 text-right text-[10px] tabular-nums">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="text-[10px] space-y-1 pb-2 border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} pcs):</span>
                      <span className="tabular-nums">{formatCurrency(transaction.subtotal)}</span>
                    </div>
                    {transaction.discount > 0 && (
                      <div className="flex justify-between text-success-600">
                        <span>Diskon:</span>
                        <span className="tabular-nums">-{formatCurrency(transaction.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-dashed border-slate-300">
                      <span className="font-bold text-[12px]">TOTAL:</span>
                      <span className="font-bold text-[12px] tabular-nums">Rp {transaction.total.toLocaleString('id-ID')}</span>
                    </div>
                    {transaction.amountPaid != null && (
                      <div className="flex justify-between">
                        <span>Dibayar:</span>
                        <span className="tabular-nums">{formatCurrency(transaction.amountPaid)}</span>
                      </div>
                    )}
                    {transaction.change != null && transaction.change > 0 && (
                      <div className="flex justify-between text-primary-600 font-medium">
                        <span>Kembalian:</span>
                        <span className="tabular-nums">{formatCurrency(transaction.change)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-center text-[9px] text-slate-600 pt-3 leading-relaxed">
                    <div className="font-medium mb-1">================================</div>
                    <div className="italic">Terima kasih telah berbelanja!</div>
                    <div className="text-slate-400 mt-2 text-[8px]">
                      Powered by Kasirku POS
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="w-full h-11 bg-gradient-to-r from-primary-500 to-primary-600 active:from-primary-600 active:to-primary-700 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all"
                >
                  <Printer size={18} />
                  Cetak Struk
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
