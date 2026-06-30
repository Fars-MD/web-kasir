import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}

const config = {
  success: { Icon: CheckCircle, border: 'border-l-emerald-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  error: { Icon: XCircle, border: 'border-l-red-500', bg: 'bg-red-50', iconColor: 'text-red-500' },
  warning: { Icon: AlertTriangle, border: 'border-l-amber-500', bg: 'bg-amber-50', iconColor: 'text-amber-500' },
}

export function Toast({ id, type, message }: ToastProps) {
  const removeToast = useUIStore((s) => s.removeToast)
  const { Icon, border, bg, iconColor } = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={`flex items-center gap-2.5 border-l-4 ${border} ${bg} rounded-xl px-3 py-2.5 shadow-lg min-w-[240px] max-w-[calc(100vw-1.5rem)]`}
    >
      <Icon size={16} className={`shrink-0 ${iconColor}`} />
      <p className="text-[12px] font-medium flex-1 text-slate-700">{message}</p>
      <button onClick={() => removeToast(id)} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
        <X size={14} />
      </button>
    </motion.div>
  )
}
