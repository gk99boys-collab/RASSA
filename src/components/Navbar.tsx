import React from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Users } from 'lucide-react'
import { PixelCursorLogo } from './PixelArt'
import { BrutalButton } from './BrutalUI'

interface NavbarProps {
  teamName: string
}

const NAV_ITEMS = [
  { label: 'افتخارات', href: '#achievement' },
  { label: 'درباره تیم', href: '#about' },
  { label: 'اعضای تیم', href: '#members' },
]

export const Navbar: React.FC<NavbarProps> = ({ teamName }) => {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  })

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-[2px] border-b-[3px] border-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        {/* Brand (RTL Right): Pixel Cursor Logo + Team Name + Event Badge */}
        <a
          href="#hero"
          className="inline-flex items-center gap-2.5 group"
          aria-label={`صفحه اصلی تیم ${teamName}`}
        >
          <span className="transition-transform duration-150 group-hover:-rotate-6">
            <PixelCursorLogo size={36} />
          </span>
          <span className="font-black text-2xl sm:text-[1.7rem] tracking-tight text-[#0A0A0A] leading-none">
            {teamName}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white text-xs font-extrabold px-2.5 py-1 rounded-[5px] border-2 border-[#0A0A0A]">
            <span className="w-2 h-2 bg-[#22C55E] inline-block" aria-hidden="true" />
            <span>رویداد هشتم</span>
          </span>
        </a>

        {/* Desktop Section Links */}
        <nav aria-label="ناوبری اصلی" className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 rounded-[6px] font-extrabold text-sm text-[#0A0A0A] hover:bg-[#F1F2F4] border-2 border-transparent hover:border-[#0A0A0A] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA Button (RTL Left) */}
        <BrutalButton href="#members" variant="red" size="sm">
          <Users size={16} strokeWidth={2.75} />
          <span>اعضای تیم</span>
        </BrutalButton>
      </div>

      {/* RTL Scroll Progress Bar */}
      {!shouldReduceMotion && (
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: '100% 50%' }}
          aria-hidden="true"
          className="h-[4px] bg-[#E5252A] w-full"
        />
      )}
    </header>
  )
}
