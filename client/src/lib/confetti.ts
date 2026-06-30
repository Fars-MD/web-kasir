import confetti from 'canvas-confetti'

export function fireConfetti() {
  const duration = 2000
  const end = Date.now() + duration

  const colors = ['#38BDF8', '#FACC15', '#22C55E', '#A855F7', '#F472B6']

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

export function fireBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#38BDF8', '#FACC15', '#22C55E', '#A855F7', '#F472B6'],
  })
}
