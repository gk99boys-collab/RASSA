import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Play,
  Send,
} from 'lucide-react'
import type { RawLinks } from '../types'
import { normalizeLinks } from '../lib/supabase'
import { EventCursorLogo, RasaTeamLogo } from './BrandAssets'
import { BrutalButton } from './BrutalUI'

interface FooterSectionProps {
  teamName: string
  tagline: string
  links: RawLinks
  onReplayIntro?: () => void
}

function getFooterLinkIcon(type: string) {
  switch (type) {
    case 'github':
    case 'gitlab':
      return <Github size={16} strokeWidth={2.7} />
    case 'linkedin':
      return <Linkedin size={16} strokeWidth={2.7} />
    case 'telegram':
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return <Send size={16} strokeWidth={2.7} />
    case 'email':
      return <Mail size={16} strokeWidth={2.7} />
    case 'phone':
      return <Phone size={16} strokeWidth={2.7} />
    case 'website':
      return <Globe size={16} strokeWidth={2.7} />
    default:
      return <ExternalLink size={16} strokeWidth={2.7} />
  }
}

/**
 * Section 6 — Grand Official Poster Footer:
 * Showcases both official RASSA and 8th Event logos, dynamic Supabase team links,
 * quick controls, and the required official registration banner.
 */
export const FooterSection: React.FC<FooterSectionProps> = ({
  teamName,
  tagline,
  links,
  onReplayIntro,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const teamLinks = normalizeLinks(links)

  return (
    <footer
      id="footer"
      className="relative z-10 mt-8 bg-obsidian-grid text-white border-t-[4px] border-[#080A0D] overflow-hidden"
    >
      {/* Top Checkerboard + Strong Red Divider */}
      <div className="h-3.5 pixel-checker-strip border-b-[3px] border-[#080A0D]" aria-hidden="true" />
      <div className="h-2.5 bg-[#E5252A] border-b-[3px] border-[#080A0D]" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Top Row: Official RASSA Identity + Links & Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Official RASSA Logo & Motto */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-4">
              <div className="bg-[#06090D] border-[3px] border-white shadow-[-5px_5px_0_#00A8A8] rounded-[10px] px-4 py-3">
                <RasaTeamLogo className="w-32 sm:w-36" alt={`لوگوی تیم ${teamName}`} glow />
              </div>
              <div>
                <div className="font-black text-3xl sm:text-4xl text-white leading-none">
                  تیم {teamName}
                </div>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-[#E5252A] text-white text-xs font-black px-2.5 py-1 rounded-[5px]">
                  <span>نرم‌افزارهای ویژه تلفن همراه</span>
                </div>
              </div>
            </div>

            <p className="text-base sm:text-lg font-extrabold text-white/85 leading-8 max-w-lg">
              {tagline}
            </p>
          </div>

          {/* Dynamic Team Links from Supabase + Quick Controls */}
          <div className="lg:col-span-6 space-y-5 lg:text-right">
            {teamLinks.length > 0 && (
              <div>
                <div className="text-xs font-black text-[#00D4C8] mb-2.5">
                  لینک‌ها و راه‌های ارتباطی تیم
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {teamLinks.map((link, idx) => (
                    <BrutalButton
                      key={`team-link-${idx}`}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      variant={idx === 0 ? 'red' : 'white'}
                      size="sm"
                    >
                      {getFooterLinkIcon(link.type)}
                      <span>{link.label}</span>
                    </BrutalButton>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-black text-white/70 mb-2.5">
                بخش‌های سایت
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <BrutalButton href="#achievement" variant="white" size="sm">
                  <span>افتخارات</span>
                </BrutalButton>
                <BrutalButton href="#about" variant="white" size="sm">
                  <span>درباره تیم</span>
                </BrutalButton>
                <BrutalButton href="#members" variant="white" size="sm">
                  <span>اعضای تیم</span>
                </BrutalButton>
                {onReplayIntro && (
                  <BrutalButton onClick={onReplayIntro} variant="neon" size="sm">
                    <Play size={14} strokeWidth={3} className="text-[#16B853]" />
                    <span>پخش مجدد اینترو</span>
                  </BrutalButton>
                )}
                <BrutalButton
                  href="#hero"
                  variant="red"
                  size="sm"
                  ariaLabel="بازگشت به بالای صفحه"
                >
                  <ArrowUp size={15} strokeWidth={3} />
                  <span>بالا</span>
                </BrutalButton>
              </div>
            </div>
          </div>
        </div>

        {/* Official Registration Certificate Banner with the Real 8th Event Cursor Logo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white text-[#080A0D] border-[3.5px] border-white shadow-[-7px_7px_0_#E5252A] rounded-[11px] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 text-center sm:text-right">
            <span
              className="brutal-icon-box w-12 h-12 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <CheckCircle2 size={24} strokeWidth={2.8} />
            </span>
            <div>
              <p className="font-black text-base sm:text-lg md:text-xl text-[#080A0D] leading-7">
                ثبت‌نام‌شده در هشتمین رویداد ملی تولید محتوای دیجیتال بسیج
              </p>
              <p className="text-xs font-extrabold text-[#080A0D]/70 mt-0.5">
                رشته نرم‌افزارهای ویژه تلفن همراه • تیم نرم‌افزاری {teamName} (RASSA)
              </p>
            </div>
          </div>

          {/* Official 8th Event Logo Badge */}
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }
            className="inline-flex items-center gap-2.5 bg-[#080A0D] text-white border-[3px] border-[#080A0D] rounded-[8px] px-3.5 py-2 shrink-0"
          >
            <EventCursorLogo
              className="w-6 h-8"
              alt="لوگوی هشتمین رویداد ملی تولید محتوای دیجیتال بسیج"
              tilted
            />
            <div className="text-right leading-tight">
              <div className="text-[11px] font-black text-[#22C55E]">رویداد ملی هشتم</div>
              <div className="text-[10px] font-bold text-white/75">تیم {teamName}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}
