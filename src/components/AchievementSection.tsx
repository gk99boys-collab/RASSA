import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Award, Flame, Trophy } from 'lucide-react'
import { PixelMedal } from './PixelArt'
import { BrutalSkeleton, CheckChip, SectionPill } from './BrutalUI'
import { toPersianDigits } from '../lib/supabase'

interface AchievementSectionProps {
  achievementText: string
  loading: boolean
}

interface CountUpValueProps {
  target: number
  prefix?: string
  suffix?: string
  durationMs?: number
  startFrom?: number
}

const CountUpValue: React.FC<CountUpValueProps> = ({
  target,
  prefix = '',
  suffix = '',
  durationMs = 1350,
  startFrom = 0,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const shouldReduceMotion = useReducedMotion()
  const [value, setValue] = useState<number>(shouldReduceMotion ? target : startFrom)

  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(target)
      return
    }
    if (!isInView) return

    let rafId = 0
    const startTime = performance.now()
    const delta = target - startFrom

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / durationMs)
      // Ease-out cubic for snappy finish
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startFrom + delta * eased))

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }

    rafId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(rafId)
  }, [durationMs, isInView, shouldReduceMotion, startFrom, target])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {toPersianDigits(value)}
      {suffix}
    </span>
  )
}

/**
 * Section 3 — Achievement:
 * Displays `achievement_text` from Supabase with a custom pixel-art champion medal
 * and scroll-triggered Persian numeral count-up cards.
 */
export const AchievementSection: React.FC<AchievementSectionProps> = ({
  achievementText,
  loading,
}) => {
  const shouldReduceMotion = useReducedMotion()

  const stats = [
    {
      id: 'rank',
      icon: <Trophy size={24} strokeWidth={2.6} />,
      target: 1,
      startFrom: 0,
      prefix: 'رتبه‌ی ',
      suffix: '',
      label: 'مقام قهرمانی مرحله‌ی شهرستانی (خوسف)',
      tag: 'قهرمان',
    },
    {
      id: 'edition',
      icon: <Award size={24} strokeWidth={2.6} />,
      target: 7,
      startFrom: 0,
      prefix: 'دوره‌ی ',
      suffix: '',
      label: 'کسب افتخار در رویداد تولید محتوای بسیج',
      tag: 'سابقه‌ی درخشان',
    },
    {
      id: 'readiness',
      icon: <Flame size={24} strokeWidth={2.6} />,
      target: 100,
      startFrom: 0,
      prefix: '',
      suffix: '٪',
      label: 'آمادگی برای تکرار مقام نخست در دوره‌ی هشتم',
      tag: 'دوره‌ی ۸',
    },
  ]

  return (
    <section
      id="achievement"
      className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 scroll-mt-20"
      aria-labelledby="achievement-heading"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section-Title Pill */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 sm:mb-9"
        >
          <SectionPill index={1} title="افتخارات تیم" />
        </motion.div>

        {/* Main Achievement Banner Card with Pixel Medal */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="brutal-card-lg overflow-hidden mb-6 sm:mb-8"
        >
          {/* Strong Red Top Ribbon */}
          <div className="bg-[#E5252A] text-white border-b-[3px] border-[#0A0A0A] px-5 py-2.5 flex items-center justify-between gap-3">
            <span className="font-black text-xs sm:text-sm tracking-tight">
              کارنامه‌ی افتخار تیم رَسا
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-[4px]">
              <span className="w-2 h-2 bg-[#22C55E]" aria-hidden="true" />
              <span>تاییدشده</span>
            </span>
          </div>

          <div className="p-6 sm:p-9 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8">
            {/* Pixel Medal Showcase Frame (Right side in RTL) */}
            <div
              className="w-40 sm:w-44 shrink-0 bg-[#F1F2F4] border-[3px] border-[#0A0A0A] shadow-[-5px_5px_0_#0A0A0A] rounded-[8px] p-4 flex flex-col items-center justify-center relative"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(10,10,10,0.18) 1.3px, transparent 1.3px)',
                backgroundSize: '12px 12px',
              }}
            >
              <span className="absolute -top-3 -right-3 bg-[#22C55E] text-[#0A0A0A] border-[3px] border-[#0A0A0A] font-black text-xs px-2 py-0.5 rounded-[5px] shadow-[-2px_2px_0_#0A0A0A]">
                #۱
              </span>
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <PixelMedal size={104} />
              </motion.div>
            </div>

            {/* Achievement Text from Database */}
            <div className="flex-1 flex flex-col justify-center text-center sm:text-right">
              <div className="mb-3.5 flex justify-center sm:justify-start">
                <CheckChip label="مدال قهرمانی دوره‌ی گذشته" accent="green" size="sm" />
              </div>

              {loading ? (
                <div className="space-y-3">
                  <BrutalSkeleton
                    className="h-10 w-full"
                    label="در حال بارگذاری افتخارات تیم..."
                  />
                  <BrutalSkeleton className="h-10 w-3/4 mx-auto sm:mx-0" />
                </div>
              ) : (
                <h2
                  id="achievement-heading"
                  className="font-black text-2xl sm:text-3xl md:text-4xl text-[#0A0A0A] leading-[1.45] mb-3"
                >
                  {achievementText}
                </h2>
              )}

              <p className="text-sm sm:text-base font-bold text-[#0A0A0A]/75 leading-7">
                با تجربه‌ی شیرین ایستادن بر سکوی نخست، حالا با انرژی دوچندان در هشتمین دوره‌ی
                رویداد ملی تولید محتوای دیجیتال بسیج حضور یافته‌ایم.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Count-Up Stat Cards (Cards with Red Icon Box on the Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="brutal-card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-transform"
            >
              {/* Signature Red Icon Box on the Right (RTL start) */}
              <div
                className="brutal-icon-box w-13 h-13 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {stat.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-black text-2xl sm:text-3xl text-[#0A0A0A] leading-none">
                    <CountUpValue
                      target={stat.target}
                      startFrom={stat.startFrom}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      durationMs={1200 + idx * 220}
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#0A0A0A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[4px] shrink-0">
                    <span className="w-1.5 h-1.5 bg-[#22C55E]" />
                    {stat.tag}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#0A0A0A]/80 leading-6 mt-1.5">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
