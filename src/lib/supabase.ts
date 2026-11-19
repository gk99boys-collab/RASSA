import { publicDb as supabase } from './connection'
import type { Member, NormalizedLink, RawLinks } from '../types'

export { supabase }
export const MEMBER_PHOTOS_BUCKET = 'member-photos'

/**
 * Resolves a member's `photo_url` value.
 * Supports either a full https:// URL or a file path stored in the public
 * `member-photos` Supabase Storage bucket (e.g. "mojtaba.jpg").
 */
export function resolveMemberPhotoUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null
  const trimmed = photoUrl.trim()
  if (!trimmed) return null

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('./') || trimmed.startsWith('/')) {
    return trimmed
  }

  if (!supabase) return null
  const cleanPath = trimmed.replace(/^member-photos\//, '').replace(/^\/+/, '')
  const { data } = supabase.storage.from(MEMBER_PHOTOS_BUCKET).getPublicUrl(cleanPath)
  return data.publicUrl || null
}

const KNOWN_LINK_LABELS: Record<string, string> = {
  github: 'گیت‌هاب',
  gitlab: 'گیت‌لب',
  linkedin: 'لینکدین',
  telegram: 'تلگرام',
  eitaa: 'ایتا',
  bale: 'بله',
  rubika: 'روبیکا',
  instagram: 'اینستاگرام',
  twitter: 'ایکس',
  x: 'ایکس',
  website: 'وب‌سایت',
  portfolio: 'نمونه‌کار',
  email: 'ایمیل',
  phone: 'تماس',
  dribbble: 'دریبل',
  behance: 'بیهنس',
  aparat: 'آپارات',
  youtube: 'یوتیوب',
}

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url.trim())
}

/**
 * Accepts either a JSON array `[{ "label": "گیت‌هاب", "url": "https://..." }]`
 * or a JSON object `{ "github": "https://...", "eitaa": "https://..." }`
 * so editing `links` in Supabase Table Editor is effortless.
 */
export function normalizeLinks(raw: RawLinks): NormalizedLink[] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const url = String(item.url ?? item.href ?? '').trim()
        if (!url || !isSafeUrl(url)) return null
        const rawType = String(item.type ?? item.icon ?? item.name ?? '').trim().toLowerCase()
        const label =
          String(item.label ?? item.title ?? item.name ?? '').trim() ||
          KNOWN_LINK_LABELS[rawType] ||
          'لینک'
        return { label, url, type: rawType || 'link' }
      })
      .filter((item): item is NormalizedLink => item !== null)
  }

  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([key, val]) => {
        if (key === 'locked' || typeof val !== 'string') return null
        const url = val.trim()
        if (!url || !isSafeUrl(url)) return null
        const lowerKey = key.trim().toLowerCase()
        return {
          label: KNOWN_LINK_LABELS[lowerKey] ?? key,
          url,
          type: lowerKey,
        }
      })
      .filter((item): item is NormalizedLink => item !== null)
  }

  return []
}

/**
 * Detects whether a member row should render as the locked "mystery card".
 * Updating row 5's `name` in Supabase to the new teammate's real name automatically
 * unlocks and renders a full member card without changing any code.
 */
export function isMysteryMember(member: Pick<Member, 'name' | 'links'>): boolean {
  if (
    member.links &&
    !Array.isArray(member.links) &&
    typeof member.links === 'object' &&
    member.links.locked === true
  ) {
    return true
  }
  const normalizedName = member.name.replace(/\u200c/g, ' ').trim()
  return (
    normalizedName.startsWith('به زودی') ||
    normalizedName.startsWith('بزودی') ||
    normalizedName === '?' ||
    normalizedName === '؟'
  )
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit)
}

export function formatOrderBadge(num: number): string {
  const padded = num < 10 ? `0${num}` : String(num)
  return toPersianDigits(padded)
}
