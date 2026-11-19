import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, Image as ImageIcon, Undo2 } from 'lucide-react'
import type { ImageSlot } from '../lib/memberMedia'
import { ImageIssue, prepareImage, slotLabel, type PickedImage } from './uploads'

type Props = {
  slot: ImageSlot; saved: string | null; fallback?: string | null; value?: PickedImage | null
  change: (image: PickedImage | null | undefined) => void; preparing: (busy: boolean) => void
}
export function ImagePicker({ slot, saved, fallback, value, change, preparing }: Props) {
  const input = useId(), generation = useRef(0)
  const [busy,setBusy] = useState(false), [issue,setIssue] = useState('')
  const [preview,setPreview] = useState<string | null>(null), [failed,setFailed] = useState<string | null>(null)
  useEffect(() => () => { generation.current++ }, [])
  useEffect(() => {
    const url = value ? URL.createObjectURL(value.blob) : null
    setPreview(url)
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [value])
  async function pick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    const seq = ++generation.current
    setIssue(''); setBusy(true); preparing(true)
    try { const img = await prepareImage(file,slot); if (generation.current === seq) change(img) }
    catch (err) { if (generation.current === seq) setIssue(err instanceof ImageIssue ? err.message : 'این تصویر باز نشد. فایل دیگری انتخاب کنید.') }
    finally { if (generation.current === seq) { setBusy(false); preparing(false) } }
  }
  const src = value ? preview : value === null ? fallback : saved ?? fallback
  const label = slotLabel[slot]
  return <div className="image-picker" data-slot={slot}>
    <div className="proof-heading"><h4>{label}</h4><small>{slot === 'portrait' ? 'قاب عکس' : 'بالای کارت'}</small></div>
    <div className="image-proof">{src && failed !== src ? <img src={src} alt={`پیش‌نمایش ${label}`} onError={() => setFailed(src)} /> : <ImageIcon aria-hidden="true" size={24} />}</div>
    <div className="image-actions"><label className="file-key" htmlFor={input}><ImagePlus size={15} />انتخاب فایل
      <input id={input} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" aria-label={`انتخاب فایل ${label}`} onChange={e => void pick(e)} /></label>
      {value !== undefined || saved ? <button type="button" disabled={busy} onClick={() => { setIssue(''); change(value !== undefined ? undefined : null) }}>
        <Undo2 size={13} />{value !== undefined ? 'لغو تغییر' : 'بازگشت به پیش‌فرض'}</button> : null}</div>
    <small aria-live="polite">{busy ? 'آماده‌سازی تصویر…' : value ? <bdi>{value.name}</bdi> : value === null ? 'پس از ذخیره: پیش‌فرض' : saved ? 'تصویر ذخیره‌شده' : 'پیش‌فرض'}</small>
    {issue && <p className="desk-error" role="alert">{issue} انتخاب قبلی تغییر نکرد.</p>}
  </div>
}
