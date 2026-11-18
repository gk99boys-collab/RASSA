import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EventLogo, RasaLogo } from './BrandMarks'
import { SILK_EASE } from './MotionPrimitives'

interface MinimalIntroProps {
  onReveal: () => void
  onComplete: () => void
}

/**
 * Serene, ultra-smooth minimalist opening (~1.5s):
 * The RASSA mark softly unblurs on a clean alabaster canvas, the official 8th Event
 * cursor glides along a gentle curve, gives a single calm tap with a delicate
 * concentric ripple, and melts seamlessly into the single-section stage.
 */
export const MinimalIntro: React.FC<MinimalIntroProps> = ({ onReveal, onComplete }) => {
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<'glide' | 'ripple' | 'fade'>('glide')
  const finishedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const finishNow = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    timersRef.current.forEach((id) => window.clearTimeout(id))
    onReveal()
    onComplete()
  }, [onComplete, onReveal])

  useEffect(() => {
    if (shouldReduceMotion) {
      finishNow()
      return
    }

    const t1 = window.setTimeout(() => setPhase('ripple'), 720)
    const t2 = window.setTimeout(() => {
      setPhase('fade')
      onReveal()
    }, 1150)
    const t3 = window.setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true
        onComplete()
      }
    }, 1680)

    timersRef.current = [t1, t2, t3]
    return () => timersRef.current.forEach((id) => window.clearTimeout(id))
  }, [finishNow, onComplete, onReveal, shouldReduceMotion])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        finishNow()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finishNow])

  return (
    <motion.div
      role="presentation"
      onClick={finishNow}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fade' ? 0 : 1 }}
      transition={{ duration: 0.52, ease: SILK_EASE }}
      style={{ pointerEvents: phase === 'fade' ? 'none' : 'auto' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFA] cursor-pointer select-none"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Delicate concentric ripple on cursor tap */}
        {phase !== 'glide' && (
          <>
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.55, opacity: 0.55 }}
              animate={{ scale: 2.3, opacity: 0 }}
              transition={{ duration: 0.85, ease: SILK_EASE }}
              className="absolute w-36 h-36 rounded-full border border-[#009E9A]/45 pointer-events-none"
            />
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.55, opacity: 0.35 }}
              animate={{ scale: 1.75, opacity: 0 }}
              transition={{ duration: 0.72, delay: 0.08, ease: SILK_EASE }}
              className="absolute w-36 h-36 rounded-full border border-[#10A848]/35 pointer-events-none"
            />
          </>
        )}

        {/* Official RASSA Logo softly blooming and gently pulsing on tap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
          animate={
            phase === 'glide'
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : phase === 'ripple'
                ? { opacity: 1, scale: [1, 0.95, 1.03], filter: 'blur(0px)' }
                : { opacity: 0, scale: 1.06, filter: 'blur(6px)' }
          }
          transition={{
            duration: phase === 'ripple' ? 0.38 : 0.55,
            ease: SILK_EASE,
          }}
        >
          <RasaLogo className="w-40 sm:w-48" alt="لوگوی تیم رَسا" />
        </motion.div>

        {/* Official 8th Event cursor gliding smoothly along a soft curve */}
        <motion.div
          aria-hidden="true"
          initial={{ x: 110, y: 92, opacity: 0, scale: 0.9 }}
          animate={
            phase === 'glide'
              ? { x: 18, y: 26, opacity: 1, scale: 1 }
              : phase === 'ripple'
                ? { x: 16, y: 24, opacity: 1, scale: [1, 0.82, 1] }
                : { x: 14, y: 18, opacity: 0, scale: 0.92 }
          }
          transition={{
            duration: phase === 'glide' ? 0.68 : 0.34,
            ease: SILK_EASE,
          }}
          className="absolute pointer-events-none drop-shadow-[0_8px_16px_rgba(13,18,23,0.14)]"
        >
          <EventLogo className="w-7 h-10 sm:w-8 sm:h-11" tilted />
        </motion.div>
      </div>
    </motion.div>
  )
}
