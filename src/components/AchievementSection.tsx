import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Award, Flame, Trophy, Users } from 'lucide-react'
import { EventCursorLogo, PixelChampionMedal } from './BrandAssets'
import { BrutalSkeleton, CheckChip, SectionPill } from './BrutalUI'
import { toPersianDigits } from '../lib/supabase'

interface AchievementSectionProps {
  achievementText: string
  loading: boolean
}

const CountUpNumber: React.FC<{
  target: number
  prefix?: string
  suffix?: string
  durationMs?: number
}> = ({ target, prefix = '', suffix = '', durationMs = 1400 }) => {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const shouldReduceMotion = useReducedMotion()
  const [val, setVal] = useState<number>(shouldReduceMotion ? target : 0)

  useEffect(() => {
    if (shouldReduceMotion) {
      setVal(target)
      return
    }
    if (!inView) return

    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) {
        raf = window.requestAnimationFrame(frame)
      } else {
        setVal(target)
      }
    }
    raf = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(raf)
  }, [durationMs, inView, shouldReduceMotion, target])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {toPersianDigits(val)}
      {suffix}
    </span>
  )
}

const PixelMeterBar: React.FC<{ color: string; segments?: number }> = ({
  color,
  segments = 8,
}) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="flex items-center gap-1 mt-3 bg-[#EEF0F3] border-2 border-[#080A0D] rounded-[4px] p-1"
    >
      {Array.from({ length: segments }, (_, i) => (
        <motion.span
          key={i}
          initial={shouldReduceMotion ? { opacity: 1, scaleY: 1 } : { opacity: 0.15, scaleY: 0.4 }}
          animate={
            inView || shouldReduceMotion
              ? { opacity: 1, scaleY: 1 }
              : { opacity: 0.15, scaleY: 0.4 }
          }
          transition={{ duration: 0.2, delay: i * 0.06, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
          className="h-2 flex-1 rounded-[1px]"
        />
      ))}
    </div>
  )
}

/**
 * Section 3 — Super-Graphical Championship Trophy Arena:
 * Split-poster showcase with rotating sunburst rays, custom pixel #1 champion medal,
 * database `achievement_text`, victory roadmap, and 4 arcade count-up scoreboard cards.
 */
const CONFETTI_PIXELS = [
  { dx: -88, dy: -74, color: '#F0E808', size: 11, rot: -35 },
  { dx: 84, dy: -78, color: '#16B853', size: 11, rot: 40 },
  { dx: -102, dy: -16, color: '#00F0F0', size: 10, rot: -20 },
  { dx: 104, dy: -18, color: '#FFFFFF', size: 10, rot: 28 },
  { dx: -72, dy: 64, color: '#16B853', size: 10, rot: 32 },
  { dx: 76, dy: 62, color: '#F0E808', size: 11, rot: -30 },
  { dx: -32, dy: -96, color: '#FFFFFF', size: 9, rot: 22 },
  { dx: 36, dy: -94, color: '#00F0F0', size: 9, rot: -25 },
  { dx: -52, dy: -46, color: '#080A0D', size: 8, rot: 45 },
  { dx: 54, dy: -44, color: '#F0E808', size: 8, rot: -45 },
  { dx: 0, dy: -104, color: '#16B853', size: 10, rot: 15 },
  { dx: -26, dy: 82, color: '#00F0F0', size: 9, rot: -18 },
]

export const AchievementSection: React.FC<AchievementSectionProps> = ({
  achievementText,
  loading,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [celebrateKey, setCelebrateKey] = useState(0)

  const scoreboard = [
    {
      id: 'rank',
      icon: <Trophy size={23} strokeWidth={2.7} />,
      target: 1,
      prefix: 'رتبه‌ی ',
      suffix: '',
      label: 'مقام قهرمانی مرحله‌ی شهرستانی (خوسف)',
      badge: 'مدال اول',
      barColor: '#E5252A',
    },
    {
      id: 'season',
      icon: <Award size={23} strokeWidth={2.7} />,
      target: 7,
      prefix: 'دوره‌ی ',
      suffix: '',
      label: 'درخشش در رویداد تولید محتوای دیجیتال بسیج',
      badge: 'افتخار',
      barColor: '#16B853',
    },
    {
      id: 'squad',
      icon: <Users size={23} strokeWidth={2.7} />,
      target: 5,
      prefix: '',
      suffix: ' عضو',
      label: 'تیم منسجم در رشته‌ی نرم‌افزار تلفن همراه',
      badge: 'ترکیب کامل',
      barColor: '#00A8A8',
    },
    {
      id: 'power',
      icon: <Flame size={23} strokeWidth={2.7} />,
      target: 100,
      prefix: '',
      suffix: '٪',
      label: 'آمادگی برای تکرار مقام نخست در دوره‌ی هشتم',
      badge: 'دوره‌ی ۰۸',
      barColor: '#E5252A',
    },
  ]

  return (
    <section
      id="achievement"
      className="relative z-10 py-14 sm:py-22 px-3.5 sm:px-6 scroll-mt-24"
      aria-labelledby="achievement-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section-Title Pill */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-10"
        >
          <SectionPill
            index={1}
            title="افتخارات تیم"
            subtitle="کارنامه‌ی قهرمانی رَسا"
          />
        </motion.div>

        {/* Split-Poster Championship Monument */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="poster-card-xl overflow-hidden mb-7 sm:mb-8"
        >
          {/* Racing Pixel Checkerboard Strip */}
          <div className="h-4 pixel-checker-strip border-b-[3px] border-[#080A0D]" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* RIGHT 4 COLS: Vivid Red Graphic Medal Stage with Rotating Sunburst & Pixel Confetti */}
            <div
              onClick={() => !shouldReduceMotion && setCelebrateKey((k) => k + 1)}
              className="md:col-span-4 bg-red-poster relative overflow-hidden p-7 sm:p-9 flex flex-col items-center justify-center border-b-[3.5px] md:border-b-0 md:border-l-[3.5px] border-[#080A0D] min-h-[260px] cursor-pointer select-none"
            >
              {/* Rotating Graphic Sunburst Rays */}
              <div
                aria-hidden="true"
                className="spin-slow absolute w-[360px] h-[360px] opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(from 0deg, #FFFFFF 0deg 12deg, transparent 12deg 24deg)',
                }}
              />

              {/* Pixel Confetti Celebration Burst on Click */}
              {!shouldReduceMotion && celebrateKey > 0 && (
                <div
                  key={celebrateKey}
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  {CONFETTI_PIXELS.map((p, i) => (
                    <motion.span
                      key={i}
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                      animate={{
                        x: p.dx,
                        y: p.dy,
                        scale: [1, 1.25, 0],
                        opacity: [1, 1, 0],
                        rotate: p.rot,
                      }}
                      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                      }}
                      className="absolute border-[1.5px] border-[#080A0D]"
                    />
                  ))}
                </div>
              )}

              {/* Corner #1 Sticker */}
              <span className="absolute top-3.5 right-3.5 z-10 bg-[#16B853] text-white border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D] rounded-[6px] px-3 py-1 font-black text-xs sm:text-sm">
                مقام #۱
              </span>

              {/* Levitating Pixel Champion Medal */}
              <motion.div
                whileTap={shouldReduceMotion ? undefined : { scale: 0.9, rotate: -6 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -9, 0], rotate: [-1.5, 1.5, -1.5] }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
                className="relative z-10 drop-shadow-[-6px_6px_0_rgba(8,10,13,0.45)]"
              >
                <PixelChampionMedal className="w-36 h-40 sm:w-40 sm:h-44" />
              </motion.div>

              {/* Location Pill */}
              <span className="relative z-10 mt-3 bg-[#080A0D] text-[#F0E808] border-2 border-white rounded-[5px] px-3 py-1 text-xs font-black">
                شهرستان خوسف • دوره‌ی هفتم
              </span>
            </div>

            {/* LEFT 8 COLS: Achievement Text & Victory Path */}
            <div className="md:col-span-8 p-6 sm:p-9 lg:p-11 flex flex-col justify-between gap-6 bg-white relative">
              {/* Official mini event cursor watermark corner */}
              <div
                className="hidden sm:block absolute top-5 left-5 opacity-90 pointer-events-none"
                aria-hidden="true"
              >
                <EventCursorLogo className="w-8 h-10" tilted />
              </div>

              <div>
                <div className="mb-4">
                  <CheckChip label="افتخار ثبت‌شده در کارنامه‌ی تیم" accent="green" size="sm" />
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <BrutalSkeleton
                      className="h-11 w-full"
                      label="در حال بارگذاری افتخار تیم..."
                    />
                    <BrutalSkeleton className="h-11 w-3/4" />
                  </div>
                ) : (
                  <h2
                    id="achievement-heading"
                    className="font-black text-2xl sm:text-3xl lg:text-[2.35rem] text-[#080A0D] leading-[1.5]"
                  >
                    {achievementText}
                  </h2>
                )}
              </div>

              {/* Graphic Season 7 -> Season 8 Progression Track */}
              <div className="bg-[#EEF0F3] border-[3px] border-[#080A0D] shadow-[-5px_5px_0_#080A0D] rounded-[9px] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 bg-[#16B853] text-white border-2 border-[#080A0D] rounded-[5px] inline-flex items-center justify-center font-black text-sm shrink-0">
                    ۷
                  </span>
                  <div>
                    <div className="text-xs font-black text-[#080A0D]">دوره‌ی هفتم</div>
                    <div className="text-[11px] font-bold text-[#080A0D]/75">کسب رتبه‌ی اول (خوسف)</div>
                  </div>
                </div>

                {/* Animated connector */}
                <div
                  className="hidden sm:flex flex-1 items-center gap-1.5 mx-2"
                  aria-hidden="true"
                >
                  <span className="h-[3px] flex-1 bg-[#080A0D]" />
                  <span className="w-2.5 h-2.5 bg-[#00D4C8] border border-[#080A0D] pixel-blink" />
                  <span className="h-[3px] flex-1 bg-[#E5252A]" />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 bg-[#E5252A] text-white border-2 border-[#080A0D] rounded-[5px] inline-flex items-center justify-center font-black text-sm shrink-0">
                    ۸
                  </span>
                  <div>
                    <div className="text-xs font-black text-[#E5252A]">دوره‌ی هشتم (اکنون)</div>
                    <div className="text-[11px] font-bold text-[#080A0D]/80">خیز دوباره برای مقام نخست</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Arcade Scoreboard Count-Up Cards (Signature Red Icon Box on the Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {scoreboard.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="poster-card poster-card-lift p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  {/* Signature Strong Red Icon Box on the Right */}
                  <div
                    className="brutal-icon-box w-12 h-12 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 bg-[#080A0D] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[4px] mb-1">
                      <span className="w-1.5 h-1.5 bg-[#16B853]" aria-hidden="true" />
                      <span>{item.badge}</span>
                    </span>
                    <div className="font-black text-2xl sm:text-[1.7rem] text-[#080A0D] leading-tight">
                      <CountUpNumber
                        target={item.target}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        durationMs={1200 + idx * 200}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#080A0D]/80 leading-6">
                  {item.label}
                </p>
              </div>

              <PixelMeterBar color={item.barColor} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
