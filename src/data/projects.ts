export interface ProjectEntry {
  id: string
  /** Short kicker line, e.g. the public site's headline. */
  kicker: string
  /** The work's name as it should appear in the card. */
  title: string
  /** One-line summary shown under the title. */
  description: string
  url: string
  /** External-facing label, e.g. "مشاهده سایت". */
  cta: string
  /** Small trophy flag shown on the cover, e.g. "رتبه اول دوره هفتم". */
  badge: string
  /** Context line, e.g. "سال گذشته — دوره هفتم". */
  context: string
}

/**
 * Works the رَسا team built that are worth keeping on the site.
 * Each card opens its destination in a new tab.
 */
export const PROJECT_ENTRIES: ProjectEntry[] = [
  {
    id: 'khoosf-web',
    kicker: 'خوسف — نگین کویر خراسان',
    title: 'وب‌سایت شهرستان خوسف',
    description:
      'سایت معرفی شهرستان خوسف در خراسان جنوبی؛ بافت تاریخی، اماکن تاریخی و گردشگری، محصولات محلی، آداب و رسوم و معادن طلایی.',
    url: 'https://mgnoies12.github.io/Khoosf-web/',
    cta: 'مشاهده سایت',
    badge: 'رتبه اول دوره هفتم',
    context: 'سال گذشته — دوره هفتم',
  },
]
