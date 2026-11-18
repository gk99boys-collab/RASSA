import { useRef, useState, type FormEvent } from 'react'
import { Link2, Plus, Save, Trash2, X } from 'lucide-react'
import type { Member } from '../types'
import { fields, newDraft, type Draft, type SavedFields } from './memberDraft'
import { numberFa } from './client'

export function MemberForm({ member, members, busy, onDirty, onSave, onDelete }: {
  member?: Member; members: Member[]; busy: boolean; onDirty: () => void
  onSave: (v: SavedFields) => void; onDelete: () => void
}) {
  const [draft, setDraft] = useState(() => newDraft(member, members.reduce((max, m) => Math.max(max, m.sort_order), 0) + 1))
  const nextLink = useRef(draft.links.length)
  const [issue, setIssue] = useState('')
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    onDirty(); setDraft(old => ({ ...old, [key]: value })); setIssue('')
  }
  function submit(e: FormEvent) {
    e.preventDefault(); if (busy) return
    try { onSave(fields(draft, member, members)) } catch (e) { setIssue(e instanceof Error ? e.message : 'فیلدها را بررسی کنید.') }
  }
  return <form className="desk-editor paper" onSubmit={submit} aria-label="فرم عضو"><fieldset disabled={busy}>
    <legend className="sr-only">مشخصات عضو</legend>
    <div className="editor-title"><div><p className="desk-overline">شناسنامهٔ عضو</p><h2>{member ? `ویرایش ${member.name}` : 'ثبت عضو جدید'}</h2></div><span className="folio">{member ? numberFa(member.sort_order) : '+'}</span></div>
    <div className="desk-fields"><label>نام و نام خانوادگی<input required value={draft.name} onChange={e => update('name',e.target.value)} /></label>
      <label>نقش در تیم<input required value={draft.role} onChange={e => update('role',e.target.value)} /></label>
      <label>شمارهٔ نمایش<input type="number" required min="1" step="1" max="2147483647" value={draft.order} onChange={e => update('order', e.target.value)} /></label>
      <label>عکس عضو<input dir="ltr" value={draft.photo} placeholder="photo.jpg" onChange={e => update('photo',e.target.value)} /><small>نام فایل در member-photos یا لینک عمومی عکس</small></label>
      <label className="wide">زندگی‌نامه<textarea rows={3} value={draft.bio} onChange={e => update('bio',e.target.value)} /></label>
      <label className="wide">مهارت‌ها<textarea rows={2} value={draft.skills} onChange={e => update('skills',e.target.value)} /><small>هر مهارت را در یک خط بنویسید یا با «،» جدا کنید.</small></label>
    </div>
    <div className="desk-links"><div className="link-heading"><h3><Link2 size={16} />پیوندها</h3><button type="button" onClick={() => update('links',[...draft.links,{key:nextLink.current++, label:'',url:'',type:''}])}><Plus size={14} />افزودن پیوند</button></div>
      {draft.links.map((l, i) => <div className="link-row" key={l.key}><label>عنوان پیوند {numberFa(i+1)}<input value={l.label} required onChange={e => update('links',draft.links.map(v => v.key===l.key ? {...v,label:e.target.value} : v))} /></label>
        <label>نشانی پیوند {numberFa(i+1)}<input value={l.url} dir="ltr" required onChange={e => update('links',draft.links.map(v => v.key===l.key ? {...v,url:e.target.value} : v))} /></label>
        <button type="button" aria-label={`برداشتن پیوند ${numberFa(i+1)}`} onClick={() => update('links',draft.links.filter(v => v.key!==l.key))}><X size={16} /></button></div>)}
    </div>
    {issue && <p className="desk-error" role="alert">{issue}</p>}
    <div className="desk-form-actions"><button className="desk-key primary" disabled={busy}><Save size={16} />{member ? 'ذخیرهٔ تغییرات' : 'ثبت عضو'}</button>
      {member && <button className="desk-key danger" type="button" onClick={onDelete}><Trash2 size={15} />حذف عضو</button>}</div>
  </fieldset></form>
}
