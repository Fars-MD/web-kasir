import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  peekHeight?: number
  fullHeight?: number
}

export function BottomSheet({ open, onClose, children, peekHeight, fullHeight }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const sheetHeight = useRef(0)
  const [expanded, setExpanded] = useState(false)

  const getPeekH = () => peekHeight ?? window.innerHeight * 0.5
  const getFullH = () => fullHeight ?? window.innerHeight * 0.88

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!sheetRef.current) return
    startY.current = e.touches[0].clientY
    sheetHeight.current = expanded ? getFullH() : getPeekH()
    sheetRef.current.style.transition = 'none'
  }, [expanded])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!sheetRef.current) return
    const delta = e.touches[0].clientY - startY.current
    const h = Math.max(getPeekH(), Math.min(getFullH(), sheetHeight.current - delta))
    sheetRef.current.style.height = `${h}px`
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!sheetRef.current) return
    sheetRef.current.style.transition = 'height 0.3s cubic-bezier(0.2, 0, 0, 1)'
    const delta = e.changedTouches[0].clientY - startY.current
    const h = sheetHeight.current - delta
    if (h > (getPeekH() + getFullH()) / 2) {
      sheetRef.current.style.height = `${getFullH()}px`
      setExpanded(true)
    } else if (delta > 50) {
      onClose()
    } else {
      sheetRef.current.style.height = `${getPeekH()}px`
      setExpanded(false)
    }
  }, [onClose])

  useEffect(() => { if (!open) setExpanded(false) }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bs-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col"
            style={{
              height: `${getPeekH()}px`,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              touchAction: 'none',
              willChange: 'height',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing" aria-label="Tarik untuk menutup" role="img">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 overscroll-contain">
              {children}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
