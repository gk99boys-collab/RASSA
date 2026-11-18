import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Code2, Compass, Smartphone, Sparkles } from 'lucide-react'
import {
  EventCursorLogo,
  PixelBarcode,
  RasaTeamLogo,
} from './BrandAssets'
import { BrutalSkeleton, SectionPill } from './BrutalUI'

interface AboutSectionProps {
  teamName: string
  description: string
  loading: boolean
}

const PILLARS = [
  {
    num: '۰۱',
    title: 'می‌رسیم',
    text: 'با شناخت دقیق مسئله، هماهنگی تیمی و زمان‌بندی منظم، سریع و هدفمند از ایده به نقشه راه عملی می‌رسیم.',
    icon: <Compass size={24} strokeWidth={2.7} />,
    shadow: '-6px 6px 0 #E5252A',
    accent: '#E5252A',
  },
  {
    num: '۰۲',
    title: 'می‌سازیم',
    text: 'با به‌روزترین ابزارهای توسعه‌ی اپلیکیشن موبایل، بک‌اند، گرافیک و انیمیشن، محصولی روان و استاندارد می‌سازیم.',
    icon: <Code2 size={24} strokeWidth={2.7} />,
    shadow: '-6px 6px 0 #00D4C8',
    accent: '#00A8A8',
  },
  {
    num: '۰۳',
    title: 'می‌درخشیم',
    text: 'با ترکیب کیفیت فنی، هویت بصری چشم‌نواز و ارائه‌ی قانع‌کننده، مثل دوره‌ی هفتم برای مقام نخست می‌درخشیم.',
    icon: <Sparkles size={24} strokeWidth={2.7} />,
    shadow: '-6px 6px 0 #16B853',
    accent: '#16B853',
  },
]

/**
 * Section 4 — High-Contrast Obsidian Blueprint Bento (About the Team):
 * Pairs the database `description` poster with an official RASSA × Event crossover card
 * and 3 animated step cards matching the tagline "می‌رسیم، می‌سازیم، می‌درخشیم".
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  teamName,
  description,
  loading,
}) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="about"
      className="relative z-10 bg-obsidian-grid border-y-[4px] border-[#080A0D] scroll-mt-20 overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Top Strong Red Accent Bar */}
      <div className="h-2.5 bg-[#E5252A] border-b-[3px] border-[#080A0D]" aria-hidden="true" />

      <div className="max-w-6xl mx-auto py-16 sm:py-24 px-3.5 sm:px-6 relative">
        {/* Section-Title Pill (Dark Context) */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-11"
        >
          <SectionPill
            index={2}
            title={`درباره تیم ${teamName}`}
            subtitle="ماموریت و چشم‌انداز"
            darkContext
          />
        </motion.div>

        {/* 12-Column Graphic Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 mb-7 sm:mb-8">
          {/* RIGHT 8 COLS: Team Description Manifesto Card (from Supabase) */}
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 bg-white text-[#080A0D] border-[3px] border-white shadow-[-8px_8px_0_#E5252A] rounded-[11px] overflow-hidden flex flex-col group"
          >
            {/* Window Bar */}
            <div className="bg-[#EEF0F3] border-b-[3px] border-[#080A0D] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#080A0D]">
                <span className="w-2.5 h-2.5 bg-[#E5252A] border border-[#080A0D]" aria-hidden="true" />
                <span>بیانیه‌ی تیم نرم‌افزاری {teamName}</span>
              </div>
              <PixelBarcode className="h-3.5 text-[#080A0D]/70" />
            </div>

            <div className="p-6 sm:p-9 flex-1 flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
              {/* Signature Red Icon Box on the Right */}
              <div
                className="brutal-icon-box w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Smartphone size={30} strokeWidth={2.7} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                  <h2
                    id="about-heading"
                    className="font-black text-2xl sm:text-3xl text-[#080A0D]"
                  >
                    داستان و هدف {teamName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 bg-[#080A0D] text-[#16B853] text-xs font-black px-2.5 py-1 rounded-[5px]">
                    <span className="w-2 h-2 bg-[#16B853]" aria-hidden="true" />
                    <span>اپلیکیشن و سایت</span>
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3 mt-2">
                    <BrutalSkeleton
                      className="h-7 w-full"
                      label="در حال بارگذاری توضیحات تیم..."
                    />
                    <BrutalSkeleton className="h-7 w-11/12" />
                    <BrutalSkeleton className="h-7 w-2/3" />
                  </div>
                ) : (
                  <p className="text-base sm:text-xl font-bold text-[#080A0D]/90 leading-[2.05]">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* LEFT 4 COLS: Official Dual-Brand Crossover Card (RASSA × 8th Event) */}
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.48, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 bg-[#0E141B] text-white border-[3px] border-white shadow-[-8px_8px_0_#16B853] rounded-[11px] p-6 flex flex-col items-center justify-between gap-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 pixel-scanlines pointer-events-none" aria-hidden="true" />

            <span className="relative z-10 inline-flex items-center gap-2 bg-white text-[#080A0D] font-black text-xs px-3 py-1 rounded-[5px]">
              <span className="w-2 h-2 bg-[#E5252A]" aria-hidden="true" />
              <span>حضور رسمی در رویداد هشتم</span>
            </span>

            {/* Dual Official Logos Side by Side */}
            <div className="relative z-10 flex items-center justify-center gap-4 my-2">
              <div className="bg-[#070A0E] border-2 border-[#00D4C8]/60 rounded-[9px] p-3.5 flex items-center justify-center">
                <RasaTeamLogo className="w-28 sm:w-32" alt="لوگوی تیم رَسا" glow />
              </div>

              <span className="font-black text-xl text-[#E5252A] select-none" aria-hidden="true">
                ×
              </span>

              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
                }
                className="bg-white border-2 border-white rounded-[9px] px-3.5 py-2.5 flex items-center justify-center shadow-[-3px_3px_0_#E5252A]"
              >
                <EventCursorLogo
                  className="w-10 h-14"
                  alt="لوگوی هشتمین رویداد ملی تولید محتوای دیجیتال بسیج"
                  tilted
                />
              </motion.div>
            </div>

            <div className="relative z-10 text-center text-xs font-extrabold text-white/80 leading-6">
              ترکیب خلاقیت گرافیکی، مهندسی نرم‌افزار و تجربه‌ی قهرمانی
            </div>
          </motion.div>
        </div>

        {/* 3 Animated Tagline Pillar Cards (می‌رسیم / می‌سازیم / می‌درخشیم) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={shouldReduceMotion ? undefined : { y: -5 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: idx * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ boxShadow: pillar.shadow }}
              className="bg-white text-[#080A0D] border-[3px] border-white rounded-[10px] p-5 sm:p-6 relative overflow-hidden group"
            >
              {/* Giant Background Step Number */}
              <span
                aria-hidden="true"
                className="absolute -bottom-3 left-3 font-black text-6xl text-[#080A0D]/[0.07] leading-none select-none pointer-events-none"
              >
                {pillar.num}
              </span>

              <div className="relative z-10 flex items-start gap-4">
                {/* Signature Red Icon Box on the Right */}
                <div
                  className="brutal-icon-box w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  {pillar.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-black text-xl sm:text-2xl text-[#080A0D]">
                      {pillar.title}
                    </h3>
                    <span
                      style={{ backgroundColor: pillar.accent }}
                      className="w-2.5 h-2.5 border border-[#080A0D] shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-bold text-[#080A0D]/80 leading-7">
                    {pillar.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Checkerboard Strip */}
      <div className="h-3.5 pixel-checker-strip border-t-[3px] border-[#080A0D]" aria-hidden="true" />
    </section>
  )
}
