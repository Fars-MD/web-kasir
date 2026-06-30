import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useThemeStore } from './stores/themeStore'

// Initialize theme before rendering
const initTheme = () => {
  const state = useThemeStore.getState()
  const theme = state.theme
  let resolved: 'light' | 'dark'

  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } else {
    resolved = theme
  }

  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
