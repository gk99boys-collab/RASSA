import React, { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import {
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Send,
} from 'lucide-react'

/** Shared liquid motion constants tuned for calm, effortless 60fps transitions */
export const SILK_EASE = [0.16, 1, 0.3, 1] as const

export const LIQUID_SPRING = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 34,
  mass: 0.82,
}

export const SOFT_SPRING = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 28,
  mass: 0.9,
}

/**
 * MagneticButton: responds gently to cursor proximity with a damped spring pull
 * and a soft tactile scale on press.
 */
interface MagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  variant?: 'primary' | 'subtle'
  className?: string
  ariaLabel?: string
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  href,
  target,
  rel,
  variant = 'primary',
  className = '',
  ariaLabel,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 260, damping: 22, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 260, damping: 22, mass: 0.5 })

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    rawX.set(dx * 0.16)
    rawY.set(dy * 0.2)
  }

  const handleLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const styles =
    variant === 'primary'
      ? 'bg-[#0D1217] text-white hover:bg-[#19222B] shadow-[0_10px_28px_-10px_rgba(13,18,23,0.38)]'
      : 'bg-white/80 text-[#0D1217] border border-[#0D1217]/10 hover:border-[#0D1217]/22 hover:bg-white'

  const base = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 cursor-pointer select-none ${styles} ${className}`

  return (
    <motion.div
      ref={ref}
      style={shouldReduceMotion ? undefined : { x, y }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={LIQUID_SPRING}
      className="inline-block"
    >
      {href ? (
        <a href={href} target={target} rel={rel} aria-label={ariaLabel} className={base}>
          {children}
        </a>
      ) : (
        <button type="button" onClick={onClick} aria-label={ariaLabel} className={base}>
          {children}
        </button>
      )}
    </motion.div>
  )
}

/**
 * MinimalSkeleton: soft breathing placeholder while fetching Supabase rows.
 */
export const MinimalSkeleton: React.FC<{
  className?: string
  label?: string
}> = ({ className = 'h-6 w-full', label = 'در حال بارگذاری...' }) => (
  <div className={`minimal-skeleton ${className}`} role="status" aria-label={label} />
)

/**
 * Resolves a clean icon for dynamic Supabase team/member links.
 */
export function renderLinkIcon(type: string, size = 14) {
  switch (type) {
    case 'github':
    case 'gitlab':
      return <Github size={size} strokeWidth={2} />
    case 'linkedin':
      return <Linkedin size={size} strokeWidth={2} />
    case 'telegram':
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return <Send size={size} strokeWidth={2} />
    case 'email':
      return <Mail size={size} strokeWidth={2} />
    case 'phone':
      return <Phone size={size} strokeWidth={2} />
    case 'website':
    case 'portfolio':
      return <Globe size={size} strokeWidth={2} />
    default:
      return <ExternalLink size={size} strokeWidth={2} />
  }
}
