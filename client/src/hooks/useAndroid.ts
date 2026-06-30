import { useEffect, useCallback, useRef } from 'react'

export function useHaptic() {
  return useCallback((pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
    if (!navigator.vibrate) return
    switch (pattern) {
      case 'light': navigator.vibrate(10); break
      case 'medium': navigator.vibrate(20); break
      case 'heavy': navigator.vibrate(40); break
      case 'success': navigator.vibrate([10, 30, 10]); break
      case 'error': navigator.vibrate([50, 50, 50]); break
    }
  }, [])
}

export function useBackButton(onBack: () => void) {
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      e.preventDefault()
      onBack()
    }
    window.addEventListener('popstate', handler)
    window.history.pushState(null, '', window.location.href)
    return () => window.removeEventListener('popstate', handler)
  }, [onBack])
}

export function useSwipeToDelete(
  onDelete: () => void,
  options?: { threshold?: number; direction?: 'left' | 'right' }
) {
  const threshold = options?.threshold ?? 80
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      isDragging.current = true
      el.style.transition = 'none'
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      currentX.current = e.touches[0].clientX - startX.current
      const dir = options?.direction ?? 'left'
      const offset = dir === 'left' ? Math.min(0, currentX.current) : Math.max(0, currentX.current)
      el.style.transform = `translateX(${offset}px)`
      el.style.opacity = `${1 - Math.abs(offset) / 300}`
    }

    const handleTouchEnd = () => {
      if (!isDragging.current) return
      isDragging.current = false
      el.style.transition = 'transform 0.2s ease, opacity 0.2s ease'
      if (Math.abs(currentX.current) > threshold) {
        el.style.transform = `translateX(${currentX.current > 0 ? '100%' : '-100%'})`
        el.style.opacity = '0'
        setTimeout(onDelete, 150)
      } else {
        el.style.transform = 'translateX(0)'
        el.style.opacity = '1'
      }
      currentX.current = 0
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onDelete, threshold, options?.direction])

  return ref
}

export function useRipple() {
  const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left - size / 2
    const y = clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px; left:${x}px; top:${y}px;
      background:currentColor; opacity:0.12;
      transform:scale(0); animation:ripple-expand 0.5s ease-out forwards;
    `
    el.style.position = el.style.position || 'relative'
    el.style.overflow = 'hidden'
    el.appendChild(ripple)
    setTimeout(() => ripple.remove(), 500)
  }, [])

  return createRipple
}
