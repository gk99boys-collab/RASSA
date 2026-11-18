import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Users } from 'lucide-react'
import { EventCursorLogo, RasaWaveMark } from './BrandAssets'
import { BrutalButton } from './BrutalUI'

interface NavbarProps {
  teamName: string
}

const NAV_ITEMS = [
  { id: 'hero', label: 'خانه', href: '#hero' },
  { id: 'achievement', label: 'افتخارات', href: '#achievement' },
  { id: 'about', label: 'درباره رَسا', href: '#about' },
  { id: 'members', label: 'اعضای تیم', href: '#members' },
]

/**
 * Floating Neo-Brutalist Command Dock featuring BOTH official logos,
 * live scroll-spy spring pill highlight, and a tri-tone scroll progress rail.
 */
export const Navbar: React.FC<NavbarProps> = ({ teamName }) => {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 30,
    restDelta: 0.001,
  })
  const [activeId, setActiveId] = useState<string>('hero')

  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0.05, 0.25, 0.5],
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sticky top-0 z-30 pt-2.5 sm:pt-3 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto bg-white/95 backdrop-blur-sm border-[3px] border-[#080A0D] shadow-[-6px_6px_0_#080A0D] rounded-[10px] overflow-hidden">
        <div className="px-3.5 sm:px-5 h-15 sm:h-16 flex items-center justify-between gap-3">
          {/* RTL Right: Official RASSA Wave Badge + Team Name + Official Event Cursor Badge */}
          <a
            href="#hero"
            className="inline-flex items-center gap-2.5 group shrink-0"
            aria-label={`تیم نرم‌افزاری ${teamName}`}
          >
            {/* Official RASSA Mark Badge */}
            <span className="w-11 h-10 bg-[#080A0D] border-[2.5px] border-[#080A0D] shadow-[-3px_3px_0_#E5252A] rounded-[6px] inline-flex items-center justify-center p-1 transition-transform duration-150 group-hover:-rotate-3 group-hover:scale-105">
              <RasaWaveMark className="w-full h-full" />
            </span>

            <div className="flex flex-col leading-none">
              <span className="font-black text-xl sm:text-2xl text-[#080A0D] tracking-tight">
                {teamName}
              </span>
              <span className="text-[9px] font-black tracking-[0.18em] text-[#008C8C] mt-0.5">
                RASSA
              </span>
            </div>

            {/* Official 8th Event Pixel Cursor Mini Pill */}
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#080A0D] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-[5px] border-2 border-[#080A0D] mr-1">
              <EventCursorLogo className="w-3.5 h-4" tilted />
              <span>رویداد هشتم</span>
              <span className="w-2 h-2 bg-[#16B853] pixel-blink" aria-hidden="true" />
            </span>
          </a>

          {/* Center Desktop Navigation with Framer Motion Spring Highlight */}
          <nav aria-label="ناوبری بخش‌ها" className="hidden md:flex items-center gap-1 bg-[#EEF0F3] border-2 border-[#080A0D] rounded-[7px] p-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveId(item.id)}
                  className={`relative px-3.5 py-1 rounded-[5px] font-extrabold text-xs lg:text-sm transition-colors ${
                    isActive ? 'text-white' : 'text-[#080A0D] hover:text-[#E5252A]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-[#080A0D] rounded-[5px] border border-[#080A0D]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              )
            })}
          </nav>

          {/* RTL Left: CTA Pressable Button */}
          <BrutalButton href="#members" variant="red" size="sm">
            <Users size={15} strokeWidth={2.8} />
            <span>اعضای تیم</span>
          </BrutalButton>
        </div>

        {/* RTL Multi-Accent Scroll Progress Rail */}
        {!shouldReduceMotion && (
          <div className="h-[4px] w-full bg-[#EEF0F3] border-t-2 border-[#080A0D]" aria-hidden="true">
            <motion.div
              style={{
                scaleX: smoothProgress,
                transformOrigin: '100% 50%',
                backgroundImage:
                  'linear-gradient(to left, #E5252A 0%, #E5252A 50%, #16B853 80%, #00D4C8 100%)',
              }}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </header>
  )
}
