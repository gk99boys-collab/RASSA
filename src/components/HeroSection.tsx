import React, { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownLeft, Award, Users } from 'lucide-react'
import { PixelCursorLogo } from './PixelArt'
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
  // Safe fallback keeping combining Arabic/Persian harakat attached to base char
  return text.match(/.\p{M}*/gu) ?? [text]
}

/**
 * Section 2 — Hero:
 * Massive "رَسا" headline with grapheme-aware Persian typewriter + pixel glitch,
 * floating event pixel cursor arrow with green pixel dots, tagline from Supabase,
 * official event chips, and pressable hard-shadow CTA buttons.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  name,
  tagline,
  loading,
  ready,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const graphemes = useMemo(() => splitGraphemes(name || 'رَسا'), [name])
  const [typedCount, setTypedCount] = useState<number>(
    shouldReduceMotion ? graphemes.length : 0
  )
  const [burstGlitch, setBurstGlitch] = useState(false)

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
      const id = window.setTimeout(
        () => {
          setTypedCount(idx + 1)
        },
        170 + idx * 165
      )
      timers.push(id)
    })

    // Trigger a crisp celebratory pixel-glitch right when typing finishes
    const glitchTimer = window.setTimeout(
      () => {
        setBurstGlitch(true)
        const resetTimer = window.setTimeout(() => setBurstGlitch(false), 1100)
        timers.push(resetTimer)
      },
      220 + graphemes.length * 165
    )
    timers.push(glitchTimer)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [graphemes, ready, shouldReduceMotion])

  const displayedName =
    typedCount >= graphemes.length
      ? name
      : graphemes.slice(0, typedCount).join('')

  const isTypingDone = typedCount >= graphemes.length

  const triggerManualGlitch = () => {
    if (shouldReduceMotion) return
    setBurstGlitch(false)
    window.requestAnimationFrame(() => {
      setBurstGlitch(true)
      window.setTimeout(() => setBurstGlitch(false), 1100)
    })
  }

  return (
    <section
      id="hero"
      className="relative z-10 pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6"
      aria-labelledby="hero-team-title"
    >
      <div className="max-w-5xl mx-auto">
        {/* Official 8th Event Header Pill (Black tab + Red badge + Green pixel dot) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 sm:mb-8 flex flex-wrap items-center gap-3"
        >
          <div className="inline-flex items-stretch border-[3px] border-[#0A0A0A] rounded-[7px] shadow-[-4px_4px_0_#0A0A0A] overflow-hidden bg-[#0A0A0A]">
            <span className="bg-[#E5252A] text-white font-black text-xs sm:text-sm px-3 py-1.5 border-l-[3px] border-[#0A0A0A] flex items-center">
              رویداد ۸
            </span>
            <span className="bg-[#0A0A0A] text-white font-extrabold text-xs sm:text-sm px-3.5 py-1.5 flex items-center gap-2">
              <span>هشتمین رویداد ملی تولید محتوای دیجیتال بسیج</span>
              <span className="w-2.5 h-2.5 bg-[#22C55E] inline-block shrink-0" aria-hidden="true" />
            </span>
          </div>
        </motion.div>

        {/* Main Neo-Brutalist Hero Poster Card */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.985 }}
          transition={{ duration: 0.48, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="brutal-card-lg relative overflow-hidden"
        >
          {/* Neo-Brutalist Window Header Strip */}
          <div className="bg-[#0A0A0A] text-white px-4 sm:px-6 py-2.5 border-b-[3px] border-[#0A0A0A] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <span className="w-2.5 h-2.5 bg-[#22C55E] inline-block" aria-hidden="true" />
              <span>پروفایل رسمی تیم شرکت‌کننده</span>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-3 h-3 bg-[#22C55E] border border-black" />
              <span className="w-3 h-3 bg-white border border-black" />
              <span className="w-3 h-3 bg-[#E5252A] border border-black" />
            </div>
          </div>

          {/* Card Interior */}
          <div className="p-6 sm:p-10 md:p-12 relative">
            {/* Decorative corner pixel steps */}
            <div
              className="hidden sm:flex flex-col items-end gap-1 absolute top-6 left-6 pointer-events-none"
              aria-hidden="true"
            >
              <div className="flex gap-1">
                <span className="w-3.5 h-3.5 bg-[#22C55E] border-2 border-[#0A0A0A]" />
                <span className="w-3.5 h-3.5 bg-[#E5252A] border-2 border-[#0A0A0A]" />
              </div>
              <span className="w-3.5 h-3.5 bg-[#0A0A0A]" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
              <div className="flex-1 min-w-0">
                {/* Small eyebrow tag */}
                <div className="inline-flex items-center gap-2 bg-[#E5252A] text-white border-[2.5px] border-[#0A0A0A] shadow-[-3px_3px_0_#0A0A0A] rounded-[5px] px-3 py-1 text-xs sm:text-sm font-black mb-4">
                  <span>تیم نرم‌افزاری</span>
                </div>

                {/* Huge Team Name "رَسا" with Typewriter + Pixel Glitch */}
                <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-6">
                  <h1
                    id="hero-team-title"
                    onClick={triggerManualGlitch}
                    onMouseEnter={triggerManualGlitch}
                    className={`relative inline-block font-black text-[5.2rem] sm:text-[7.2rem] md:text-[8.8rem] leading-[1.06] tracking-tight text-[#0A0A0A] select-none ${
                      burstGlitch ? 'glitch-burst' : ''
                    }`}
                    style={{
                      textShadow: '-5px 5px 0 #E5252A',
                    }}
                    aria-label={name}
                  >
                    {/* Invisible spacer keeps layout zero-CLS while typewriter runs */}
                    <span className="invisible" aria-hidden="true">
                      {name}
                    </span>

                    {/* Visible typed text */}
                    <span className="absolute inset-0 right-0 text-[#0A0A0A]">
                      {displayedName}
                    </span>

                    {/* Glitch clone layers (active after typing finishes) */}
                    {isTypingDone && !shouldReduceMotion && (
                      <>
                        <span
                          aria-hidden="true"
                          className="glitch-layer-red absolute inset-0 text-[#E5252A] pointer-events-none"
                          style={{ textShadow: 'none' }}
                        >
                          {name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="glitch-layer-green absolute inset-0 text-[#22C55E] pointer-events-none"
                          style={{ textShadow: 'none' }}
                        >
                          {name}
                        </span>
                      </>
                    )}
                  </h1>

                  {/* Blinking Pixel Block Caret */}
                  <span
                    aria-hidden="true"
                    className="pixel-blink inline-block w-3.5 sm:w-5 h-14 sm:h-20 md:h-24 bg-[#E5252A] border-[3px] border-[#0A0A0A] shrink-0 translate-y-1"
                  />
                </div>

                {/* Tagline from Database (with Neo-Brutalist Skeleton state) */}
                <div className="mb-7 sm:mb-8 max-w-2xl">
                  {loading ? (
                    <BrutalSkeleton
                      className="h-12 sm:h-14 w-full max-w-md"
                      label="در حال دریافت شعار تیم..."
                    />
                  ) : (
                    <div className="inline-flex items-center gap-3 bg-[#F1F2F4] border-[3px] border-[#0A0A0A] shadow-[-4px_4px_0_#0A0A0A] rounded-[7px] px-4 py-3 sm:px-5 sm:py-3.5">
                      <span
                        className="w-2 self-stretch bg-[#E5252A] rounded-[2px] shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-lg sm:text-2xl md:text-[1.65rem] font-black text-[#0A0A0A] leading-snug">
                        {tagline}
                      </p>
                    </div>
                  )}
                </div>

                {/* Required Official Event Chips with Check Icons */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <CheckChip
                    label="رشته نرم‌افزارهای ویژه تلفن همراه"
                    accent="green"
                  />
                  <CheckChip label="تیم ۵ نفره" accent="red" />
                </div>

                {/* Primary Red + Secondary White Outlined Pressable Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                  <BrutalButton href="#members" variant="red" size="lg">
                    <Users size={20} strokeWidth={2.75} />
                    <span>آشنایی با اعضای رَسا</span>
                    <ArrowDownLeft size={20} strokeWidth={2.75} />
                  </BrutalButton>

                  <BrutalButton href="#achievement" variant="white" size="lg">
                    <Award size={20} strokeWidth={2.75} className="text-[#E5252A]" />
                    <span>افتخارات تیم</span>
                  </BrutalButton>
                </div>
              </div>

              {/* Signature Event Pixel Cursor Emblem Box (Right-aligned visually on mobile, Left feature tile on md+) */}
              <motion.button
                type="button"
                onClick={triggerManualGlitch}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.92, rotate: -4 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -8, 0], rotate: [0, -2, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                }
                aria-label="نماد پیکسلی رویداد — کلیک برای افکت گلیچ"
                className="self-center md:self-auto w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-[#F1F2F4] border-[3px] border-[#0A0A0A] shadow-[-6px_6px_0_#0A0A0A] rounded-[10px] flex flex-col items-center justify-center gap-2 shrink-0 relative overflow-hidden group"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(10,10,10,0.2) 1.4px, transparent 1.4px)',
                  backgroundSize: '14px 14px',
                }}
              >
                <span className="absolute top-2.5 right-2.5 bg-[#0A0A0A] text-white text-[10px] font-black px-2 py-0.5 rounded-[3px]">
                  RASA.APP
                </span>
                <PixelCursorLogo
                  size={96}
                  showClickSparks={burstGlitch}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 transition-transform duration-150 group-hover:scale-105"
                />
                <span className="inline-flex items-center gap-1.5 bg-white border-2 border-[#0A0A0A] px-2.5 py-0.5 rounded-[4px] text-[11px] font-extrabold text-[#0A0A0A]">
                  <span className="w-2 h-2 bg-[#22C55E]" />
                  <span>کلیک کن!</span>
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
