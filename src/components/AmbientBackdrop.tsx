import React, { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

export type SceneKey = 'hero' | 'about' | 'achievement' | 'members'

interface AmbientBackdropProps {
  activeScene: SceneKey
}

/**
 * Subtle spatial coordinates for two ultra-soft ambient gradient blooms.
 * As the user moves between tabs, the atmosphere glides smoothly with a 1.5s ease.
 */
const SCENE_AURAS: Record<
  SceneKey,
  {
    primary: { x: string; y: string; scale: number; color: string }
    secondary: { x: string; y: string; scale: number; color: string }
  }
> = {
  hero: {
    primary: { x: '0%', y: '-12%', scale: 1, color: 'rgba(0, 189, 180, 0.13)' },
    secondary: { x: '-22%', y: '22%', scale: 0.92, color: 'rgba(16, 168, 72, 0.075)' },
  },
  about: {
    primary: { x: '20%', y: '-8%', scale: 1.08, color: 'rgba(0, 155, 160, 0.12)' },
    secondary: { x: '-24%', y: '16%', scale: 0.96, color: 'rgba(229, 37, 42, 0.06)' },
  },
  achievement: {
    primary: { x: '-8%', y: '-14%', scale: 1.06, color: 'rgba(16, 168, 72, 0.11)' },
    secondary: { x: '20%', y: '18%', scale: 0.95, color: 'rgba(229, 37, 42, 0.075)' },
  },
  members: {
    primary: { x: '-18%', y: '-10%', scale: 1.04, color: 'rgba(0, 189, 180, 0.12)' },
    secondary: { x: '22%', y: '20%', scale: 1, color: 'rgba(0, 132, 168, 0.08)' },
  },
}

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ activeScene }) => {
  const shouldReduceMotion = useReducedMotion()
  const aura = SCENE_AURAS[activeScene]

  // Ultra-damped soft pointer glow (desktop only, pure GPU translate3d)
  const pointerX = useMotionValue(-600)
  const pointerY = useMotionValue(-600)
  const smoothX = useSpring(pointerX, { stiffness: 75, damping: 28, mass: 1 })
  const smoothY = useSpring(pointerY, { stiffness: 75, damping: 28, mass: 1 })

  useEffect(() => {
    if (shouldReduceMotion) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e: PointerEvent) => {
      pointerX.set(e.clientX - 240)
      pointerY.set(e.clientY - 240)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [pointerX, pointerY, shouldReduceMotion])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Whisper-soft masked architectural dot field */}
      <div className="absolute inset-0 minimal-dot-field" />

      {/* Primary scene-reactive diffused light bloom */}
      <motion.div
        animate={{
          x: aura.primary.x,
          y: aura.primary.y,
          scale: aura.primary.scale,
          backgroundColor: aura.primary.color,
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
        }
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-[110px] will-change-transform"
      />

      {/* Secondary counterweight light bloom */}
      <motion.div
        animate={{
          x: aura.secondary.x,
          y: aura.secondary.y,
          scale: aura.secondary.scale,
          backgroundColor: aura.secondary.color,
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 1.7, ease: [0.22, 1, 0.36, 1] }
        }
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] rounded-full blur-[115px] will-change-transform"
      />

      {/* Soft cursor-following ambient light */}
      {!shouldReduceMotion && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            background:
              'radial-gradient(circle, rgba(0, 189, 180, 0.085) 0%, rgba(0, 189, 180, 0) 70%)',
          }}
          className="hidden md:block absolute top-0 left-0 w-[480px] h-[480px] rounded-full will-change-transform"
        />
      )}
    </div>
  )
}
