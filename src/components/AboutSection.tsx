import React from 'react'
import { motion } from 'framer-motion'
import { Code2, Compass, Smartphone, Sparkles } from 'lucide-react'
import { BrutalSkeleton, IconCard, SectionPill } from './BrutalUI'
import { PixelCursorLogo } from './PixelArt'

interface AboutSectionProps {
  teamName: string
  description: string
  loading: boolean
}

const PILLARS = [
  {
    title: 'می‌رسیم',
    text: 'با مدیریت پروژه‌ی منظم، شناخت نیاز کاربر و برنامه‌ریزی دقیق، هر ایده را به‌موقع به نقطه هدف می‌رسانیم.',
    icon: <Compass size={24} strokeWidth={2.6} />,
  },
  {
    title: 'می‌سازیم',
    text: 'از رابط کاربری و انیمیشن تا توسعه‌ی موبایل و بک‌اند پایدار را با به‌روزترین ابزارهای روز پیاده‌سازی می‌کنیم.',
    icon: <Code2 size={24} strokeWidth={2.6} />,
  },
  {
    title: 'می‌درخشیم',
    text: 'با ترکیب کیفیت فنی، طراحی چشم‌نواز و ارائه‌ی قانع‌کننده، دوباره برای کسب مقام نخست به میدان آمده‌ایم.',
    icon: <Sparkles size={24} strokeWidth={2.6} />,
  },
]

/**
 * Section 4 — About the Team:
 * Displays `description` from Supabase inside a signature neo-brutalist card with a
 * red icon box on the right, paired with the team's 3 core pillars.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  teamName,
  description,
  loading,
}) => {
  return (
    <section
      id="about"
      className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 scroll-mt-20"
      aria-labelledby="about-heading"
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
          <SectionPill index={2} title={`درباره تیم ${teamName}`} />
        </motion.div>

        {/* Main Description Card (from Supabase) with Red Icon Box on the Right */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="brutal-card-lg p-6 sm:p-9 mb-6 sm:mb-8 relative overflow-hidden"
        >
          {/* Decorative left-bottom pixel cursor motif */}
          <div
            className="hidden sm:block absolute bottom-4 left-4 opacity-90 pointer-events-none"
            aria-hidden="true"
          >
            <PixelCursorLogo size={36} />
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Red Icon Box on the Right */}
            <div
              className="brutal-icon-box w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Smartphone size={30} strokeWidth={2.6} />
            </div>

            <div className="flex-1 min-w-0 sm:pl-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <h2
                  id="about-heading"
                  className="font-black text-2xl sm:text-3xl text-[#0A0A0A]"
                >
                  داستان و هدف تیم {teamName}
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white text-xs font-extrabold px-2.5 py-1 rounded-[5px]">
                  <span className="w-2 h-2 bg-[#22C55E]" aria-hidden="true" />
                  <span>اپلیکیشن و وب</span>
                </span>
              </div>

              {loading ? (
                <div className="space-y-3 mt-2">
                  <BrutalSkeleton
                    className="h-7 w-full"
                    label="در حال بارگذاری توضیحات تیم..."
                  />
                  <BrutalSkeleton className="h-7 w-11/12" />
                  <BrutalSkeleton className="h-7 w-3/5" />
                </div>
              ) : (
                <p className="text-base sm:text-xl font-bold text-[#0A0A0A]/90 leading-[2]">
                  {description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Three Tagline Pillars — Cards with Red Icon Box on the Right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: idx * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <IconCard icon={pillar.icon} title={pillar.title} className="h-full">
                <p className="text-sm font-medium text-[#0A0A0A]/80 leading-7">
                  {pillar.text}
                </p>
              </IconCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
