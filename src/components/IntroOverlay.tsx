import React, { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PixelCursorLogo } from './PixelArt'

interface IntroOverlayProps {
  onComplete: () => void
  onRevealStart?: () => void
}

type IntroPhase = 'moving' | 'clicking' | 'dissolving' | 'done'

const COLS = 8
const ROWS = 8

/**
 * Section 1 — Intro Animation:
 * A red/white pixel mouse-cursor arrow glides across the screen, lands on the
 * RASA badge and "clicks" (shadow collapses + green/red pixel burst), then the
 * entire screen dissolves away in a staggered pixel-block grid transition.
 */
export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  onComplete,
  onRevealStart,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>(shouldReduceMotion ? 'done' : 'moving')

  // Precompute deterministic radial + jitter delay per pixel block from screen center
  const blocks = useMemo(() => {
    const cx = (COLS - 1) / 2
    const cy = (ROWS - 1) / 2
    const maxDist = Math.hypot(cx, cy)
    return Array.from({ length: COLS * ROWS }, (_, idx) => {
      const col = idx % COLS
      const row = Math.floor(idx / COLS)
      const dist = Math.hypot(col - cx, row - cy) / maxDist
      // Deterministic checkerboard pixel jitter so it feels genuinely pixelated
      const checker = ((col + row) % 2) * 0.07 + ((idx * 17) % 7) * 0.018
      const delay = dist * 0.34 + checker
      const isAccent = (col === 2 && row === 2) || (col === 5 && row === 5) || (col === 6 && row === 2)
      const isRed = (col === 3 && row === 4) || (col === 4 && row === 3)
      return { idx, delay, isAccent, isRed }
    })
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase('done')
      onRevealStart?.()
      onComplete()
      return
    }

    const tClick = window.setTimeout(() => setPhase('clicking'), 820)
    const tDissolve = window.setTimeout(() => {
      setPhase('dissolving')
      onRevealStart?.()
    }, 1180)
    const tDone = window.setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 1880)

    return () => {
      window.clearTimeout(tClick)
      window.clearTimeout(tDissolve)
      window.clearTimeout(tDone)
    }
  }, [shouldReduceMotion, onComplete, onRevealStart])

  const handleSkip = () => {
    setPhase('done')
    onRevealStart?.()
    onComplete()
  }

  if (phase === 'done') return null

  const isClicking = phase === 'clicking'
  const isDissolving = phase === 'dissolving'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${
        isDissolving ? 'pointer-events-none' : ''
      }`}
      role="dialog"
      aria-label="انیمیشن ورود به وب‌سایت تیم رَسا"
    >
      {/* Pixel-Block Grid Backdrop that dissolves cell-by-cell after the click */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
        aria-hidden="true"
      >
        {blocks.map((block) => (
          <motion.div
            key={block.idx}
            initial={{ opacity: 1, scale: 1.02 }}
            animate={
              isDissolving
                ? { opacity: 0, scale: 0.35 }
                : { opacity: 1, scale: 1.02 }
            }
            transition={{
              duration: 0.25,
              delay: isDissolving ? block.delay : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={`border border-white/[0.05] will-change-transform ${
              isDissolving && block.isAccent
                ? 'bg-[#22C55E]'
                : isDissolving && block.isRed
                  ? 'bg-[#E5252A]'
                  : 'bg-[#0A0A0A]'
            }`}
          />
        ))}
      </div>

      {/* Skip button for instant entry */}
      {!isDissolving && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 left-4 z-20 bg-white text-[#0A0A0A] border-[3px] border-[#0A0A0A] shadow-[-3px_3px_0_#E5252A] px-3 py-1.5 rounded-[6px] text-xs font-extrabold active:translate-y-0.5"
        >
          رد کردن ✕
        </button>
      )}

      {/* Center Interactive Click Stage */}
      <motion.div
        animate={isDissolving ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-5 px-6 text-center"
      >
        {/* Top event micro-badge */}
        <div className="inline-flex items-center gap-2 bg-[#161616] text-white border-2 border-white/25 px-3.5 py-1.5 rounded-[6px] text-xs sm:text-sm font-bold">
          <span className="w-2.5 h-2.5 bg-[#22C55E] inline-block" />
          <span>هشتمین رویداد ملی تولید محتوای دیجیتال بسیج</span>
        </div>

        {/* Target Neo-Brutalist Button that gets physically "clicked" by the pixel cursor */}
        <div className="relative">
          {/* Pixel shockwave rings on click */}
          {isClicking && (
            <>
              <motion.span
                initial={{ scale: 0.85, opacity: 1 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ duration: 0.36, ease: 'easeOut' }}
                className="absolute -inset-2 border-[3px] border-[#22C55E] rounded-[10px] pointer-events-none"
              />
              <motion.span
                initial={{ scale: 0.9, opacity: 1 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="absolute -inset-1 border-[3px] border-[#E5252A] rounded-[10px] pointer-events-none"
              />
              {/* 4 corner pixel sparks */}
              {[
                { x: -46, y: -38, color: '#22C55E' },
                { x: 48, y: -34, color: '#E5252A' },
                { x: -42, y: 38, color: '#FFFFFF' },
                { x: 46, y: 40, color: '#22C55E' },
              ].map((spark, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                  style={{ backgroundColor: spark.color }}
                  className="absolute left-1/2 top-1/2 w-3.5 h-3.5 -ml-1.5 -mt-1.5 pointer-events-none"
                />
              ))}
            </>
          )}

          {/* Target button */}
          <motion.div
            animate={
              isClicking
                ? {
                    x: -7,
                    y: 7,
                    boxShadow: '0px 0px 0px #FFFFFF',
                    backgroundColor: '#22C55E',
                    color: '#0A0A0A',
                  }
                : {
                    x: 0,
                    y: 0,
                    boxShadow: '-7px 7px 0px #FFFFFF',
                    backgroundColor: '#E5252A',
                    color: '#FFFFFF',
                  }
            }
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="border-[3px] border-white rounded-[8px] px-9 py-4 sm:px-12 sm:py-5 select-none"
          >
            <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
              رَسا
            </div>
            <div className="text-[11px] sm:text-xs font-extrabold mt-2 opacity-95">
              {isClicking ? 'کلیک شد! ورود...' : 'ورود به معرفی تیم'}
            </div>
          </motion.div>

          {/* Stepped pixel motion-trail dots following the cursor path */}
          {phase === 'moving' &&
            [
              { x: 112, y: 110, delay: 0.12, color: '#22C55E' },
              { x: 78, y: 78, delay: 0.26, color: '#E5252A' },
              { x: 46, y: 48, delay: 0.4, color: '#22C55E' },
            ].map((dot, idx) => (
              <motion.span
                key={idx}
                initial={{ x: dot.x, y: dot.y, opacity: 0, scale: 0 }}
                animate={{ x: dot.x, y: dot.y, opacity: [0, 1, 0], scale: [0.5, 1, 0.6] }}
                transition={{ duration: 0.45, delay: dot.delay, ease: 'easeOut' }}
                style={{ backgroundColor: dot.color }}
                className="absolute left-1/2 top-1/2 w-3 h-3 pointer-events-none"
                aria-hidden="true"
              />
            ))}

          {/* Animated Pixel Cursor Arrow gliding across screen and clicking! */}
          <motion.div
            initial={{ x: 132, y: 132, scale: 1.12, rotate: 8, opacity: 0 }}
            animate={
              isClicking
                ? { x: 12, y: 14, scale: 0.82, rotate: -6, opacity: 1 }
                : { x: 20, y: 20, scale: 1, rotate: 0, opacity: 1 }
            }
            transition={
              isClicking
                ? { duration: 0.11, ease: 'easeInOut' }
                : { duration: 0.74, ease: [0.22, 1, 0.36, 1] }
            }
            className="absolute left-1/2 top-1/2 pointer-events-none will-change-transform drop-shadow-[0_4px_0_rgba(0,0,0,0.8)]"
          >
            <PixelCursorLogo size={68} showClickSparks={isClicking} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
