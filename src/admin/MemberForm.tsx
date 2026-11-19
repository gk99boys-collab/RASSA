import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link2, Plus, Save, Trash2, X } from 'lucide-react'
import type { Member } from '../types'
import { fields, newDraft, type Draft, type SavedFields } from './memberDraft'
import { numberFa } from './client'
import { ImagePicker } from './ImagePicker'
import { pathOf, slots, type ImageEdits } from './uploads'
import { mediaUrl } from '../lib/memberMedia'
import { resolveMemberPhotoUrl } from '../lib/supabase'
import { artwork, cardDesign } from '../components/members/studios'

export function MemberForm({ member, members, busy, feedback, onDirty, onSave, onDelete }: {
  member?: Member; members: Member[]; busy: boolean; feedback: ReactNode; onDirty: () => void
  onSave: (v: SavedFields, edits: ImageEdits) => void; onDelete: () => void
}) {
  const [draft, setDraft] = useState(() => newDraft(member, members.reduce((max, m) => Math.max(max, m.sort_order), 0) + 1))
  const nextLink = useRef(draft.links.length)
  const [issue, setIssue] = useState('')
  const [images,setImages] = useState<ImageEdits>({})
  const [preparing,setPreparing] = useState({ portrait: false, cover: false })
  const pending = preparing.portrait || preparing.cover
  const { studio, sealed } = cardDesign({ name:draft.name, role:draft.role, sort_order:Number(draft.order), links:member?.links })
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    onDirty(); setDraft(old => ({ ...old, [key]: value })); setIssue('')
  }
  function submit(e: FormEvent) {
    e.preventDefault(); if (busy || pending) return
    try { onSave(fields(draft, member, members), images) } catch (e) { setIssue(e instanceof Error ? e.message : 'فیلدها را بررسی کنید.') }
  }
  return <form className="desk-editor paper" onSubmit={submit} aria-label="فرم عضو"><fieldset disabled={busy}>
    <legend className="sr-only">مشخصات عضو</legend>
    <div className="editor-title"><div><p className="desk-overline">شناسنامهٔ عضو</p><h2>{member ? `ویرایش ${member.name}` : 'ثبت عضو جدید'}</h2></div><span className="folio">{member ? numberFa(member.sort_order) : '+'}</span></div>
    <div className="desk-fields"><label>نام و نام خانوادگی<input required value={draft.name} onChange={e => update('name',e.target.value)} /></label>
      <label>نقش در تیم<input required value={draft.role} onChange={e => update('role',e.target.value)} /></label>
      <label>شمارهٔ نمایش<input type="number" required min="1" step="1" max="2147483647" value={draft.order} onChange={e => update('order', e.target.value)} /></label>
      <label className="wide">زندگی‌نامه<textarea rows={3} value={draft.bio} onChange={e => update('bio',e.target.value)} /></label>
      <label className="wide">مهارت‌ها<textarea rows={2} value={draft.skills} onChange={e => update('skills',e.target.value)} /><small>هر مهارت را در یک خط بنویسید یا با «،» جدا کنید.</small></label>
    </div>
    <section className="desk-media" aria-label="تصاویر عضو"><h3>تصاویر عضو</h3>
      <p>هر فایل JPG، PNG یا WebP تا ۵ مگابایت. فایل‌ها فقط با ذخیرهٔ فرم آپلود می‌شوند.</p>
      <div className="image-pickers">{slots.map(slot => <ImagePicker key={slot} slot={slot} value={images[slot]}
        saved={mediaUrl(pathOf(member,slot))} fallback={slot === 'portrait' ? resolveMemberPhotoUrl(draft.photo) : artwork(studio,756,'../')}
        change={image => { onDirty(); setImages(old => ({ ...old, [slot]:image })) }}
        preparing={active => { if (active) onDirty(); setPreparing(old => ({ ...old, [slot]:active })) }} />)}</div>
      {sealed && <p>تصاویر این عضو تا زمان معرفی با نام واقعی روی کارت نمایش داده نمی‌شوند.</p>}
      <details><summary>استفاده از نشانی عکس به‌جای فایل (اختیاری)</summary>
        <label>نشانی عکس عضو<input dir="ltr" value={draft.photo} placeholder="photo.jpg" onChange={e => update('photo',e.target.value)} />
          <small>نام فایل در member-photos یا لینک عمومی عکس؛ وقتی لوگوی آپلودی ندارد استفاده می‌شود.</small></label></details>
    </section>
    <div className="desk-links"><div className="link-heading"><h3><Link2 size={16} />پیوندها</h3><button type="button" onClick={() => update('links',[...draft.links,{key:nextLink.current++, label:'',url:'',type:''}])}><Plus size={14} />افزودن پیوند</button></div>
      {draft.links.map((l, i) => <div className="link-row" key={l.key}><label>عنوان پیوند {numberFa(i+1)}<input value={l.label} required onChange={e => update('links',draft.links.map(v => v.key===l.key ? {...v,label:e.target.value} : v))} /></label>
        <label>نشانی پیوند {numberFa(i+1)}<input value={l.url} dir="ltr" required onChange={e => update('links',draft.links.map(v => v.key===l.key ? {...v,url:e.target.value} : v))} /></label>
        <button type="button" aria-label={`برداشتن پیوند ${numberFa(i+1)}`} onClick={() => update('links',draft.links.filter(v => v.key!==l.key))}><X size={16} /></button></div>)}
    </div>
    {issue && <p className="desk-error" role="alert">{issue}</p>}
    {feedback}
    <div className="desk-form-actions"><button className="desk-key primary" disabled={busy || pending}><Save size={16} />{member ? 'ذخیرهٔ تغییرات' : 'ثبت عضو'}</button>
      {member && <button className="desk-key danger" type="button" onClick={onDelete}><Trash2 size={15} />حذف عضو</button>}</div>
  </fieldset></form>
}
