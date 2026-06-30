import { Sun, Moon, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../stores/themeStore'
import { cn } from '../lib/utils'

type ThemeOption = 'light' | 'dark' | 'system'

const themeConfig: Record<ThemeOption, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Terang' },
  dark: { icon: Moon, label: 'Gelap' },
  system: { icon: Monitor, label: 'Sistem' },
}

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const themes: ThemeOption[] = ['light', 'dark', 'system']

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
      {themes.map((t) => {
        const active = theme === t
        const Icon = themeConfig[t].icon

        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              'relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
            title={themeConfig[t].label}
          >
            {active && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={16} className="relative z-10" />
          </button>
        )
      })}
    </div>
  )
}
