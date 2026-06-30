import { useState, useEffect, useRef } from 'react'

export function useCountUp(end: number, duration: number = 800) {
  const [count, setCount] = useState(0)
  const prevEnd = useRef(0)

  useEffect(() => {
    if (end === prevEnd.current) return

    const startTime = Date.now()
    const startValue = prevEnd.current
    prevEnd.current = end

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (end - startValue) * eased)
      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}
