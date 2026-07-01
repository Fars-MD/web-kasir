import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const prefersReduced = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
      animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
      exit={prefersReduced ? {} : { opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
