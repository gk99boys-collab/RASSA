import React from 'react'
import { Check } from 'lucide-react'
import { toPersianDigits } from '../lib/supabase'

interface SectionPillProps {
  index: number
  title: string
  badgeLabel?: string
}

/**
 * Signature 8th Event Section-Title Pill:
 * Connected Red badge + Black tab + 3px black border + hard offset shadow + green pixel dot.
 */
export const SectionPill: React.FC<SectionPillProps> = ({ index, title, badgeLabel }) => {
  const num = badgeLabel ?? `۰${toPersianDigits(index)}`
  return (
    <div className="inline-flex items-stretch border-[3px] border-[#0A0A0A] rounded-[7px] shadow-[-5px_5px_0_#0A0A0A] overflow-hidden bg-[#0A0A0A] select-none">
      <span className="flex items-center justify-center bg-[#E5252A] text-white font-black text-sm sm:text-base px-3.5 py-2 border-l-[3px] border-[#0A0A0A] tracking-tight">
        {num}
      </span>
      <span className="flex items-center gap-2.5 bg-[#0A0A0A] text-white font-extrabold text-sm sm:text-base px-4 py-2">
        <span>{title}</span>
        <span
          className="inline-block w-2.5 h-2.5 bg-[#22C55E] shrink-0"
          aria-hidden="true"
        />
      </span>
    </div>
  )
}

interface CheckChipProps {
  label: string
  accent?: 'green' | 'red'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Official-style Neo-Brutalist Chip with square check icon on the right (RTL start).
 */
export const CheckChip: React.FC<CheckChipProps> = ({
  label,
  accent = 'green',
  size = 'md',
  className = '',
}) => {
  const boxBg = accent === 'green' ? 'bg-[#22C55E] text-[#0A0A0A]' : 'bg-[#E5252A] text-white'
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs sm:text-sm gap-1.5' : 'px-3.5 py-2 text-sm sm:text-base gap-2.5'
  const iconBoxSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const checkSize = size === 'sm' ? 11 : 13

  return (
    <span
      className={`brutal-chip inline-flex items-center font-bold leading-snug ${padding} ${className}`}
    >
      <span
        className={`${iconBoxSize} ${boxBg} border-2 border-[#0A0A0A] rounded-[3px] inline-flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <Check size={checkSize} strokeWidth={3.5} />
      </span>
      <span>{label}</span>
    </span>
  )
}

interface BrutalButtonProps {
  variant?: 'red' | 'white' | 'dark'
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
 * Neo-Brutalist Button (Red primary / White outlined / Dark) that physically presses
 * down as its hard black offset shadow collapses on hover & tap.
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
  const variantClasses =
    variant === 'red'
      ? 'bg-[#E5252A] hover:bg-[#D41E23] text-white'
      : variant === 'dark'
        ? 'bg-[#0A0A0A] hover:bg-[#1C1C1C] text-white'
        : 'bg-white hover:bg-[#FFF5F5] text-[#0A0A0A]'

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
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={combined}
    >
      {children}
    </button>
  )
}

interface IconCardProps {
  icon: React.ReactNode
  title?: string
  children: React.ReactNode
  className?: string
}

/**
 * Signature Neo-Brutalist Card with a #E5252A red icon box anchored on the right (RTL start).
 */
export const IconCard: React.FC<IconCardProps> = ({
  icon,
  title,
  children,
  className = '',
}) => (
  <div className={`brutal-card p-5 sm:p-6 flex items-start gap-4 ${className}`}>
    <div
      className="brutal-icon-box w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      {title ? (
        <h3 className="font-black text-lg sm:text-xl text-[#0A0A0A] mb-1.5 leading-snug">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  </div>
)

export const BrutalSkeleton: React.FC<{ className?: string; label?: string }> = ({
  className = 'h-6 w-full',
  label = 'در حال بارگذاری...',
}) => (
  <div
    className={`brutal-skeleton ${className}`}
    role="status"
    aria-label={label}
  />
)
