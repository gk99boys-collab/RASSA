import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Crown,
  Database,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Lock,
  Mail,
  Mic,
  Phone,
  Send,
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
import { PixelMemberAvatar, PixelMysteryMark } from './PixelArt'
import { BrutalButton, BrutalSkeleton, CheckChip, SectionPill } from './BrutalUI'

interface MembersSectionProps {
  members: Member[]
  loading: boolean
}

function getLinkIcon(type: string) {
  switch (type) {
    case 'github':
    case 'gitlab':
      return <Github size={15} strokeWidth={2.6} />
    case 'linkedin':
      return <Linkedin size={15} strokeWidth={2.6} />
    case 'telegram':
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return <Send size={15} strokeWidth={2.6} />
    case 'email':
      return <Mail size={15} strokeWidth={2.6} />
    case 'phone':
      return <Phone size={15} strokeWidth={2.6} />
    case 'website':
    case 'portfolio':
      return <Globe size={15} strokeWidth={2.6} />
    default:
      return <ExternalLink size={15} strokeWidth={2.6} />
  }
}

function getRoleIcon(sortOrder: number, role: string) {
  if (role.includes('سرپرست') || role.includes('مدیر') || sortOrder === 1) {
    return <Crown size={22} strokeWidth={2.6} />
  }
  if (role.includes('موبایل') || sortOrder === 2) {
    return <Smartphone size={22} strokeWidth={2.6} />
  }
  if (role.includes('بک') || role.includes('دیتابیس') || sortOrder === 3) {
    return <Database size={22} strokeWidth={2.6} />
  }
  if (role.includes('ارائه') || role.includes('محتوا') || sortOrder === 4) {
    return <Mic size={22} strokeWidth={2.6} />
  }
  return <UserCheck size={22} strokeWidth={2.6} />
}

const MemberCard: React.FC<{ member: Member; index: number }> = ({ member, index }) => {
  const [imgFailed, setImgFailed] = useState(false)
  const resolvedPhoto = resolveMemberPhotoUrl(member.photo_url)
  const showPhoto = Boolean(resolvedPhoto) && !imgFailed
  const links: NormalizedLink[] = normalizeLinks(member.links)
  const badgeNumber = formatOrderBadge(member.sort_order || index + 1)

  return (
    <article
      id={`member-${member.sort_order || index + 1}`}
      className="brutal-card-lg overflow-hidden scroll-mt-24"
    >
      {/* Dossier Header Strip */}
      <div className="bg-[#0A0A0A] text-white border-b-[3px] border-[#0A0A0A] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E5252A] text-white font-black text-xs px-2.5 py-0.5 rounded-[4px] border border-white/20">
            عضو {badgeNumber}
          </span>
          <span className="text-xs font-extrabold text-white/85 hidden sm:inline">
            تیم نرم‌افزاری رَسا
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#22C55E]">
          <span className="w-2 h-2 bg-[#22C55E]" aria-hidden="true" />
          <span>فعال</span>
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-stretch gap-5 sm:gap-7">
        {/* Member Photo / Pixel Avatar Frame (RTL Right Column) */}
        <div className="w-full sm:w-48 md:w-52 h-52 sm:h-auto sm:min-h-[220px] shrink-0 border-[3px] border-[#0A0A0A] shadow-[-5px_5px_0_#0A0A0A] rounded-[8px] overflow-hidden bg-[#F1F2F4] relative">
          {showPhoto ? (
            <img
              src={resolvedPhoto!}
              alt={member.name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <PixelMemberAvatar sortOrder={member.sort_order || index + 1} name={member.name} />
          )}

          {/* Corner index tag */}
          <span className="absolute bottom-2 right-2 bg-[#0A0A0A] text-white text-[11px] font-black px-2 py-0.5 rounded-[4px] border border-white/20">
            #{toPersianDigits(member.sort_order || index + 1)}
          </span>
        </div>

        {/* Member Details (RTL Left Column) */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
          <div>
            {/* Name & Role with Signature Red Icon Box on the Right */}
            <div className="flex items-start gap-3.5 mb-3.5">
              <div
                className="brutal-icon-box w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {getRoleIcon(member.sort_order, member.role)}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-2xl sm:text-3xl text-[#0A0A0A] leading-tight">
                  {member.name}
                </h3>
                <span className="inline-block mt-1.5 bg-[#E5252A] text-white border-2 border-[#0A0A0A] rounded-[5px] px-2.5 py-0.5 text-xs sm:text-sm font-extrabold">
                  {member.role}
                </span>
              </div>
            </div>

            {/* Bio */}
            {member.bio ? (
              <p className="text-sm sm:text-base font-medium text-[#0A0A0A]/85 leading-8 mb-4">
                {member.bio}
              </p>
            ) : null}
          </div>

          <div className="space-y-3.5">
            {/* Skills as Neo-Brutalist Check Chips */}
            {member.skills.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2" aria-label="مهارت‌ها">
                {member.skills.map((skill, sIdx) => (
                  <CheckChip
                    key={`${member.id}-skill-${sIdx}`}
                    label={skill}
                    accent={sIdx === 0 ? 'red' : 'green'}
                    size="sm"
                  />
                ))}
              </div>
            ) : null}

            {/* Member Links (rendered automatically when populated in Supabase) */}
            {links.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t-2 border-dashed border-[#0A0A0A]/20">
                {links.map((link, lIdx) => (
                  <BrutalButton
                    key={`${member.id}-link-${lIdx}`}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    variant="white"
                    size="sm"
                  >
                    {getLinkIcon(link.type)}
                    <span>{link.label}</span>
                  </BrutalButton>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Locked "Mystery Card" for Member #5 ("به‌زودی...").
 * Features pixel question mark, glitch/flicker animation, and interactive lock feedback.
 * Replaces automatically with a normal MemberCard once updated in Supabase!
 */
const MysteryMemberCard: React.FC<{ member: Member; index: number }> = ({
  member,
  index,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [lockedPing, setLockedPing] = useState(false)
  const badgeNumber = formatOrderBadge(member.sort_order || index + 1)

  const handleKnock = () => {
    setLockedPing(true)
    window.setTimeout(() => setLockedPing(false), 1800)
  }

  return (
    <motion.article
      id={`member-${member.sort_order || index + 1}`}
      animate={
        lockedPing && !shouldReduceMotion
          ? { x: [0, -6, 6, -4, 4, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.35 }}
      className="brutal-card-dark overflow-hidden scroll-mt-24 relative"
    >
      {/* Diagonal red/black neo-brutalist hazard stripe */}
      <div className="h-3 brutal-hazard border-b-[3px] border-[#0A0A0A]" aria-hidden="true" />

      {/* Top Locked Dossier Bar */}
      <div className="bg-[#141414] text-white border-b-2 border-white/15 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E5252A] text-white font-black text-xs px-2.5 py-0.5 rounded-[4px]">
            عضو {badgeNumber}
          </span>
          <span className="text-xs font-extrabold text-white/75">پرونده‌ی محرمانه</span>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-black border border-[#22C55E] text-[#22C55E] text-[11px] font-black px-2.5 py-0.5 rounded-[4px]">
          <Lock size={12} strokeWidth={2.8} />
          <span>قفل‌شده</span>
        </span>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-7 md:p-8 flex flex-col sm:flex-row items-stretch gap-5 sm:gap-7 pixel-scanlines">
        {/* Pixel Question Mark Locked Frame */}
        <div className="w-full sm:w-48 md:w-52 h-52 sm:h-auto sm:min-h-[220px] shrink-0 border-[3px] border-white shadow-[-5px_5px_0_#E5252A] rounded-[8px] overflow-hidden relative">
          <PixelMysteryMark />
        </div>

        {/* Mystery Copy */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-start gap-3.5 mb-3.5">
              {/* Signature Red Icon Box on the Right */}
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 bg-[#E5252A] text-white border-[3px] border-white shadow-[-3px_3px_0_#22C55E] rounded-[6px] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Lock size={22} strokeWidth={2.75} />
              </div>

              <div>
                <h3 className="font-black text-2xl sm:text-4xl text-white leading-tight mystery-flicker">
                  {member.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 mt-1.5 bg-white text-[#0A0A0A] rounded-[5px] px-2.5 py-0.5 text-xs sm:text-sm font-black">
                  <span className="w-2 h-2 bg-[#E5252A]" aria-hidden="true" />
                  <span>{member.role}</span>
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-bold text-white/85 leading-8 mb-4">
              {member.bio}
            </p>

            {/* Redacted Pixel Skill Chips */}
            <div className="flex flex-wrap items-center gap-2" aria-label="مهارت‌های قفل‌شده">
              {['مهارت محرمانه', 'به‌زودی رونمایی می‌شود', '؟؟؟'].map((tag, idx) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-[#1B1B1B] text-white/80 border-2 border-dashed border-white/35 rounded-[5px] px-2.5 py-1 text-xs font-extrabold"
                >
                  <span
                    className={`w-2 h-2 ${idx === 1 ? 'bg-[#22C55E]' : 'bg-[#E5252A]'}`}
                    aria-hidden="true"
                  />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Unlock-Attempt Button */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleKnock}
              className="brutal-press-red bg-[#161616] hover:bg-[#222222] text-white font-extrabold text-xs sm:text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              <Lock size={15} strokeWidth={2.75} className="text-[#22C55E]" />
              <span>رمزگشایی پرونده‌ی عضو پنجم</span>
            </button>

            {lockedPing && (
              <span
                role="status"
                className="inline-flex items-center gap-1.5 bg-[#22C55E] text-[#0A0A0A] font-black text-xs px-3 py-1.5 rounded-[5px]"
              >
                <span>دسترسی قفل است — منتظر معرفی باشید!</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

const MemberCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div className="brutal-card-lg overflow-hidden">
    <div className="bg-[#0A0A0A] h-10 px-5 flex items-center justify-between">
      <span className="bg-[#E5252A] text-white font-black text-xs px-2.5 py-0.5 rounded-[4px]">
        عضو {formatOrderBadge(index + 1)}
      </span>
      <span className="w-2.5 h-2.5 bg-[#22C55E]" />
    </div>
    <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-6">
      <BrutalSkeleton
        className="w-full sm:w-48 h-48 sm:h-52 shrink-0"
        label="در حال بارگذاری تصویر عضو..."
      />
      <div className="flex-1 space-y-3.5">
        <BrutalSkeleton className="h-9 w-52" label="در حال بارگذاری نام عضو..." />
        <BrutalSkeleton className="h-6 w-40" />
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
 * Section 5 — Members:
 * 5 Neo-Brutalist cards revealed one by one on scroll with tactile sticky card stacking.
 */
export const MembersSection: React.FC<MembersSectionProps> = ({ members, loading }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="members"
      className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 scroll-mt-20"
      aria-labelledby="members-heading"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header + Quick Member Jump Pills */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionPill index={3} title="اعضای تیم رَسا" />
            <h2
              id="members-heading"
              className="font-black text-2xl sm:text-4xl text-[#0A0A0A] mt-4 leading-snug"
            >
              ترکیب {toPersianDigits(members.length || 5)} نفره‌ی تیم ما
            </h2>
          </motion.div>

          {/* Quick Jump Index Pills */}
          {!loading && members.length > 0 && (
            <nav aria-label="پرش سریع به کارت اعضا" className="flex flex-wrap items-center gap-2">
              {members.map((member, idx) => {
                const mystery = isMysteryMember(member)
                const num = member.sort_order || idx + 1
                return (
                  <a
                    key={member.id}
                    href={`#member-${num}`}
                    title={member.name}
                    className={`brutal-press-sm w-10 h-10 inline-flex items-center justify-center font-black text-sm ${
                      mystery
                        ? 'bg-[#0A0A0A] text-[#22C55E]'
                        : 'bg-white hover:bg-[#E5252A] hover:text-white text-[#0A0A0A]'
                    }`}
                  >
                    {mystery ? '؟' : formatOrderBadge(num)}
                  </a>
                )
              })}
            </nav>
          )}
        </div>

        {/* Scroll-Revealed Stacking Member Cards */}
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, idx) => (
              <MemberCardSkeleton key={idx} index={idx} />
            ))}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 pb-4">
            {members.map((member, index) => {
              const mystery = isMysteryMember(member)
              // Progressive desktop sticky offset creates a crisp physical dossier stack on scroll
              const stickyTop = 82 + index * 18

              return (
                <motion.div
                  key={member.id}
                  initial={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 44, scale: 0.97 }
                  }
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{
                    duration: 0.46,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    top: `${stickyTop}px`,
                    zIndex: index + 1,
                  }}
                  className="md:sticky"
                >
                  {mystery ? (
                    <MysteryMemberCard member={member} index={index} />
                  ) : (
                    <MemberCard member={member} index={index} />
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
