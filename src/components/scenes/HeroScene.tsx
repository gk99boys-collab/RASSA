import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { RasaLogo } from '../BrandMarks'
import { MagneticButton, MinimalSkeleton, SILK_EASE } from '../MotionPrimitives'
import type { SceneKey } from '../AmbientBackdrop'

interface HeroSceneProps {
  name: string
  tagline: string
  loading: boolean
  ready: boolean
  onNavigate: (scene: SceneKey) => void
}

const META_ITEMS = [
  'هشتمین رویداد ملی تولید محتوای دیجیتال بسیج',
  'رشته نرم‌افزارهای ویژه تلفن همراه',
  'تیم ۵ نفره',
]

export const HeroScene: React.FC<HeroSceneProps> = ({
  name,
  tagline,
  loading,
  ready,
  onNavigate,
}) => {
  const shouldReduceMotion = useReducedMotion()

  // Gentle 3D spring parallax on the official RASSA logo
  const rawRotX = useMotionValue(0)
  const rawRotY = useMotionValue(0)
  const rotateX = useSpring(rawRotX, { stiffness: 150, damping: 24, mass: 0.8 })
  const rotateY = useSpring(rawRotY, { stiffness: 150, damping: 24, mass: 0.8 })

  // Calm rhythmic accent across the three motto verbs when standard tagline is shown
  const [activeBeat, setActiveBeat] = useState(0)
  useEffect(() => {
    if (shouldReduceMotion || !ready) return
    const id = window.setInterval(() => {
      setActiveBeat((b) => (b + 1) % 3)
    }, 2600)
    return () => window.clearInterval(id)
  }, [ready, shouldReduceMotion])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    rawRotY.set(nx * 14)
    rawRotX.set(-ny * 12)
  }

  const handlePointerLeave = () => {
    rawRotX.set(0)
    rawRotY.set(0)
  }

  const isDefaultTagline = tagline.trim() === 'رَسا؛ می‌رسیم، می‌سازیم، می‌درخشیم'
  const show = ready || Boolean(shouldReduceMotion)

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="w-full max-w-2xl mx-auto flex flex-col items-center text-center px-2"
    >
      {/* Floating Official RASSA Logo with soft breathing + 3D spring response */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.94, filter: 'blur(8px)' }}
        animate={
          show
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, y: 18, scale: 0.94, filter: 'blur(8px)' }
        }
        transition={{ duration: 0.75, ease: SILK_EASE }}
        style={{ perspective: 900 }}
        className="mb-5 sm:mb-6"
      >
        <motion.div
          style={shouldReduceMotion ? undefined : { rotateX, rotateY }}
          animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' } }
          }
          className="will-change-transform"
        >
          <RasaLogo
            className="w-32 sm:w-40 md:w-44 drop-shadow-[0_14px_28px_rgba(0,143,140,0.14)]"
            alt={`لوگوی رسمی تیم ${name}`}
          />
        </motion.div>
      </motion.div>

      {/* Masked Monumental Team Name */}
      <div className="overflow-hidden pb-1">
        {loading ? (
          <MinimalSkeleton
            className="h-14 sm:h-16 w-40 mx-auto"
            label="در حال بارگذاری نام تیم..."
          />
        ) : (
          <motion.h1
            initial={shouldReduceMotion ? false : { y: '105%', opacity: 0 }}
            animate={show ? { y: '0%', opacity: 1 } : { y: '105%', opacity: 0 }}
            transition={{ duration: 0.72, delay: 0.06, ease: SILK_EASE }}
            className="font-black text-5xl sm:text-6xl md:text-7xl text-[#0D1217] tracking-tight leading-[1.18]"
          >
            {name}
          </motion.h1>
        )}
      </div>

      {/* Silky Tagline with gentle cadence */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={
          show
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: 14, filter: 'blur(6px)' }
        }
        transition={{ duration: 0.7, delay: 0.15, ease: SILK_EASE }}
        className="mt-3 sm:mt-4 min-h-[2rem] flex items-center justify-center"
      >
        {loading ? (
          <MinimalSkeleton
            className="h-7 w-72 sm:w-80"
            label="در حال بارگذاری شعار تیم..."
          />
        ) : isDefaultTagline ? (
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#374151] leading-relaxed">
            <span>رَسا؛ </span>
            {(['می‌رسیم،', 'می‌سازیم،', 'می‌درخشیم'] as const).map((word, idx) => {
              const active = !shouldReduceMotion && activeBeat === idx
              return (
                <React.Fragment key={word}>
                  <span
                    className={`transition-colors duration-700 ease-out ${
                      active ? 'text-[#008F8C]' : 'text-[#374151]'
                    }`}
                  >
                    {word}
                  </span>
                  {idx < 2 ? ' ' : ''}
                </React.Fragment>
              )
            })}
          </p>
        ) : (
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#374151] leading-relaxed">
            {tagline}
          </p>
        )}
      </motion.div>

      {/* Whisper-clean minimalist metadata pills */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.68, delay: 0.24, ease: SILK_EASE }}
        className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-2"
      >
        {META_ITEMS.map((item, idx) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/75 border border-[#0D1217]/[0.075] px-3.5 py-1.5 text-xs font-medium text-[#4B5563]"
          >
            {idx === 0 && (
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-[#10A848] shrink-0"
              />
            )}
            <span>{item}</span>
          </span>
        ))}
      </motion.div>

      {/* Minimal Primary & Secondary Magnetic Actions */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.68, delay: 0.32, ease: SILK_EASE }}
        className="mt-7 sm:mt-8 flex items-center justify-center gap-3"
      >
        <MagneticButton
          variant="primary"
          onClick={() => onNavigate('members')}
          className="group"
        >
          <span>اعضای تیم</span>
          <ArrowLeft
            size={15}
            strokeWidth={2.2}
            className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
          />
        </MagneticButton>

        <MagneticButton variant="subtle" onClick={() => onNavigate('about')}>
          <span>درباره رَسا</span>
        </MagneticButton>
      </motion.div>
    </div>
  )
}
