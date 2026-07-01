import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  size: number
  delay: number
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#1D4ED8', '#2563EB']

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!active) return
    const p: ConfettiPiece[] = []
    for (let i = 0; i < 60; i++) {
      p.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 6 + 4,
        delay: Math.random() * 0.5,
      })
    }
    setPieces(p)

    const timer = setTimeout(() => setPieces([]), 3000)
    return () => clearTimeout(timer)
  }, [active])

  if (pieces.length === 0) return null

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 2.5s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
