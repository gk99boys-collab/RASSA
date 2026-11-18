import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { ArrowDownLeft, Sparkles, Trophy, Users } from 'lucide-react'
import {
  EventCursorLogo,
  PixelBarcode,
  PixelEqualizer,
  RasaTeamLogo,
} from './BrandAssets'
import { BrutalButton, BrutalSkeleton, CheckChip } from './BrutalUI'

interface HeroSectionProps {
  name: string
  tagline: string
  loading: boolean
  ready: boolean
}

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('fa', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (s) => s.segment)
  }
  return text.match(/.\p{M}*/gu) ?? [text]
}

/**
 * Section 2 — Super-Graphical & Super-Animated Hero Stage:
 * Combines a 3D-extruded Persian typewriter/chromatic-glitch "رَسا" poster with an
 * interactive 3D-tilt brand monument showcasing BOTH official team & event logos.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  name,
  tagline,
  loading,
  ready,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const graphemes = useMemo(() => splitGraphemes(name || 'رَسا'), [name])
  const [typedCount, setTypedCount] = useState<number>(
    shouldReduceMotion ? graphemes.length : 0
  )
  const [glitchBurst, setGlitchBurst] = useState(false)

  // Scroll parallax for giant background kinetic watermark
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const watermarkX = useTransform(
    scrollYProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : -120]
  )

  // Interactive 3D Tilt physics for the Official RASSA × Event Emblem Monument
  const rawRotX = useMotionValue(0)
  const rawRotY = useMotionValue(0)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(45)

  const rotX = useSpring(rawRotX, { stiffness: 220, damping: 22 })
  const rotY = useSpring(rawRotY, { stiffness: 220, damping: 22 })
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${glowX}% ${glowY}%, rgba(0, 212, 200, 0.28), rgba(229, 37, 42, 0.08) 48%, transparent 75%)`

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rawRotY.set((px - 0.5) * 16)
    rawRotX.set((0.5 - py) * 14)
    glowX.set(Math.round(px * 100))
    glowY.set(Math.round(py * 100))
  }

  const handleCardPointerLeave = () => {
    rawRotX.set(0)
    rawRotY.set(0)
    glowX.set(50)
    glowY.set(45)
  }

  // Persian grapheme-accurate typewriter + automatic chromatic glitch burst
  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCount(graphemes.length)
      return
    }
    if (!ready) {
      setTypedCount(0)
      return
    }

    setTypedCount(0)
    const timers: number[] = []
    graphemes.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => setTypedCount(idx + 1), 160 + idx * 175)
      )
    })

    timers.push(
      window.setTimeout(() => {
        setGlitchBurst(true)
        timers.push(window.setTimeout(() => setGlitchBurst(false), 1050))
      }, 220 + graphemes.length * 175)
    )

    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [graphemes, ready, shouldReduceMotion])

  const triggerGlitch = () => {
    if (shouldReduceMotion) return
    setGlitchBurst(false)
    window.requestAnimationFrame(() => {
      setGlitchBurst(true)
      window.setTimeout(() => setGlitchBurst(false), 1000)
    })
  }

  const displayedName =
    typedCount >= graphemes.length ? name : graphemes.slice(0, typedCount).join('')
  const doneTyping = typedCount >= graphemes.length

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-10 pt-7 pb-12 sm:pt-11 sm:pb-16 px-3.5 sm:px-6 overflow-x-clip"
      aria-labelledby="hero-team-title"
    >
      {/* Giant Kinetic Outlined Background Watermark */}
      <motion.div
        style={{ x: watermarkX }}
        aria-hidden="true"
        dir="ltr"
        className="hidden md:block absolute top-6 left-0 right-0 text-center pointer-events-none select-none overflow-hidden"
      >
        <span className="stroke-number font-black text-[9rem] lg:text-[12.5rem] leading-none tracking-widest whitespace-nowrap">
          RASSA // 08
        </span>
      </motion.div>

      <div className="max-w-6xl mx-auto relative">
        {/* Top Official 8th Event Master Pill (Red Badge + Black Tab + Official Event Logo Cap) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="inline-flex items-stretch border-[3px] border-[#080A0D] rounded-[8px] shadow-[-5px_5px_0_#080A0D] overflow-hidden bg-[#080A0D]">
            <span className="bg-[#E5252A] text-white font-black text-xs sm:text-sm px-3 sm:px-4 py-2 border-l-[3px] border-[#080A0D] flex items-center shrink-0">
              رویداد ۰۸
            </span>
            <span className="bg-[#080A0D] text-white font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 flex items-center gap-2 leading-snug">
              <span>هشتمین رویداد ملی تولید محتوای دیجیتال بسیج</span>
            </span>
            <span
              className="hidden sm:flex items-center justify-center bg-white px-2.5 border-r-[3px] border-[#080A0D]"
              aria-hidden="true"
            >
              <EventCursorLogo className="w-4 h-5" tilted />
            </span>
          </div>

          {/* Live Status Chip */}
          <div className="hidden lg:inline-flex items-center gap-2 bg-white border-[3px] border-[#080A0D] shadow-[-4px_4px_0_#080A0D] rounded-[7px] px-3.5 py-1.5 text-xs font-black">
            <span className="w-2.5 h-2.5 bg-[#16B853] pixel-blink" aria-hidden="true" />
            <span>وضعیت تیم: آماده‌ی رقابت</span>
          </div>
        </motion.div>

        {/* 12-Column Asymmetric Graphic Poster Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch">
          {/* RIGHT 7 COLS: Monumental Team Headline, Tagline, Chips & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 34, scale: 0.98 }}
            transition={{ duration: 0.52, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 poster-card-double flex flex-col overflow-hidden relative"
          >
            {/* Graphic OS Window Top Chrome */}
            <div className="bg-[#080A0D] text-white px-4 sm:px-6 py-2.5 border-b-[3px] border-[#080A0D] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <span className="w-3 h-3 bg-[#E5252A] border border-black" aria-hidden="true" />
                <span className="w-3 h-3 bg-[#F0E808] border border-black" aria-hidden="true" />
                <span className="w-3 h-3 bg-[#16B853] border border-black" aria-hidden="true" />
                <span className="mr-1.5 text-white/90">معرفی رسمی تیم</span>
              </div>
              <PixelBarcode className="h-3.5 text-white/75 hidden sm:block" />
            </div>

            {/* Interior Content */}
            <div className="p-6 sm:p-9 md:p-10 flex-1 flex flex-col justify-between relative">
              {/* Decorative pixel stair blocks in top-left corner */}
              <div
                className="hidden sm:block absolute top-6 left-6 pointer-events-none"
                aria-hidden="true"
              >
                <div className="flex gap-1.5 justify-end">
                  <span className="w-3.5 h-3.5 bg-[#00D4C8] border-2 border-[#080A0D]" />
                  <span className="w-3.5 h-3.5 bg-[#16B853] border-2 border-[#080A0D]" />
                  <span className="w-3.5 h-3.5 bg-[#E5252A] border-2 border-[#080A0D]" />
                </div>
                <div className="flex gap-1.5 justify-end mt-1.5">
                  <span className="w-3.5 h-3.5 bg-[#F0E808] border-2 border-[#080A0D]" />
                  <span className="w-3.5 h-3.5 bg-[#080A0D]" />
                </div>
              </div>

              <div>
                {/* Identity Eyebrow Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-[#E5252A] text-white border-[2.5px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D] rounded-[5px] px-3 py-1 text-xs font-black">
                    <Sparkles size={13} strokeWidth={3} />
                    <span>تیم نرم‌افزاری</span>
                  </span>
                  <span
                    dir="ltr"
                    className="inline-flex items-center gap-1.5 bg-[#080A0D] text-[#00D4C8] border-[2.5px] border-[#080A0D] rounded-[5px] px-2.5 py-1 text-xs font-black tracking-widest"
                  >
                    RASSA SQUAD
                  </span>
                </div>

                {/* COLOSSAL 3D-Extruded "رَسا" Headline + Typewriter + Chromatic Glitch */}
                <div className="flex items-center gap-3 sm:gap-5 my-3 sm:my-4">
                  <h1
                    id="hero-team-title"
                    onClick={triggerGlitch}
                    onMouseEnter={triggerGlitch}
                    aria-label={name}
                    className={`relative inline-block font-black text-[5.2rem] sm:text-[7.2rem] xl:text-[8.6rem] leading-[1.05] tracking-tight select-none ${
                      glitchBurst ? 'glitch-now' : ''
                    }`}
                  >
                    {/* Zero-CLS sizing placeholder */}
                    <span className="invisible block">{name}</span>

                    {/* Primary 3D extruded headline */}
                    <span className="hero-title-3d absolute inset-0 right-0">
                      {displayedName}
                    </span>

                    {/* Chromatic RGB/Green glitch slice clones (matching official event logo!) */}
                    {doneTyping && !shouldReduceMotion && (
                      <>
                        <span
                          aria-hidden="true"
                          className="glitch-red absolute inset-0 text-[#E5252A] pointer-events-none"
                        >
                          {name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="glitch-cyan absolute inset-0 text-[#00D4C8] pointer-events-none"
                        >
                          {name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="glitch-green absolute inset-0 text-[#16B853] pointer-events-none"
                        >
                          {name}
                        </span>
                      </>
                    )}
                  </h1>

                  {/* Blinking Neo-Brutalist Pixel Block Cursor */}
                  <span
                    aria-hidden="true"
                    className="pixel-blink inline-block w-4 sm:w-5 h-14 sm:h-20 xl:h-24 bg-[#16B853] border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#E5252A] shrink-0 translate-y-1"
                  />
                </div>

                {/* Tagline Sticker Card from Supabase (with Neo-Brutalist Skeleton) */}
                <div className="mt-4 mb-7">
                  {loading ? (
                    <BrutalSkeleton
                      className="h-14 w-full max-w-lg"
                      label="در حال دریافت شعار تیم..."
                    />
                  ) : (
                    <motion.div
                      whileHover={shouldReduceMotion ? undefined : { rotate: 0, scale: 1.01 }}
                      className="inline-flex items-stretch bg-[#EEF0F3] border-[3px] border-[#080A0D] shadow-[-5px_5px_0_#080A0D] rounded-[8px] overflow-hidden sm:-rotate-[0.8deg] transition-transform"
                    >
                      <span
                        className="w-3 sm:w-3.5 bg-[#E5252A] border-l-[3px] border-[#080A0D] shrink-0"
                        aria-hidden="true"
                      />
                      <p className="px-4 py-3 sm:px-5 sm:py-3.5 text-lg sm:text-2xl font-black text-[#080A0D] leading-snug">
                        {tagline}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Required Official Event Check Chips */}
                <div className="flex flex-wrap items-center gap-3">
                  <CheckChip
                    label="رشته نرم‌افزارهای ویژه تلفن همراه"
                    accent="green"
                  />
                  <CheckChip label="تیم ۵ نفره" accent="red" />
                </div>

                {/* Pressable Red & White Outlined CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
                  <BrutalButton href="#members" variant="red" size="lg">
                    <Users size={20} strokeWidth={2.8} />
                    <span>آشنایی با اعضای رَسا</span>
                    <ArrowDownLeft size={20} strokeWidth={2.8} />
                  </BrutalButton>

                  <BrutalButton href="#achievement" variant="white" size="lg">
                    <Trophy size={20} strokeWidth={2.8} className="text-[#E5252A]" />
                    <span>افتخارات تیم</span>
                  </BrutalButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* LEFT 5 COLS: Interactive 3D-Tilt Official RASSA × Event Brand Monument */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.56, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex"
            style={{ perspective: 1100 }}
          >
            <motion.div
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              onClick={triggerGlitch}
              style={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotateX: rotX,
                      rotateY: rotY,
                      transformStyle: 'preserve-3d',
                    }
              }
              className="relative w-full bg-obsidian-grid border-[3.5px] border-[#080A0D] shadow-[-7px_7px_0_#00A8A8,-13px_13px_0_#080A0D] rounded-[12px] flex flex-col justify-between p-5 sm:p-7 overflow-visible min-h-[370px] sm:min-h-[430px] select-none group"
            >
              {/* Dynamic Mouse-Tracking Spotlight Overlay */}
              {!shouldReduceMotion && (
                <motion.div
                  style={{ background: spotlight }}
                  className="absolute inset-0 rounded-[9px] pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Subtle CRT scanline sheen */}
              <div
                className="absolute inset-0 rounded-[9px] pixel-scanlines pointer-events-none"
                aria-hidden="true"
              />

              {/* Floating Break-the-Grid Official 8th Event Cursor Sticker (Top-Left) */}
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  triggerGlitch()
                }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.88, rotate: -10 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -9, 0], rotate: [0, -3, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 3.1, repeat: Infinity, ease: 'easeInOut' }
                }
                style={shouldReduceMotion ? undefined : { transform: 'translateZ(55px)' }}
                aria-label="نماد رسمی هشتمین رویداد ملی تولید محتوای دیجیتال بسیج"
                className="absolute -top-4 -left-2 sm:-top-5 sm:-left-4 z-20 bg-white border-[3px] border-[#080A0D] shadow-[-5px_5px_0_#E5252A] rounded-[10px] px-3 py-2.5 flex flex-col items-center gap-1"
              >
                <EventCursorLogo
                  className="w-11 h-14 sm:w-13 sm:h-16"
                  alt="لوگوی هشتمین رویداد ملی تولید محتوای دیجیتال بسیج"
                  tilted
                />
                <span className="bg-[#080A0D] text-[#16B853] text-[9px] font-black px-1.5 py-0.5 rounded-[3px] tracking-tight">
                  EVENT 08
                </span>
              </motion.button>

              {/* Top Console HUD */}
              <div className="relative z-10 flex items-center justify-between gap-2 pl-16">
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[11px] font-extrabold px-3 py-1 rounded-[5px]">
                  <span className="w-2 h-2 bg-[#00D4C8] pixel-blink" aria-hidden="true" />
                  <span>نشان رسمی تیم رَسا</span>
                </span>
              </div>

              {/* Center 3D Levitating Official RASSA Team Logo */}
              <div
                className="relative z-10 my-6 flex items-center justify-center py-4"
                style={shouldReduceMotion ? undefined : { transform: 'translateZ(42px)' }}
              >
                {/* Orbiting cyber ring + pixel corner accents */}
                <div
                  aria-hidden="true"
                  className="spin-slow absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-[#00D4C8]/30 pointer-events-none"
                />
                <span
                  className="absolute top-1 right-3 w-3.5 h-3.5 bg-[#16B853] border-2 border-black"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-2 left-4 w-3.5 h-3.5 bg-[#E5252A] border-2 border-black"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-4 right-8 w-2.5 h-2.5 bg-[#F0E808] border border-black pixel-blink"
                  aria-hidden="true"
                />
                <span
                  className="absolute top-5 left-6 w-2.5 h-2.5 bg-[#00D4C8] border border-black"
                  aria-hidden="true"
                />

                <motion.div
                  animate={
                    glitchBurst && !shouldReduceMotion
                      ? { x: [0, -6, 6, -3, 3, 0], scale: [1, 1.05, 0.98, 1] }
                      : shouldReduceMotion
                        ? undefined
                        : { y: [0, -8, 0] }
                  }
                  transition={
                    glitchBurst
                      ? { duration: 0.35 }
                      : shouldReduceMotion
                        ? undefined
                        : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="relative flex items-center justify-center"
                >
                  <RasaTeamLogo
                    className="w-56 sm:w-68 lg:w-72 transition-transform duration-200 group-hover:scale-[1.05]"
                    alt="لوگوی رسمی تیم رَسا (RASSA)"
                    glow
                  />
                </motion.div>
              </div>

              {/* Bottom Live Telemetry Dock */}
              <div className="relative z-10 bg-black/65 border-2 border-white/20 rounded-[8px] px-3.5 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PixelEqualizer />
                  <div className="text-right">
                    <div className="text-[11px] font-black text-white leading-tight">
                      قهرمان دوره‌ی هفتم (خوسف)
                    </div>
                    <div className="text-[10px] font-bold text-[#00D4C8] mt-0.5">
                      مدعی رتبه‌ی اول دوره‌ی هشتم
                    </div>
                  </div>
                </div>

                <span className="bg-[#E5252A] text-white border-2 border-white font-black text-xs px-2.5 py-1 rounded-[5px] shrink-0">
                  #۱
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Kinetic Scroll-Down Cue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.45, delay: 0.45 }}
          className="mt-8 sm:mt-10 flex justify-center"
        >
          <a
            href="#achievement"
            className="inline-flex items-center gap-2.5 bg-white border-[3px] border-[#080A0D] shadow-[-4px_4px_0_#080A0D] rounded-full px-4 py-1.5 text-xs font-black text-[#080A0D] hover:bg-[#080A0D] hover:text-white transition-colors"
          >
            <motion.span
              animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
              }
              className="w-2.5 h-2.5 bg-[#E5252A] inline-block"
              aria-hidden="true"
            />
            <span>اسکرول کنید و تیم رَسا را بشناسید</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
