import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Award } from 'lucide-react'
import { toPersianDigits } from '../../lib/supabase'
import { MinimalSkeleton, SILK_EASE } from '../MotionPrimitives'

interface AchievementSceneProps {
  achievementText: string
  membersCount: number
  loading: boolean
}

export const AchievementScene: React.FC<AchievementSceneProps> = ({
  achievementText,
  membersCount,
  loading,
}) => {
  const shouldReduceMotion = useReducedMotion()

  const stats = [
    { value: toPersianDigits('01'), label: 'رتبه شهرستانی (خوسف)' },
    { value: toPersianDigits('07'), label: 'دوره کسب عنوان' },
    { value: toPersianDigits(`0${membersCount || 5}`), label: 'اعضای تیم در دوره هشتم' },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center px-2">
      {/* Minimalist Animated Ring & Rank Emblem */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: SILK_EASE }}
        className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-6"
      >
        {/* Drawn circular hairline progress stroke */}
        <svg
          viewBox="0 0 112 112"
          className="absolute inset-0 w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="56"
            cy="56"
            r="50"
            fill="none"
            stroke="rgba(13, 18, 23, 0.07)"
            strokeWidth="1.5"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="50"
            fill="none"
            stroke="#008F8C"
            strokeWidth="2"
            strokeLinecap="round"
            initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.15, delay: 0.1, ease: SILK_EASE }}
          />
        </svg>

        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 4.4, repeat: Infinity, ease: 'easeInOut' }
          }
          className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white shadow-[0_12px_30px_-10px_rgba(0,143,140,0.22)] border border-[#0D1217]/[0.06] flex flex-col items-center justify-center"
        >
          <Award size={18} strokeWidth={2} className="text-[#10A848] mb-0.5" aria-hidden="true" />
          <span className="font-black text-2xl sm:text-3xl text-[#0D1217] leading-none">
            {toPersianDigits(1)}
          </span>
        </motion.div>
      </motion.div>

      {/* Eyebrow */}
      <motion.span
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: SILK_EASE }}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#10A848] mb-3.5"
      >
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#10A848]" />
        <span>افتخار تیم</span>
      </motion.span>

      {/* Main Achievement Text from Supabase */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.65, delay: 0.12, ease: SILK_EASE }}
        className="w-full"
      >
        {loading ? (
          <MinimalSkeleton
            className="h-10 w-80 sm:w-[28rem] mx-auto"
            label="در حال بارگذاری افتخار تیم..."
          />
        ) : (
          <h2 className="font-black text-2xl sm:text-3xl md:text-4xl text-[#0D1217] leading-[1.55] tracking-tight">
            {achievementText}
          </h2>
        )}
      </motion.div>

      {/* Calm 3-column hairline metric strip */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.22, ease: SILK_EASE }}
        className="mt-8 sm:mt-10 grid grid-cols-3 divide-x divide-x-reverse divide-[#0D1217]/[0.08] w-full max-w-lg"
      >
        {stats.map((s) => (
          <div key={s.label} className="px-3 sm:px-5 flex flex-col items-center">
            <span className="font-black text-xl sm:text-2xl text-[#0D1217] tabular-nums">
              {s.value}
            </span>
            <span className="mt-1 text-[11px] sm:text-xs font-medium text-[#6B7280] leading-5">
              {s.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
