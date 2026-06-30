import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: (theme) => {
        const resolved = resolveTheme(theme)
        set({ theme, resolvedTheme: resolved })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(resolved)
        }
      },
    }),
    {
      name: 'kasirku-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme)
          state.resolvedTheme = resolved
          if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(resolved)
          }
        }
      },
    }
  )
)

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const resolved = e.matches ? 'dark' : 'light'
      useThemeStore.setState({ resolvedTheme: resolved })
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
    }
  })
}
