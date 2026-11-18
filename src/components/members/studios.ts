import { isMysteryMember } from '../../lib/supabase'
import type { Member } from '../../types'

// These are role illustrations, never a source of people's portraits.
export const STUDIOS = {
  planning: { title: ['نقشهٔ', 'پروژه'], alt: 'تصویرسازی دفتر برنامه‌ریزی با پونز و نوارهای زمان‌بندی روی میز قرمز' },
  mobile: { title: ['کارگاه', 'اپلیکیشن'], alt: 'تصویرسازی گوشی با لایه‌های رابط کاربری روی میز فیروزه‌ای' },
  data: { title: ['اتاق', 'داده'], alt: 'تصویرسازی سرور و دیسک‌های پایگاه داده روی زمینهٔ آبی' },
  editorial: { title: ['میز', 'روایت'], alt: 'تصویرسازی میکروفن و برگه‌های ارائه روی میز زرد' },
  studio: { title: ['میز', 'رَسا'], alt: 'تصویرسازی دفتر سفید، مداد و گیره روی میز کارگاه' },
} as const
export type Studio = keyof typeof STUDIOS

export function cardDesign(member: Member): { studio: Studio; sealed: boolean } {
  // A name edit alone opens seat five, even if its old links still contain a lock flag.
  const sealed = isMysteryMember(member.sort_order === 5 ? { ...member, links: null } : member)
  if (sealed) return { studio: 'studio', sealed }
  // Use the current role, not a display name or a local-only ID. Unrecognised roles
  // get a neutral workbench rather than an illustration of somebody else's job.
  const role = member.role.replace(/[\s\u200c-]+/g, ' ').replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  let studio: Studio = 'studio'
  if (/سرپرست|مدیر(?:یت)? پروژه/.test(role)) studio = 'planning'
  else if (/موبایل|اندروید|اپلیکیشن/.test(role)) studio = 'mobile'
  else if (/بک ?اند|دیتابیس|پایگاه داده|سرور/.test(role)) studio = 'data'
  else if (/محتوا|ارائه|گوینده/.test(role)) studio = 'editorial'
  return { studio, sealed }
}

export const artwork = (studio: Studio, size: 'thumb' | 756 | 1404) =>
  `${import.meta.env.BASE_URL}member-covers/${studio}-${size}.webp`
