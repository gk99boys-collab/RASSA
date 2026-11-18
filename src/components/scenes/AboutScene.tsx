import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LIQUID_SPRING, MinimalSkeleton, SILK_EASE } from '../MotionPrimitives'

interface AboutSceneProps {
  teamName: string
  description: string
  loading: boolean
}

const STEPS = [
  {
    key: 'arrive',
    title: 'می‌رسیم',
    note: 'شناخت دقیق نیاز کاربر و تبدیل ایده به نقشه راه روشن.',
  },
  {
    key: 'build',
    title: 'می‌سازیم',
    note: 'توسعه اپلیکیشن و وب با ابزارهای روز، طراحی دقیق و عملکرد روان.',
  },
  {
    key: 'shine',
    title: 'می‌درخشیم',
    note: 'ارائه منظم و باکیفیت برای تکرار قهرمانی در دوره‌ی هشتم.',
  },
]

export const AboutScene: React.FC<AboutSceneProps> = ({
  teamName,
  description,
  loading,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(0)
  const [userInteracted, setUserInteracted] = useState(false)

  useEffect(() => {
    if (shouldReduceMotion || userInteracted) return
    const id = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [shouldReduceMotion, userInteracted])

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center px-2">
      {/* Subtle Eyebrow */}
      <motion.span
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SILK_EASE }}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#008F8C] mb-5"
      >
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#008F8C]" />
        <span>درباره تیم {teamName}</span>
      </motion.span>

      {/* Editorial Team Description */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.65, delay: 0.06, ease: SILK_EASE }}
        className="w-full"
      >
        {loading ? (
          <div className="space-y-3 max-w-xl mx-auto">
            <MinimalSkeleton className="h-7 w-full" label="در حال بارگذاری توضیحات تیم..." />
            <MinimalSkeleton className="h-7 w-11/12 mx-auto" />
            <MinimalSkeleton className="h-7 w-3/4 mx-auto" />
          </div>
        ) : (
          <p className="text-xl sm:text-2xl md:text-[1.7rem] font-extrabold text-[#0D1217] leading-[1.95] tracking-tight">
            {description}
          </p>
        )}
      </motion.div>

      {/* Liquid 3-Step Interactive Pill Switcher */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: SILK_EASE }}
        className="mt-8 sm:mt-10 flex flex-col items-center"
      >
        <div
          role="tablist"
          aria-label="مسیر تیم رَسا"
          className="inline-flex items-center p-1 rounded-full bg-[#0D1217]/[0.045] border border-[#0D1217]/[0.06]"
        >
          {STEPS.map((step, idx) => {
            const active = activeStep === idx
            return (
              <button
                key={step.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setUserInteracted(true)
                  setActiveStep(idx)
                }}
                className={`relative px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                  active ? 'text-[#0D1217]' : 'text-[#6B7280] hover:text-[#0D1217]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="about-step-pill"
                    transition={LIQUID_SPRING}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_rgba(13,18,23,0.08)]"
                  />
                )}
                <span className="relative z-10">{step.title}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 min-h-[1.75rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={STEPS[activeStep].key}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: SILK_EASE }}
              className="text-xs sm:text-sm font-medium text-[#525B66]"
            >
              {STEPS[activeStep].note}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
