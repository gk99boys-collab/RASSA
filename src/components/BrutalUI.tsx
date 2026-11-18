import React from 'react'
import { Check } from 'lucide-react'
import { formatOrderBadge } from '../lib/supabase'

interface SectionPillProps {
  index: number
  title: string
  subtitle?: string
  darkContext?: boolean
}

/**
 * Signature 8th Event Section-Title Pill:
 * Connected Strong Red index badge + Jet Black title tab + Green pixel LED + hard shadow.
 */
export const SectionPill: React.FC<SectionPillProps> = ({
  index,
  title,
  subtitle,
  darkContext = false,
}) => {
  const num = formatOrderBadge(index)

  return (
    <div className="inline-flex flex-wrap items-center gap-3 select-none">
      <div
        className={`inline-flex items-stretch rounded-[8px] overflow-hidden ${
          darkContext
            ? 'border-[3px] border-white shadow-[-5px_5px_0_#E5252A] bg-white'
            : 'border-[3px] border-[#080A0D] shadow-[-6px_6px_0_#080A0D] bg-[#080A0D]'
        }`}
      >
        <span
          className={`flex items-center justify-center bg-[#E5252A] text-white font-black text-sm sm:text-base px-4 py-2 ${
            darkContext ? 'border-l-[3px] border-white' : 'border-l-[3px] border-[#080A0D]'
          }`}
        >
          {num}
        </span>
        <span className="flex items-center gap-2.5 bg-[#080A0D] text-white font-black text-sm sm:text-base px-4 py-2">
          <span>{title}</span>
          <span
            className="inline-block w-2.5 h-2.5 bg-[#16B853] shrink-0 pixel-blink"
            aria-hidden="true"
          />
        </span>
      </div>

      {subtitle && (
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-[5px] border-2 ${
            darkContext
              ? 'border-white/25 bg-white/10 text-[#00D4C8]'
              : 'border-[#080A0D] bg-white text-[#080A0D] shadow-[-2px_2px_0_#080A0D]'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  )
}

interface CheckChipProps {
  label: string
  accent?: 'green' | 'red' | 'teal'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Official Neo-Brutalist Chip with crisp bordered check-icon box on the right (RTL start).
 */
export const CheckChip: React.FC<CheckChipProps> = ({
  label,
  accent = 'green',
  size = 'md',
  className = '',
}) => {
  const boxStyle =
    accent === 'green'
      ? 'bg-[#16B853] text-white'
      : accent === 'teal'
        ? 'bg-[#00A8A8] text-white'
        : 'bg-[#E5252A] text-white'

  const pad =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs sm:text-sm gap-2'
      : 'px-3.5 py-2 text-sm sm:text-base gap-2.5'
  const iconBox = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const checkSize = size === 'sm' ? 11 : 13

  return (
    <span className={`brutal-chip inline-flex items-center font-extrabold leading-snug ${pad} ${className}`}>
      <span
        className={`${iconBox} ${boxStyle} border-2 border-[#080A0D] rounded-[3px] inline-flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <Check size={checkSize} strokeWidth={3.5} />
      </span>
      <span>{label}</span>
    </span>
  )
}

interface BrutalButtonProps {
  variant?: 'red' | 'white' | 'dark' | 'neon'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  target?: string
  rel?: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  children: React.ReactNode
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit'
}

/**
 * Tactile Neo-Brutalist Button whose hard offset shadow collapses physically on hover/tap.
 */
export const BrutalButton: React.FC<BrutalButtonProps> = ({
  variant = 'red',
  size = 'md',
  href,
  target,
  rel,
  onClick,
  children,
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  if (variant === 'neon') {
    const pad =
      size === 'sm'
        ? 'px-3.5 py-2 text-xs sm:text-sm font-extrabold gap-2'
        : 'px-5 py-3 text-sm sm:text-base font-black gap-2.5'
    const cls = `brutal-press-neon inline-flex items-center justify-center select-none bg-[#121720] hover:bg-[#1C2330] text-white ${pad} ${className}`
    if (href) {
      return (
        <a href={href} target={target} rel={rel} onClick={onClick} aria-label={ariaLabel} className={cls}>
          {children}
        </a>
      )
    }
    return (
      <button type={type} onClick={onClick} aria-label={ariaLabel} className={cls}>
        {children}
      </button>
    )
  }

  const variantClasses =
    variant === 'red'
      ? 'bg-[#E5252A] hover:bg-[#CF1D22] text-white'
      : variant === 'dark'
        ? 'bg-[#080A0D] hover:bg-[#181D24] text-white'
        : 'bg-white hover:bg-[#FFF3F3] text-[#080A0D]'

  const sizeClasses =
    size === 'sm'
      ? 'brutal-press-sm px-3.5 py-2 text-xs sm:text-sm font-extrabold gap-2'
      : size === 'lg'
        ? 'brutal-press px-6 py-3.5 text-base sm:text-lg font-black gap-2.5'
        : 'brutal-press px-5 py-2.5 text-sm sm:text-base font-extrabold gap-2'

  const combined = `inline-flex items-center justify-center select-none ${variantClasses} ${sizeClasses} ${className}`

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={ariaLabel}
        className={combined}
      >
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={combined}>
      {children}
    </button>
  )
}

export const BrutalSkeleton: React.FC<{ className?: string; label?: string }> = ({
  className = 'h-7 w-full',
  label = 'در حال بارگذاری...',
}) => <div className={`brutal-skeleton ${className}`} role="status" aria-label={label} />
