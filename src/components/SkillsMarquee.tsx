import React, { useMemo } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import type { Member } from '../types'
import { EventCursorLogo, RasaWaveMark } from './BrandAssets'

interface SkillsMarqueeProps {
  members: Member[]
  tagline: string
}

const FALLBACK_SKILLS = [
  'نرم‌افزارهای ویژه تلفن همراه',
  'توسعه موبایل',
  'مدیریت پروژه',
  'بک‌اند',
  'پایگاه داده',
  'طراحی گرافیک',
  'طراحی سایت',
  'تولید محتوا و انیمیشن',
  'ارائه',
  'حسابداری شرکتی',
]

/**
 * Super-Graphical Dual Counter-Rotating Criss-Cross Marquee Ribbons
 * featuring team skills, the official 8th Event cursor arrow, and the RASSA wave crest.
 */
export const SkillsMarquee: React.FC<SkillsMarqueeProps> = ({ members, tagline }) => {
  const shouldReduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 320 })
  const boostLeft = useTransform(
    smoothVelocity,
    [-1800, 0, 1800],
    shouldReduceMotion ? [0, 0, 0] : [55, 0, -55]
  )
  const boostRight = useTransform(
    smoothVelocity,
    [-1800, 0, 1800],
    shouldReduceMotion ? [0, 0, 0] : [-55, 0, 55]
  )
  const skills = useMemo(() => {
    const set = new Set<string>(['نرم‌افزارهای ویژه تلفن همراه'])
    for (const m of members) {
      for (const s of m.skills) {
        const clean = s.trim()
        if (clean) set.add(clean)
      }
    }
    const list = Array.from(set)
    return list.length >= 5 ? list : FALLBACK_SKILLS
  }, [members])

  const mottos = useMemo(
    () => [
      tagline || 'رَسا؛ می‌رسیم، می‌سازیم، می‌درخشیم',
      'هشتمین رویداد ملی تولید محتوای دیجیتال بسیج',
      'رتبه‌ی اول مرحله‌ی شهرستانی (خوسف)',
      'رشته نرم‌افزارهای ویژه تلفن همراه',
      'RASSA SOFTWARE TEAM // 08',
    ],
    [tagline]
  )

  const renderSkillsHalf = (keyPrefix: string, hidden?: boolean) => (
    <div key={keyPrefix} aria-hidden={hidden} className="flex items-center shrink-0">
      {skills.map((skill, idx) => (
        <div key={`${keyPrefix}-${idx}`} className="flex items-center shrink-0">
          <span
            dir="rtl"
            className="mx-3 inline-flex items-center gap-2 bg-white text-[#080A0D] border-[3px] border-[#080A0D] shadow-[-4px_4px_0_#080A0D] rounded-[6px] px-3.5 py-1 font-black text-sm sm:text-base"
          >
            <span
              className={`w-2.5 h-2.5 border border-[#080A0D] shrink-0 ${
                idx % 3 === 0
                  ? 'bg-[#16B853]'
                  : idx % 3 === 1
                    ? 'bg-[#00D4C8]'
                    : 'bg-[#F0E808]'
              }`}
            />
            <span>{skill}</span>
          </span>
          <span className="w-8 h-8 bg-[#080A0D] border-2 border-white rounded-[5px] inline-flex items-center justify-center shrink-0 mx-0.5">
            <EventCursorLogo className="w-4 h-5" tilted />
          </span>
        </div>
      ))}
    </div>
  )

  const renderMottosHalf = (keyPrefix: string, hidden?: boolean) => (
    <div key={keyPrefix} aria-hidden={hidden} className="flex items-center shrink-0">
      {mottos.map((item, idx) => (
        <div key={`${keyPrefix}-${idx}`} className="flex items-center shrink-0">
          <span
            dir="rtl"
            className="mx-4 text-white/95 font-black text-xs sm:text-sm tracking-tight"
          >
            {item}
          </span>
          <RasaWaveMark className="w-7 h-4 shrink-0" />
          <span className="mx-3 w-2 h-2 bg-[#16B853] shrink-0" />
        </div>
      ))}
    </div>
  )

  return (
    <div
      aria-label="نوار متحرک مهارت‌ها و شعار تیم رَسا"
      className="relative z-10 py-5 sm:py-8 overflow-x-clip select-none"
    >
      {/* Ribbon 1: Strong Red Diagonal Skills Ticker (Scroll-Velocity Reactive) */}
      <div className="marquee-band relative z-20 -mx-4 bg-[#E5252A] border-y-[3.5px] border-[#080A0D] shadow-[0_7px_0_#080A0D] py-3 -rotate-[1.2deg]">
        <motion.div style={{ x: boostLeft }}>
          <div dir="ltr" className="marquee-track-fwd">
            {renderSkillsHalf('s1', false)}
            {renderSkillsHalf('s2', true)}
          </div>
        </motion.div>
      </div>

      {/* Ribbon 2: Counter-Scrolling Jet-Black Identity Ticker */}
      <div className="marquee-band relative z-10 -mx-4 -mt-1.5 bg-[#080A0D] border-y-[3px] border-[#080A0D] py-2.5 rotate-[0.9deg]">
        <motion.div style={{ x: boostRight }}>
          <div dir="ltr" className="marquee-track-rev">
            {renderMottosHalf('m1', false)}
            {renderMottosHalf('m2', true)}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
