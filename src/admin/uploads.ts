import type { Member } from '../types'
import { MEDIA_BUCKET, type ImageSlot } from '../lib/memberMedia'
import { ticketHeader, type DeskSession } from './client'

export const slots = ['portrait', 'cover'] as const
export const slotLabel = { portrait: 'لوگو یا عکس عضو', cover: 'تصویر اختصاصی کارت' }
export type PickedImage = { name: string; blob: Blob }
// Missing = keep; null = remove the override; a decoded file = replace on Save.
export type ImageEdits = Partial<Record<ImageSlot, PickedImage | null>>
export type MediaPatch = Partial<Record<ImageSlot, string | null>>
export class ImageIssue extends Error {}
export class ExpiredUpload extends Error {}
const maxBytes = 5 * 1024 * 1024

export async function prepareImage(file: File, slot: ImageSlot): Promise<PickedImage> {
  if (!file.size || file.size > maxBytes) throw new ImageIssue('فایل باید غیرخالی و حداکثر ۵ مگابایت باشد.')
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const matches = (bytes: number[], at = 0) => bytes.every((v, i) => head[at + i] === v)
  const mime = matches([137,80,78,71,13,10,26,10]) ? 'image/png' : matches([255,216,255]) ? 'image/jpeg'
    : matches([82,73,70,70]) && matches([87,69,66,80], 8) ? 'image/webp' : null
  if (!mime || (file.type && mime !== file.type)) throw new ImageIssue('یک تصویر واقعی JPG، PNG یا WebP انتخاب کنید.')

  const url = URL.createObjectURL(file)
  try {
    const image = new Image(); image.src = url
    await image.decode()
    const w = image.naturalWidth, h = image.naturalHeight
    if (!w || !h || w * h > 48_000_000) throw new ImageIssue('ابعاد تصویر مناسب نیست. یک نسخهٔ کوچک‌تر انتخاب کنید.')
    // Flatten to still raster pixels, preserving transparency but dropping EXIF and original filenames.
    const scale = Math.min(1, (slot === 'portrait' ? 640 : 1600) / Math.max(w,h))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1,Math.round(w * scale)); canvas.height = Math.max(1,Math.round(h * scale))
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error()
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(image,0,0,canvas.width,canvas.height)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', .9))
    // Browsers without a WebP encoder produce PNG.
    if (!blob || !['image/png','image/webp'].includes(blob.type) || !blob.size || blob.size > maxBytes) throw new ImageIssue('آماده‌سازی تصویر ممکن نشد. یک تصویر کوچک‌تر انتخاب کنید.')
    return { name: file.name, blob }
  } finally { URL.revokeObjectURL(url) }
}

const storage = ({ db, ticket }: DeskSession) => db.storage.from(MEDIA_BUCKET).setHeader(ticketHeader, ticket)
export const pathOf = (member: Member | undefined, slot: ImageSlot) => member?.media?.[`${slot}_path`] ?? null

export async function stageImages(session: DeskSession, edits: ImageEdits, staged: string[], signal: AbortSignal, progress: (text: string) => void) {
  const patch: MediaPatch = {}
  for (const slot of slots) {
    const image = edits[slot]
    if (image === undefined) continue
    if (image === null) { patch[slot] = null; continue }
    const bytes = await image.blob.arrayBuffer()
    signal.throwIfAborted()
    const path = `${slot}/${crypto.randomUUID().replaceAll('-', '')}.${image.blob.type === 'image/png' ? 'png' : 'webp'}`
    staged.push(path)
    progress(`در حال آپلود ${slotLabel[slot]}…`)
    const { error } = await storage(session).upload(path, bytes, { contentType: image.blob.type, cacheControl: '3600', upsert: false })
    signal.throwIfAborted()
    if (error) {
      const access = await session.db.rpc('rassa_is_member_admin').setHeader(ticketHeader,session.ticket).abortSignal(signal)
      if (!access.error && access.data === false) throw new ExpiredUpload()
      throw new ImageIssue(`آپلود ${slotLabel[slot]} کامل نشد. تغییرات عضو ذخیره نشده است؛ دوباره تلاش کنید.`)
    }
    patch[slot] = path
  }
  return patch
}

// Storage DELETE policy excludes every path still attached to a card, including
// after a lost RPC acknowledgement. Never clean a legacy URL or another bucket.
export async function removeDetached(session: DeskSession, paths: string[]) {
  if (!paths.length) return
  try { await storage(session).remove(paths) } catch { /* best effort; do not roll back a published card */ }
}
