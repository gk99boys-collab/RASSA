import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Database,
  ExternalLink,
  GalleryHorizontalEnd,
  Github,
  Globe,
  Layers,
  Linkedin,
  Lock,
  Mail,
  Mic,
  Phone,
  Send,
  ShieldAlert,
  Smartphone,
  UserCheck,
} from 'lucide-react'
import type { Member, NormalizedLink } from '../types'
import {
  formatOrderBadge,
  isMysteryMember,
  normalizeLinks,
  resolveMemberPhotoUrl,
  toPersianDigits,
} from '../lib/supabase'
import {
  EventCursorLogo,
  PixelBarcode,
  PixelClassifiedMystery,
  PixelWorkstationPoster,
  RasaWaveMark,
} from './BrandAssets'
import { BrutalButton, BrutalSkeleton, CheckChip, SectionPill } from './BrutalUI'

interface MembersSectionProps {
  members: Member[]
  loading: boolean
}

type ViewMode = 'stack' | 'deck'

function getLinkIcon(type: string) {
  switch (type) {
    case 'github':
    case 'gitlab':
      return <Github size={15} strokeWidth={2.7} />
    case 'linkedin':
      return <Linkedin size={15} strokeWidth={2.7} />
    case 'telegram':
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return <Send size={15} strokeWidth={2.7} />
    case 'email':
      return <Mail size={15} strokeWidth={2.7} />
    case 'phone':
      return <Phone size={15} strokeWidth={2.7} />
    case 'website':
    case 'portfolio':
      return <Globe size={15} strokeWidth={2.7} />
    default:
      return <ExternalLink size={15} strokeWidth={2.7} />
  }
}

function getRoleIcon(sortOrder: number, role: string) {
  if (role.includes('سرپرست') || role.includes('مدیر') || sortOrder === 1) {
    return <Crown size={23} strokeWidth={2.7} />
  }
  if (role.includes('موبایل') || sortOrder === 2) {
    return <Smartphone size={23} strokeWidth={2.7} />
  }
  if (role.includes('بک') || role.includes('دیتابیس') || sortOrder === 3) {
    return <Database size={23} strokeWidth={2.7} />
  }
  if (role.includes('ارائه') || role.includes('محتوا') || sortOrder === 4) {
    return <Mic size={23} strokeWidth={2.7} />
  }
  return <UserCheck size={23} strokeWidth={2.7} />
}

const UnlockedMemberCard: React.FC<{ member: Member; index: number }> = ({
  member,
  index,
}) => {
  const [imgError, setImgError] = useState(false)
  const resolvedPhoto = resolveMemberPhotoUrl(member.photo_url)
  const hasPhoto = Boolean(resolvedPhoto) && !imgError
  const links: NormalizedLink[] = normalizeLinks(member.links)
  const num = member.sort_order || index + 1
  const badgeNumber = formatOrderBadge(num)

  return (
    <article
      id={`member-${num}`}
      className="poster-card-xl overflow-hidden scroll-mt-28 group relative bg-white"
    >
      {/* Collectible Event ID Pass Top Bar */}
      <div className="bg-[#080A0D] text-white border-b-[3.5px] border-[#080A0D] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E5252A] text-white font-black text-xs sm:text-sm px-3 py-0.5 rounded-[5px] border border-white/25">
            عضو {badgeNumber}
          </span>
          <RasaWaveMark className="w-6 h-3.5 hidden sm:block" />
          <span className="hidden sm:inline text-xs font-extrabold text-white/80">
            کارت رسمی عضو تیم رَسا
          </span>
        </div>

        {/* Simulated lanyard slot on center desktop */}
        <span
          aria-hidden="true"
          className="hidden lg:block w-14 h-2.5 bg-[#EEF0F3] rounded-full border-2 border-black"
        />

        <div className="flex items-center gap-3">
          <PixelBarcode className="h-3.5 text-white/65 hidden md:block" />
          <span className="inline-flex items-center gap-1.5 bg-[#16B853]/20 border border-[#16B853] text-[#22C55E] text-[11px] font-black px-2.5 py-0.5 rounded-[4px]">
            <span className="w-2 h-2 bg-[#22C55E]" aria-hidden="true" />
            <span>فعال</span>
          </span>
        </div>
      </div>

      {/* Card Main Body */}
      <div className="p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-stretch gap-6 sm:gap-7 relative">
        {/* Giant subtle index number watermark */}
        <span
          aria-hidden="true"
          className="hidden md:block absolute bottom-2 left-5 font-black text-7xl text-[#080A0D]/[0.05] leading-none select-none pointer-events-none"
        >
          {badgeNumber}
        </span>

        {/* Portrait / Bespoke Pixel Workstation Frame (RTL Right) */}
        <div className="w-full sm:w-52 md:w-56 h-56 sm:h-auto sm:min-h-[240px] shrink-0 border-[3.5px] border-[#080A0D] shadow-[-6px_6px_0_#080A0D] rounded-[10px] overflow-hidden bg-[#090D12] relative">
          {hasPhoto ? (
            <img
              src={resolvedPhoto!}
              alt={member.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <PixelWorkstationPoster sortOrder={num} name={member.name} />
          )}

          {/* Bottom ID Stamp */}
          <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between pointer-events-none">
            <span className="bg-[#E5252A] text-white border-2 border-[#080A0D] text-[11px] font-black px-2 py-0.5 rounded-[4px]">
              #{toPersianDigits(num)}
            </span>
            <span
              dir="ltr"
              className="bg-[#080A0D]/90 text-[#00D4C8] border border-white/25 text-[10px] font-black px-2 py-0.5 rounded-[4px]"
            >
              RASSA-0{num}
            </span>
          </div>
        </div>

        {/* Member Details (RTL Left) */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 relative z-10">
          <div>
            {/* Name & Role Header with Signature Red Icon Box on the Right */}
            <div className="flex items-start gap-3.5 sm:gap-4 mb-4">
              <div
                className="brutal-icon-box w-12 h-12 sm:w-13 sm:h-13 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {getRoleIcon(num, member.role)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-2xl sm:text-3xl md:text-[2rem] text-[#080A0D] leading-tight">
                  {member.name}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-[#E5252A] text-white border-[2.5px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D] rounded-[5px] px-3 py-0.5 text-xs sm:text-sm font-black">
                    <span>{member.role}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {member.bio && (
              <p className="text-sm sm:text-base font-bold text-[#080A0D]/85 leading-[1.95] mb-4">
                {member.bio}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Skills as Check Chips */}
            {member.skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" aria-label="مهارت‌ها">
                {member.skills.map((skill, sIdx) => (
                  <CheckChip
                    key={`${member.id}-skill-${sIdx}`}
                    label={skill}
                    accent={sIdx === 0 ? 'red' : sIdx % 2 === 1 ? 'green' : 'teal'}
                    size="sm"
                  />
                ))}
              </div>
            )}

            {/* Dynamic Member Links from Supabase */}
            {links.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t-2 border-dashed border-[#080A0D]/20">
                {links.map((link, lIdx) => (
                  <BrutalButton
                    key={`${member.id}-link-${lIdx}`}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    variant={lIdx === 0 ? 'red' : 'white'}
                    size="sm"
                  >
                    {getLinkIcon(link.type)}
                    <span>{link.label}</span>
                  </BrutalButton>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Super-Animated Locked "Mystery Card" for Member #5 ("به‌زودی...").
 * Features animated hazard tape, radar-scanned chromatic pixel ?, flicker text,
 * and an interactive 0% -> 99% decryption attempt sequence!
 * Automatically turns into a normal UnlockedMemberCard when updated in Supabase.
 */
const LockedMysteryCard: React.FC<{ member: Member; index: number }> = ({
  member,
  index,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [decryptState, setDecryptState] = useState<'idle' | 'scanning' | 'denied'>('idle')
  const [scanPct, setScanPct] = useState(0)
  const timersRef = useRef<number[]>([])
  const num = member.sort_order || index + 1
  const badgeNumber = formatOrderBadge(num)

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  const handleDecryptAttempt = () => {
    if (decryptState === 'scanning') return
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []

    if (shouldReduceMotion) {
      setDecryptState('denied')
      timersRef.current.push(window.setTimeout(() => setDecryptState('idle'), 2400))
      return
    }

    setDecryptState('scanning')
    setScanPct(0)

    const steps = [18, 41, 67, 88, 99]
    steps.forEach((pct, i) => {
      timersRef.current.push(
        window.setTimeout(() => setScanPct(pct), (i + 1) * 110)
      )
    })

    timersRef.current.push(
      window.setTimeout(() => {
        setDecryptState('denied')
        timersRef.current.push(
          window.setTimeout(() => {
            setDecryptState('idle')
            setScanPct(0)
          }, 2600)
        )
      }, 660)
    )
  }

  return (
    <motion.article
      id={`member-${num}`}
      animate={
        decryptState === 'denied' && !shouldReduceMotion
          ? { x: [0, -8, 8, -6, 6, -3, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.36 }}
      className="poster-card-obsidian overflow-hidden scroll-mt-28 relative"
    >
      {/* Animated Diagonal Red/Black Hazard Tape */}
      <div
        className="h-3.5 brutal-hazard-animated border-b-[3px] border-[#080A0D]"
        aria-hidden="true"
      />

      {/* Classified Dossier Header */}
      <div className="bg-[#11161E] text-white border-b-2 border-white/15 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E5252A] text-white font-black text-xs sm:text-sm px-3 py-0.5 rounded-[5px]">
            عضو {badgeNumber}
          </span>
          <span className="text-xs font-extrabold text-white/75">
            پرونده‌ی محرمانه // CLASSIFIED
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 bg-black border-2 border-[#16B853] text-[#22C55E] text-[11px] font-black px-2.5 py-0.5 rounded-[5px]">
          <Lock size={12} strokeWidth={3} />
          <span>قفل‌شده</span>
        </span>
      </div>

      {/* Main Mystery Body */}
      <div className="p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-stretch gap-6 sm:gap-7 pixel-scanlines relative">
        {/* Chromatic Radar-Scanned Pixel Question Mark */}
        <div className="w-full sm:w-52 md:w-56 h-56 sm:h-auto sm:min-h-[240px] shrink-0 border-[3px] border-white shadow-[-6px_6px_0_#E5252A] rounded-[10px] overflow-hidden relative">
          <PixelClassifiedMystery />
        </div>

        {/* Mystery Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-start gap-3.5 sm:gap-4 mb-4">
              {/* Signature Red Icon Box on the Right */}
              <div
                className="w-12 h-12 sm:w-13 sm:h-13 bg-[#E5252A] text-white border-[3px] border-white shadow-[-4px_4px_0_#16B853] rounded-[7px] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Lock size={23} strokeWidth={2.8} />
              </div>

              <div>
                <h3 className="font-black text-3xl sm:text-4xl text-white leading-tight mystery-flicker">
                  {member.name}
                </h3>
                <span className="inline-flex items-center gap-2 mt-2 bg-white text-[#080A0D] rounded-[5px] px-3 py-0.5 text-xs sm:text-sm font-black shadow-[-3px_3px_0_#00D4C8]">
                  <span className="w-2 h-2 bg-[#E5252A]" aria-hidden="true" />
                  <span>{member.role}</span>
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-bold text-white/90 leading-8 mb-5">
              {member.bio}
            </p>

            {/* Encrypted Redacted Skill Chips */}
            <div className="flex flex-wrap items-center gap-2" aria-label="مهارت‌های محرمانه">
              {[
                { label: 'تخصص محرمانه', dot: '#E5252A' },
                { label: 'در انتظار رونمایی', dot: '#16B853' },
                { label: 'SLOT 05 // LOCKED', dot: '#00D4C8' },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 bg-white/5 text-white/85 border-2 border-dashed border-white/30 rounded-[6px] px-3 py-1 text-xs font-extrabold"
                >
                  <span
                    className="w-2 h-2 shrink-0"
                    style={{ backgroundColor: chip.dot }}
                    aria-hidden="true"
                  />
                  <span>{chip.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Decryption Mini-Game Control */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <BrutalButton onClick={handleDecryptAttempt} variant="neon" size="sm">
                {decryptState === 'denied' ? (
                  <ShieldAlert size={16} strokeWidth={2.8} className="text-[#F0E808]" />
                ) : (
                  <Lock size={15} strokeWidth={2.8} className="text-[#16B853]" />
                )}
                <span>
                  {decryptState === 'scanning'
                    ? `در حال رمزگشایی... ${toPersianDigits(scanPct)}٪`
                    : 'تلاش برای رمزگشایی پرونده'}
                </span>
              </BrutalButton>

              {decryptState === 'denied' && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 bg-[#E5252A] text-white border-2 border-white font-black text-xs px-3 py-1.5 rounded-[6px]"
                >
                  <span>قفل امنیتی فعال — به‌زودی معرفی می‌شود!</span>
                </span>
              )}
            </div>

            {decryptState === 'scanning' && (
              <div className="h-2.5 w-full max-w-xs bg-white/10 border border-white/30 rounded-[3px] overflow-hidden">
                <div
                  className="h-full bg-[#16B853] transition-[width] duration-100"
                  style={{ width: `${scanPct}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

const MemberCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div className="poster-card-xl overflow-hidden bg-white">
    <div className="bg-[#080A0D] h-11 px-5 flex items-center justify-between">
      <span className="bg-[#E5252A] text-white font-black text-xs px-3 py-0.5 rounded-[4px]">
        عضو {formatOrderBadge(index + 1)}
      </span>
      <span className="w-2.5 h-2.5 bg-[#16B853]" />
    </div>
    <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-6">
      <BrutalSkeleton
        className="w-full sm:w-52 h-52 shrink-0"
        label="در حال بارگذاری تصویر عضو..."
      />
      <div className="flex-1 space-y-3.5">
        <BrutalSkeleton className="h-9 w-56" label="در حال بارگذاری نام عضو..." />
        <BrutalSkeleton className="h-6 w-44" />
        <BrutalSkeleton className="h-6 w-full" />
        <BrutalSkeleton className="h-6 w-4/5" />
        <div className="flex flex-wrap gap-2 pt-2">
          <BrutalSkeleton className="h-8 w-24" />
          <BrutalSkeleton className="h-8 w-28" />
          <BrutalSkeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  </div>
)

/**
 * Section 5 — Super-Graphical Members Dossier Deck:
 * Supports BOTH scroll-triggered sticky stacking cards AND an interactive arcade
 * character-select horizontal switcher, showcasing all 5 members + Mystery Card #5.
 */
export const MembersSection: React.FC<MembersSectionProps> = ({ members, loading }) => {
  const shouldReduceMotion = useReducedMotion()
  const [viewMode, setViewMode] = useState<ViewMode>('stack')
  const [activeIndex, setActiveIndex] = useState(0)

  const safeIndex = members.length > 0 ? Math.min(activeIndex, members.length - 1) : 0
  const activeMember = members[safeIndex]

  const stepCard = (dir: -1 | 1) => {
    if (members.length === 0) return
    setActiveIndex((prev) => (prev + dir + members.length) % members.length)
  }

  return (
    <section
      id="members"
      className="relative z-10 py-16 sm:py-24 px-3.5 sm:px-6 scroll-mt-20"
      aria-labelledby="members-heading"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Bar + View Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7 sm:mb-9">
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionPill
              index={3}
              title="اعضای تیم رَسا"
              subtitle="SQUAD ROSTER // 05"
            />
            <div className="flex items-center gap-3 mt-4">
              <h2
                id="members-heading"
                className="font-black text-3xl sm:text-4xl lg:text-5xl text-[#080A0D] leading-tight"
              >
                ترکیب {toPersianDigits(members.length || 5)} نفره‌ی رَسا
              </h2>
              <EventCursorLogo className="w-7 h-9 hidden sm:block" tilted />
            </div>
          </motion.div>

          {/* Stack vs Interactive Card Deck Switcher */}
          {!loading && members.length > 1 && (
            <div
              role="group"
              aria-label="تغییر حالت نمایش اعضا"
              className="inline-flex self-start md:self-auto bg-white border-[3px] border-[#080A0D] shadow-[-5px_5px_0_#080A0D] rounded-[8px] p-1 gap-1"
            >
              <button
                type="button"
                onClick={() => setViewMode('stack')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] text-xs sm:text-sm font-black transition-colors ${
                  viewMode === 'stack'
                    ? 'bg-[#E5252A] text-white'
                    : 'bg-transparent text-[#080A0D] hover:bg-[#EEF0F3]'
                }`}
              >
                <Layers size={15} strokeWidth={2.8} />
                <span>پشته‌ای (اسکرول)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('deck')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[5px] text-xs sm:text-sm font-black transition-colors ${
                  viewMode === 'deck'
                    ? 'bg-[#E5252A] text-white'
                    : 'bg-transparent text-[#080A0D] hover:bg-[#EEF0F3]'
                }`}
              >
                <GalleryHorizontalEnd size={15} strokeWidth={2.8} />
                <span>اسلایدر کارتی</span>
              </button>
            </div>
          )}
        </div>

        {/* Character Roster Selector Bar */}
        {!loading && members.length > 0 && (
          <div
            aria-label="انتخاب سریع اعضای تیم"
            className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-7"
          >
            {members.map((m, idx) => {
              const mystery = isMysteryMember(m)
              const num = m.sort_order || idx + 1
              const shortName = mystery ? 'به‌زودی...' : m.name.split(' ').slice(0, 2).join(' ')
              const selected = viewMode === 'deck' && safeIndex === idx

              if (viewMode === 'deck') {
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`brutal-press-sm shrink-0 inline-flex items-center gap-2 px-3.5 py-2 font-black text-xs sm:text-sm ${
                      selected
                        ? 'bg-[#E5252A] text-white'
                        : mystery
                          ? 'bg-[#080A0D] text-[#22C55E]'
                          : 'bg-white text-[#080A0D]'
                    }`}
                  >
                    <span className="opacity-80">{formatOrderBadge(num)}</span>
                    <span>{shortName}</span>
                  </button>
                )
              }

              return (
                <a
                  key={m.id}
                  href={`#member-${num}`}
                  className={`group/tab brutal-press-sm shrink-0 inline-flex items-center gap-2 px-3.5 py-2 font-black text-xs sm:text-sm ${
                    mystery
                      ? 'bg-[#080A0D] text-[#22C55E]'
                      : 'bg-white hover:bg-[#E5252A] hover:text-white text-[#080A0D]'
                  }`}
                >
                  <span
                    className={
                      mystery
                        ? 'text-[#F0E808]'
                        : 'text-[#E5252A] group-hover/tab:text-white transition-colors'
                    }
                  >
                    {mystery ? '؟' : formatOrderBadge(num)}
                  </span>
                  <span>{shortName}</span>
                </a>
              )
            })}
          </div>
        )}

        {/* Cards Rendering */}
        {loading ? (
          <div className="space-y-7">
            {Array.from({ length: 3 }, (_, idx) => (
              <MemberCardSkeleton key={idx} index={idx} />
            ))}
          </div>
        ) : viewMode === 'stack' ? (
          /* Mode 1: One-by-one Scroll-Triggered Sticky Stacking Dossiers */
          <div className="space-y-7 md:space-y-9 pb-4">
            {members.map((member, index) => {
              const mystery = isMysteryMember(member)
              const stickyTop = 88 + index * 18

              return (
                <motion.div
                  key={member.id}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 52, scale: 0.96 }
                  }
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.16 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    top: `${stickyTop}px`,
                    zIndex: index + 1,
                  }}
                  className="md:sticky"
                >
                  {mystery ? (
                    <LockedMysteryCard member={member} index={index} />
                  ) : (
                    <UnlockedMemberCard member={member} index={index} />
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* Mode 2: Interactive Arcade Character-Select Carousel */
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {activeMember && (
                <motion.div
                  key={activeMember.id}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, x: -36, scale: 0.98 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 36, scale: 0.98 }
                  }
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isMysteryMember(activeMember) ? (
                    <LockedMysteryCard member={activeMember} index={safeIndex} />
                  ) : (
                    <UnlockedMemberCard member={activeMember} index={safeIndex} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <BrutalButton onClick={() => stepCard(-1)} variant="white" size="md">
                <ChevronRight size={18} strokeWidth={3} />
                <span>عضو قبلی</span>
              </BrutalButton>

              <span className="font-black text-sm sm:text-base bg-white border-[3px] border-[#080A0D] shadow-[-3px_3px_0_#080A0D] rounded-[6px] px-3.5 py-1.5">
                {toPersianDigits(safeIndex + 1)} از {toPersianDigits(members.length)}
              </span>

              <BrutalButton onClick={() => stepCard(1)} variant="red" size="md">
                <span>عضو بعدی</span>
                <ChevronLeft size={18} strokeWidth={3} />
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
