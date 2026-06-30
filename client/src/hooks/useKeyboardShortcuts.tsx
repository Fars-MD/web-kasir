import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Escape and F-keys even in inputs
        if (e.key !== 'Escape' && !e.key.startsWith('F')) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const defaultShortcuts = [
    { keys: 'F2', description: 'Bayar / Proses Transaksi' },
    { keys: 'F3', description: 'Fokus ke Pencarian Produk' },
    { keys: 'F4', description: 'Tambah Produk Baru' },
    { keys: 'Ctrl + K', description: 'Pencarian Global' },
    { keys: 'Escape', description: 'Tutup Modal / Batal' },
    { keys: 'Ctrl + D', description: 'Toggle Dark Mode' },
    { keys: 'Home', description: 'Ke Beranda/POS' },
    { keys: 'P', description: 'Ke Halaman Produk' },
    { keys: 'S', description: 'Ke Halaman Stok' },
    { keys: 'D', description: 'Ke Dashboard' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Shortcut Keyboard</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            Esc
          </button>
        </div>
        <div className="space-y-2">
          {defaultShortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-300">{s.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
