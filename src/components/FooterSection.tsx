import React from 'react'
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
import { PixelCursorLogo } from './PixelArt'
import { BrutalButton } from './BrutalUI'

interface FooterSectionProps {
  teamName: string
  tagline: string
  links: RawLinks
  onReplayIntro?: () => void
}

function renderTeamLinkIcon(type: string) {
  switch (type) {
    case 'github':
    case 'gitlab':
      return <Github size={16} strokeWidth={2.6} />
    case 'linkedin':
      return <Linkedin size={16} strokeWidth={2.6} />
    case 'telegram':
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return <Send size={16} strokeWidth={2.6} />
    case 'email':
      return <Mail size={16} strokeWidth={2.6} />
    case 'phone':
      return <Phone size={16} strokeWidth={2.6} />
    case 'website':
      return <Globe size={16} strokeWidth={2.6} />
    default:
      return <ExternalLink size={16} strokeWidth={2.6} />
  }
}

/**
 * Section 6 — Footer:
 * Team branding, dynamic team links from Supabase + section links,
 * and the official 8th National Basij Digital Content Production Event badge.
 */
export const FooterSection: React.FC<FooterSectionProps> = ({
  teamName,
  tagline,
  links,
  onReplayIntro,
}) => {
  const teamLinks = normalizeLinks(links)

  return (
    <footer
      id="footer"
      className="relative z-10 mt-10 bg-white border-t-[3px] border-[#0A0A0A]"
    >
      {/* Strong Red Accent Top Rule */}
      <div className="h-2 bg-[#E5252A] border-b-[3px] border-[#0A0A0A]" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Top Row: Brand + Quick / Team Links */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          {/* Team Identity */}
          <div className="space-y-3 max-w-md">
            <div className="inline-flex items-center gap-3">
              <PixelCursorLogo size={44} />
              <div>
                <div className="font-black text-3xl text-[#0A0A0A] leading-none">
                  تیم {teamName}
                </div>
                <div className="text-xs font-extrabold text-[#E5252A] mt-1">
                  رشته نرم‌افزارهای ویژه تلفن همراه
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#0A0A0A]/80 leading-7">
              {tagline}
            </p>
          </div>

          {/* Team Links (from Supabase) + Quick Navigation */}
          <div className="space-y-4">
            {teamLinks.length > 0 && (
              <div>
                <div className="text-xs font-black text-[#0A0A0A]/70 mb-2.5">
                  راه‌های ارتباطی تیم
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
                      {renderTeamLinkIcon(link.type)}
                      <span>{link.label}</span>
                    </BrutalButton>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-black text-[#0A0A0A]/70 mb-2.5">
                دسترسی سریع
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
                  <BrutalButton onClick={onReplayIntro} variant="white" size="sm">
                    <Play size={14} strokeWidth={2.75} className="text-[#E5252A]" />
                    <span>پخش اینترو</span>
                  </BrutalButton>
                )}
                <BrutalButton
                  href="#hero"
                  variant="red"
                  size="sm"
                  ariaLabel="بازگشت به بالای صفحه"
                >
                  <ArrowUp size={15} strokeWidth={2.8} />
                  <span>بالا</span>
                </BrutalButton>
              </div>
            </div>
          </div>
        </div>

        {/* Official 8th National Basij Digital Content Production Event Stamp */}
        <div className="bg-[#0A0A0A] text-white border-[3px] border-[#0A0A0A] shadow-[-6px_6px_0_#E5252A] rounded-[8px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-right">
            <span
              className="w-10 h-10 bg-[#E5252A] border-2 border-white rounded-[6px] inline-flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <CheckCircle2 size={22} strokeWidth={2.75} />
            </span>
            <p className="font-black text-sm sm:text-base md:text-lg leading-7">
              ثبت‌نام‌شده در هشتمین رویداد ملی تولید محتوای دیجیتال بسیج
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#181818] border border-white/20 px-3 py-1.5 rounded-[5px] text-xs font-extrabold shrink-0">
            <span className="w-2.5 h-2.5 bg-[#22C55E]" aria-hidden="true" />
            <span>تیم نرم‌افزاری {teamName}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
