import type { Member, RawLinks } from '../types'

type LinkRow = { key: number; label: string; url: string; type: string }
function linkRows(raw: RawLinks): LinkRow[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean).map((v, key) => ({ key, label: v.label ?? v.title ?? v.name ?? v.type ?? 'پیوند', url: v.url ?? v.href ?? '', type: v.type ?? '' }))
  return Object.entries(raw).filter(([, val]) => typeof val === 'string').map(([label, url], key) => ({ key, label, url: String(url), type: label }))
}
export function newDraft(m: Member | undefined, order: number) {
  return { name: m?.name ?? '', role: m?.role ?? '', bio: m?.bio ?? '', order: String(m?.sort_order ?? order),
    skills: (m?.skills ?? []).join('\n'), photo: m?.photo_url ?? '', links: linkRows(m?.links) }
}
export type Draft = ReturnType<typeof newDraft>
export type SavedFields = Omit<Member, 'id' | 'media'>
export function fields(d: Draft, original: Member | undefined, rows: Member[]): SavedFields {
  const sort_order = Number(d.order), photo_url = d.photo.trim() || null
  if (!d.name.trim() || !d.role.trim()) throw Error('نام و نقش عضو را وارد کنید.')
  if (!Number.isInteger(sort_order) || sort_order < 1 || sort_order > 2147483647) throw Error('شمارهٔ نمایش باید یک عدد صحیح مثبت باشد.')
  if (rows.some(r => r.sort_order === sort_order && r.id !== original?.id)) throw Error('این شمارهٔ نمایش قبلاً استفاده شده است.')
  if (photo_url && photo_url !== original?.photo_url && (/^[a-z][\w+.-]*:/i.test(photo_url) && !/^https:\/\//i.test(photo_url) || photo_url.startsWith('//'))) throw Error('برای عکس، نشانی HTTPS یا مسیر فایل باکت را بنویسید.')
  const raw = original?.links
  let links = raw ?? []
  if (JSON.stringify(d.links) !== JSON.stringify(linkRows(raw))) {
    const lines = d.links.map(l => ({ label: l.label.trim(), url: l.url.trim(), type: l.type }))
    if (lines.some(l => !l.label || !/^(https?:\/\/|mailto:|tel:)/i.test(l.url))) throw Error('برای هر پیوند عنوان و نشانی معتبر بنویسید یا آن ردیف را بردارید.')
    if (raw && !Array.isArray(raw)) {
      if (new Set(lines.map(l => l.label)).size !== lines.length || lines.some(l => l.label === 'locked')) throw Error('عنوان پیوندها باید یکتا باشد و نمی‌تواند locked باشد.')
      links = Object.fromEntries([...Object.entries(raw).filter(([,v]) => typeof v !== 'string'), ...lines.map(l => [l.label, l.url])])
    } else links = lines
  }
  return { sort_order, name: d.name.trim(), role: d.role.trim(), bio: d.bio.trim(), photo_url,
    skills: [...new Set(d.skills.split(/[\n،,]/).map(s => s.trim()).filter(Boolean))], links }
}
