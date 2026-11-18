import React, { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EventCursorLogo, RasaTeamLogo } from './BrandAssets'
import { toPersianDigits } from '../lib/supabase'

interface IntroOverlayProps {
  onComplete: () => void
  onRevealStart?: () => void
}

type IntroPhase = 'moving' | 'clicking' | 'dissolving' | 'done'

const COLS = 10
const ROWS = 8

const SHARDS = [
  { x: -95, y: -72, color: '#16B853', size: 14 },
  { x: 98, y: -68, color: '#E5252A', size: 14 },
  { x: -112, y: 8, color: '#00D4C8', size: 12 },
  { x: 114, y: 12, color: '#F0E808', size: 12 },
  { x: -82, y: 78, color: '#FFFFFF', size: 13 },
  { x: 86, y: 82, color: '#16B853', size: 14 },
  { x: -24, y: -96, color: '#00D4C8', size: 11 },
  { x: 34, y: -92, color: '#F0E808', size: 11 },
  { x: -32, y: 98, color: '#E5252A', size: 12 },
  { x: 38, y: 95, color: '#00D4C8', size: 11 },
]

/**
 * Section 1 — Super-Animated Intro Sequence:
 * Features the official RASSA team logo launch stage; the real official 8th Event
 * pixel-glitch cursor arrow sweeps across screen, leaves chromatic pixel trails,
 * SMASH-CLICKS the launch button with shockwave & shard burst, and dissolves the
 * entire screen in a 10x8 radial pixel-block matrix transition.
 */
export const IntroOverlay: React.FC<IntroOverlayProps> = ({
  onComplete,
  onRevealStart,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<IntroPhase>(shouldReduceMotion ? 'done' : 'moving')
  const [progress, setProgress] = useState(0)

  const tiles = useMemo(() => {
    const cx = (COLS - 1) / 2
    const cy = (ROWS - 1) / 2
    const maxDist = Math.hypot(cx, cy)

    return Array.from({ length: COLS * ROWS }, (_, idx) => {
      const col = idx % COLS
      const row = Math.floor(idx / COLS)
      const dist = Math.hypot(col - cx, row - cy) / maxDist
      const pixelStep = ((col + row) % 2) * 0.065 + ((idx * 13) % 7) * 0.016
      const delay = dist * 0.36 + pixelStep
      const flash =
        (idx * 19) % 17 === 0
          ? '#16B853'
          : (idx * 23) % 19 === 0
            ? '#E5252A'
            : (idx * 11) % 23 === 0
              ? '#00D4C8'
              : '#070A0E'
      return { idx, delay, flash }
    })
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) {
      setPhase('done')
      onRevealStart?.()
      onComplete()
      return
    }

    // Smooth loading percentage counter 0 -> 100 during cursor approach
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(100, Math.round(((now - start) / 860) * 100))
      setProgress(p)
      if (p < 100) raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    const tClick = window.setTimeout(() => {
      setProgress(100)
      setPhase('clicking')
    }, 920)

    const tDissolve = window.setTimeout(() => {
      setPhase('dissolving')
      onRevealStart?.()
    }, 1340)

    const tDone = window.setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 2080)

    return () => {
      window.cancelAnimationFrame(raf)
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
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none ${
        isDissolving ? 'pointer-events-none' : ''
      }`}
      role="dialog"
      aria-label="انیمیشن ورود به وب‌سایت تیم رَسا"
    >
      {/* 10x8 Pixel-Block Matrix Backdrop */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
        aria-hidden="true"
      >
        {tiles.map((tile) => (
          <motion.div
            key={tile.idx}
            initial={{ opacity: 1, scale: 1.03 }}
            animate={
              isDissolving
                ? { opacity: 0, scale: 0.25 }
                : { opacity: 1, scale: 1.03 }
            }
            transition={{
              duration: 0.26,
              delay: isDissolving ? tile.delay : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              backgroundColor: isDissolving ? tile.flash : '#070A0E',
            }}
            className="border border-white/[0.045] will-change-transform"
          />
        ))}
      </div>

      {/* Subtle CRT scanlines + corner HUD frames before dissolve */}
      {!isDissolving && (
        <>
          <div
            className="absolute inset-0 pixel-scanlines pointer-events-none opacity-70"
            aria-hidden="true"
          />

          {/* Top-right HUD status */}
          <div
            className="hidden sm:flex items-center gap-2.5 absolute top-5 right-5 z-20 text-xs font-extrabold text-white/80 bg-white/5 border-2 border-white/15 px-3 py-1.5 rounded-[6px]"
            aria-hidden="true"
          >
            <span className="w-2.5 h-2.5 bg-[#16B853] pixel-blink" />
            <span>RASSA.SYS // {toPersianDigits(progress)}٪</span>
          </div>

          {/* Skip button (top-left) */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 bg-white text-[#080A0D] border-[3px] border-[#080A0D] shadow-[-4px_4px_0_#E5252A] px-3.5 py-1.5 rounded-[6px] text-xs font-black active:translate-y-0.5"
          >
            رد کردن ✕
          </button>
        </>
      )}

      {/* Center Launch Console with Camera Micro-Shake on Click */}
      <motion.div
        animate={
          isDissolving
            ? { opacity: 0, scale: 1.12 }
            : isClicking
              ? { x: [0, -7, 7, -4, 4, 0], y: [0, 5, -5, 2, 0], scale: 1.02 }
              : { opacity: 1, scale: 1 }
        }
        transition={
          isClicking
            ? { duration: 0.28, ease: 'easeOut' }
            : { duration: 0.22, ease: 'easeOut' }
        }
        className="relative z-10 flex flex-col items-center gap-6 px-5 text-center max-w-md w-full"
      >
        {/* Official Event Tag */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 bg-[#111720] text-white border-2 border-white/20 px-3.5 py-1.5 rounded-[6px] text-xs font-extrabold shadow-[-3px_3px_0_#16B853]"
        >
          <span className="w-2 h-2 bg-[#16B853]" aria-hidden="true" />
          <span>هشتمین رویداد ملی تولید محتوای دیجیتال بسیج</span>
        </motion.div>

        {/* Official RASSA Team Logo Materializing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="absolute -inset-6 rounded-full bg-[#00D4C8]/15 blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <RasaTeamLogo className="w-48 sm:w-60 relative z-10" glow />
        </motion.div>

        {/* Interactive Click Target Button + Sweeping Official Event Cursor */}
        <div className="relative mt-1">
          {/* Concentric Pixel Shockwave Rings + Chromatic Shards on Click */}
          {isClicking && (
            <>
              <motion.span
                initial={{ scale: 0.85, opacity: 1 }}
                animate={{ scale: 1.75, opacity: 0 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="absolute -inset-2 border-[4px] border-[#16B853] rounded-[10px] pointer-events-none"
              />
              <motion.span
                initial={{ scale: 0.9, opacity: 1 }}
                animate={{ scale: 1.45, opacity: 0 }}
                transition={{ duration: 0.34, delay: 0.03, ease: 'easeOut' }}
                className="absolute -inset-1 border-[3px] border-[#00D4C8] rounded-[10px] pointer-events-none"
              />
              {SHARDS.map((s, idx) => (
                <motion.span
                  key={idx}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.4, rotate: 90 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: s.size,
                    height: s.size,
                    backgroundColor: s.color,
                  }}
                  className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 border-2 border-[#080A0D] pointer-events-none"
                />
              ))}
            </>
          )}

          {/* Neo-Brutalist Launch Button */}
          <motion.div
            animate={
              isClicking
                ? {
                    x: -7,
                    y: 7,
                    boxShadow: '0px 0px 0px #FFFFFF',
                    backgroundColor: '#16B853',
                  }
                : {
                    x: 0,
                    y: 0,
                    boxShadow: '-7px 7px 0px #FFFFFF',
                    backgroundColor: '#E5252A',
                  }
            }
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="border-[3px] border-white rounded-[9px] px-8 py-3.5 sm:px-10 sm:py-4 text-white min-w-[220px]"
          >
            <div className="font-black text-xl sm:text-2xl tracking-tight leading-none">
              {isClicking ? 'کلیک شد! خوش آمدید' : 'ورود به دنیای رَسا'}
            </div>
            {/* Pixel progress bar inside launch button */}
            <div className="mt-2.5 h-2 w-full bg-black/40 border border-white/40 rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-[#F0E808] transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>

          {/* Chromatic Pixel Trail Squares Behind the Official Event Cursor */}
          {phase === 'moving' &&
            [
              { x: 118, y: 112, delay: 0.12, color: '#16B853' },
              { x: 92, y: 88, delay: 0.22, color: '#00D4C8' },
              { x: 66, y: 64, delay: 0.34, color: '#E5252A' },
              { x: 40, y: 40, delay: 0.46, color: '#F0E808' },
            ].map((dot, idx) => (
              <motion.span
                key={idx}
                initial={{ x: dot.x, y: dot.y, opacity: 0, scale: 0 }}
                animate={{ x: dot.x, y: dot.y, opacity: [0, 1, 0], scale: [0.4, 1.15, 0.5] }}
                transition={{ duration: 0.46, delay: dot.delay, ease: 'easeOut' }}
                style={{ backgroundColor: dot.color }}
                className="absolute left-1/2 top-1/2 w-3.5 h-3.5 border border-black pointer-events-none"
                aria-hidden="true"
              />
            ))}

          {/* REAL Official 8th Event Pixel-Glitch Cursor Arrow Gliding & Clicking! */}
          <motion.div
            initial={{ x: 138, y: 134, scale: 1.25, rotate: 12, opacity: 0 }}
            animate={
              isClicking
                ? { x: 8, y: 10, scale: 0.78, rotate: -8, opacity: 1 }
                : { x: 18, y: 16, scale: 1, rotate: 0, opacity: 1 }
            }
            transition={
              isClicking
                ? { duration: 0.1, ease: 'easeInOut' }
                : { duration: 0.82, ease: [0.22, 1, 0.36, 1] }
            }
            className="absolute left-1/2 top-1/2 pointer-events-none will-change-transform drop-shadow-[0_6px_12px_rgba(0,0,0,0.75)]"
          >
            <EventCursorLogo className="w-14 h-20 sm:w-16 sm:h-22" tilted />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
