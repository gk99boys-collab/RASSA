import React, { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import type { Member, NormalizedLink } from '../../types'
import {
  formatOrderBadge,
  isMysteryMember,
  normalizeLinks,
  resolveMemberPhotoUrl,
  toPersianDigits,
} from '../../lib/supabase'
import { MinimalMemberAvatar } from '../BrandMarks'
import {
  LIQUID_SPRING,
  MinimalSkeleton,
  renderLinkIcon,
  SILK_EASE,
} from '../MotionPrimitives'

interface MembersSceneProps {
  members: Member[]
  loading: boolean
  activeIndex: number
  direction: 1 | -1
  onSelect: (index: number) => void
  onStep: (delta: 1 | -1) => void
}

function getShortLabel(member: Member, mystery: boolean): string {
  if (mystery) return 'به‌زودی...'
  const parts = member.name.trim().split(/\s+/)
  if (parts[0] === 'سید' && parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`
  }
  return parts[0] || member.name
}

const MemberPortrait: React.FC<{ member: Member; sortOrder: number }> = ({
  member,
  sortOrder,
}) => {
  const [failed, setFailed] = useState(false)
  const photo = resolveMemberPhotoUrl(member.photo_url)

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={member.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-center"
      />
    )
  }

  return <MinimalMemberAvatar name={member.name} sortOrder={sortOrder} />
}

export const MembersScene: React.FC<MembersSceneProps> = ({
  members,
  loading,
  activeIndex,
  direction,
  onSelect,
  onStep,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [pulseKey, setPulseKey] = useState(0)
  const dragStartX = useRef<number | null>(null)

  const total = members.length
  const safeIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0
  const current = members[safeIndex]

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return
    const dx = e.clientX - dragStartX.current
    dragStartX.current = null
    if (Math.abs(dx) < 42) return
    // RTL: swiping right advances to next member; swiping left returns to previous
    onStep(dx > 0 ? 1 : -1)
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center px-1">
        <MinimalSkeleton className="h-9 w-72 rounded-full mb-5" />
        <div className="glass-surface rounded-3xl p-6 sm:p-8 w-full flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <MinimalSkeleton
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0"
            label="در حال بارگذاری تصویر عضو..."
          />
          <div className="flex-1 w-full space-y-3">
            <MinimalSkeleton className="h-7 w-44" label="در حال بارگذاری نام عضو..." />
            <MinimalSkeleton className="h-5 w-36" />
            <MinimalSkeleton className="h-5 w-full" />
            <MinimalSkeleton className="h-5 w-4/5" />
            <div className="flex gap-2 pt-1">
              <MinimalSkeleton className="h-6 w-20 rounded-full" />
              <MinimalSkeleton className="h-6 w-24 rounded-full" />
              <MinimalSkeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const mystery = isMysteryMember(current)
  const sortOrder = current.sort_order || safeIndex + 1
  const links: NormalizedLink[] = normalizeLinks(current.links)
  const slideOffset = shouldReduceMotion ? 0 : direction * -16

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center px-1">
      {/* Liquid 5-Member Selector Bar */}
      <div
        role="tablist"
        aria-label="اعضای تیم رَسا"
        className="max-w-full overflow-x-auto no-scrollbar mb-5 sm:mb-6"
      >
        <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-[#0D1217]/[0.045] border border-[#0D1217]/[0.06]">
          {members.map((m, idx) => {
            const isActive = idx === safeIndex
            const isLocked = isMysteryMember(m)
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(idx)}
                className={`relative shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-white' : 'text-[#525B66] hover:text-[#0D1217]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-member-pill"
                    transition={LIQUID_SPRING}
                    className="absolute inset-0 rounded-full bg-[#0D1217] shadow-[0_4px_14px_rgba(13,18,23,0.2)]"
                  />
                )}
                {isLocked && (
                  <Lock
                    size={11}
                    strokeWidth={2.2}
                    className="relative z-10 opacity-80"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{getShortLabel(m, isLocked)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Smoothly Morphing Single Member Card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full"
      >
        <AnimatePresence mode="wait" custom={direction}>
          {mystery ? (
            /* Minimalist Velvet Locked Mystery Card (Member #5) */
            <motion.article
              key={current.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: slideOffset, scale: 0.985, filter: 'blur(5px)' }
              }
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -slideOffset, scale: 0.985, filter: 'blur(5px)' }
              }
              transition={{ duration: 0.34, ease: SILK_EASE }}
              onClick={() => !shouldReduceMotion && setPulseKey((k) => k + 1)}
              className="velvet-surface rounded-3xl p-6 sm:p-8 w-full text-white flex flex-col sm:flex-row items-center gap-6 sm:gap-7 cursor-pointer relative overflow-hidden will-change-transform"
            >
              {/* Soft Breathing Lock Emblem */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                {!shouldReduceMotion && pulseKey > 0 && (
                  <motion.span
                    key={pulseKey}
                    aria-hidden="true"
                    initial={{ scale: 0.6, opacity: 0.65 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 0.78, ease: SILK_EASE }}
                    className="absolute w-16 h-16 rounded-full border border-[#00BDB4]/60 pointer-events-none"
                  />
                )}
                <motion.div
                  animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1] }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="flex flex-col items-center gap-1.5"
                >
                  <Lock size={22} strokeWidth={1.8} className="text-[#00BDB4]" />
                  <span className="font-black text-xl text-white/80 leading-none">؟</span>
                </motion.div>
              </div>

              {/* Mystery Member Details */}
              <div className="flex-1 min-w-0 text-center sm:text-right">
                <div className="text-[11px] font-bold text-white/45 mb-1.5 tabular-nums">
                  {formatOrderBadge(sortOrder)} / {formatOrderBadge(total)}
                </div>
                <h2 className="font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {current.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#00BDB4]">
                  {current.role}
                </p>
                <p className="mt-3.5 text-sm font-normal text-white/70 leading-7">
                  {current.bio}
                </p>
              </div>
            </motion.article>
          ) : (
            /* Minimalist Frosted Glass Member Card (Members #1–#4, and #5 once unlocked) */
            <motion.article
              key={current.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: slideOffset, scale: 0.985, filter: 'blur(5px)' }
              }
              animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -slideOffset, scale: 0.985, filter: 'blur(5px)' }
              }
              transition={{ duration: 0.34, ease: SILK_EASE }}
              className="glass-surface rounded-3xl p-6 sm:p-8 w-full flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-7 will-change-transform"
            >
              {/* Avatar / Photo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-white shadow-[0_8px_24px_-12px_rgba(13,18,23,0.14)]">
                <MemberPortrait member={current} sortOrder={sortOrder} />
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0 text-center sm:text-right">
                <div className="text-[11px] font-bold text-[#86919E] mb-1 tabular-nums">
                  {formatOrderBadge(sortOrder)} / {formatOrderBadge(total)}
                </div>

                <h2 className="font-black text-2xl sm:text-3xl text-[#0D1217] tracking-tight">
                  {current.name}
                </h2>

                <p className="mt-1 text-sm font-bold text-[#008F8C]">
                  {current.role}
                </p>

                {current.bio && (
                  <p className="mt-3 text-xs sm:text-sm font-normal text-[#4B5563] leading-[1.95]">
                    {current.bio}
                  </p>
                )}

                {/* Minimal Skill Chips */}
                {current.skills.length > 0 && (
                  <div
                    aria-label="مهارت‌ها"
                    className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-1.5"
                  >
                    {current.skills.map((skill, sIdx) => (
                      <motion.span
                        key={`${current.id}-${skill}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.32,
                          delay: 0.06 + sIdx * 0.04,
                          ease: SILK_EASE,
                        }}
                        className="rounded-full bg-[#0D1217]/[0.045] px-3 py-1 text-[11px] sm:text-xs font-medium text-[#374151]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                )}

                {/* Dynamic Member Links from Supabase */}
                {links.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#0D1217]/[0.06] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {links.map((link, lIdx) => (
                      <a
                        key={`${current.id}-link-${lIdx}`}
                        href={link.url}
                        target={link.url.startsWith('http') ? '_blank' : undefined}
                        rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#0D1217]/10 hover:border-[#008F8C]/40 px-3 py-1 text-xs font-semibold text-[#0D1217] transition-colors"
                      >
                        {renderLinkIcon(link.type, 13)}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle Prev / Counter / Next Controls */}
      {total > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="عضو قبلی"
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#0D1217]/[0.08] flex items-center justify-center text-[#374151] hover:text-[#0D1217] transition-colors cursor-pointer"
          >
            <ChevronRight size={15} strokeWidth={2.2} />
          </button>

          <span className="text-xs font-medium text-[#86919E] tabular-nums min-w-[3rem] text-center">
            {toPersianDigits(safeIndex + 1)} از {toPersianDigits(total)}
          </span>

          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="عضو بعدی"
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#0D1217]/[0.08] flex items-center justify-center text-[#374151] hover:text-[#0D1217] transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  )
}
