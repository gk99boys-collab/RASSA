import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, UsersRound } from 'lucide-react'
import type { Member } from '../types'
import { numberFa, ticketHeader, type DeskSession } from './client'
import { MemberForm } from './MemberForm'
import type { SavedFields } from './memberDraft'
import { MEMBER_COLUMNS } from '../lib/memberMedia'
import { ExpiredUpload, ImageIssue, pathOf, removeDetached, slots, stageImages, type ImageEdits } from './uploads'

type Confirmation = { message: string; action: string; accept: () => void }
function Confirm({ value, close }: { value: Confirmation; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const el = ref.current!; el.showModal(); return () => el.close() }, [])
  return <dialog className="desk-dialog paper" ref={ref} aria-labelledby="confirm-title" onCancel={close}>
    <h2 id="confirm-title">تأیید عملیات</h2><p>{value.message}</p><div className="desk-form-actions">
      <button autoFocus className="desk-key" onClick={close}>انصراف</button>
      <button className="desk-key danger" onClick={() => { close(); value.accept() }}>{value.action}</button></div></dialog>
}

export function MemberDesk({ session, onDenied }: { session: DeskSession; onDenied: () => void }) {
  const [rows,setRows] = useState<Member[] | null>(null)
  const [selected,select] = useState<string | null>(null)
  const [revision,revise] = useState(0)
  const [dirty,setDirty] = useState(false)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState(''), [notice,setNotice] = useState('')
  const [confirm,setConfirm] = useState<Confirmation | null>(null)
  const inFlight = useRef<AbortController | null>(null)
  const [progress,setProgress] = useState('')
  useEffect(() => () => inFlight.current?.abort(), [])
  const load = useCallback(async (preferred?: string | null, signal?: AbortSignal) => {
    setError('')
    try {
      let q = session.db.from('members').select(MEMBER_COLUMNS).order('sort_order')
      if (signal) q = q.abortSignal(signal)
      const { data, error } = await q.overrideTypes<Member[], {merge:false}>()
      if (signal?.aborted) return
      if (error || !data) throw new Error()
      const next = data
      setRows(next); select(next.find(m => m.id === preferred)?.id ?? next[0]?.id ?? null)
      setDirty(false); revise(n => n+1)
    } catch { if (!signal?.aborted) { setRows(null); setError('فهرست از سرور دریافت نشد. اتصال را بررسی و دوباره تلاش کنید.') } }
  }, [session.db])
  useEffect(() => { const c = new AbortController(); void load(null, c.signal); return () => c.abort() }, [load])

  const member = rows?.find(m => m.id === selected)
  function choose(id: string | null) {
    const go = () => { select(id); setDirty(false); setError(''); setNotice(''); revise(n => n+1) }
    if (dirty) setConfirm({ message: 'تغییرات این فرم هنوز ذخیره نشده است. از آن‌ها صرف‌نظر می‌کنید؟', action: 'ادامه بدون ذخیره', accept: go })
    else go()
  }
  async function write(value: SavedFields | 'delete', edits: ImageEdits = {}) {
    if (inFlight.current || (value === 'delete' && !member)) return
    const controller = new AbortController(), { signal } = controller
    inFlight.current = controller; setBusy(true); setError(''); setNotice('')
    const staged: string[] = []
    const retired = slots.filter(slot => value === 'delete' || edits[slot] !== undefined)
      .map(slot => pathOf(member,slot)).filter((path): path is string => !!path)
    let committed = false
    try {
      const patch = await stageImages(session, edits, staged, signal, setProgress)
      signal.throwIfAborted()
      setProgress(value === 'delete' ? 'در حال حذف عضو…' : 'در حال ذخیرهٔ کارت…')
      const request = value === 'delete'
        ? session.db.rpc('rassa_delete_member',{p_id:member!.id})
        : session.db.rpc('rassa_save_member_card',{p_id:member?.id ?? null, p_sort_order:value.sort_order,
          p_name:value.name,p_role:value.role,p_skills:value.skills,p_bio:value.bio,p_photo_url:value.photo_url,p_links:value.links,p_media:patch})
      const result = await request.setHeader(ticketHeader,session.ticket).abortSignal(signal)
      if (result.error || !result.data) {
        const code = result.error?.code
        if (code === '42501' || result.status === 401) { onDenied(); return }
        setError(code === '23505' ? 'این شمارهٔ نمایش توسط عضو دیگری استفاده شده است.' : code === 'P0002' ? 'این عضو دیگر وجود ندارد؛ صفحه را تازه کنید.' : 'ذخیره تأیید نشد. اتصال و مقادیر فرم را بررسی کنید.'); return
      }
      committed = true
      if (signal.aborted) return
      setNotice(value === 'delete' ? 'عضو از سایت حذف شد.' : 'اطلاعات عضو در سایت ذخیره شد.')
      await load(value === 'delete' ? null : String(result.data), signal)
    } catch (err) {
      if (signal.aborted) return
      if (err instanceof ExpiredUpload) onDenied()
      else setError(err instanceof ImageIssue ? err.message : 'پاسخ سرور دریافت نشد. قبل از تلاش مجدد، فهرست را بررسی کنید.')
    } finally {
      void removeDetached(session, committed ? retired : staged)
      inFlight.current = null
      if (!signal.aborted) { setProgress(''); setBusy(false) }
    }
  }
  const feedback = <div className="desk-feedback" aria-live="polite">{progress && <p className="desk-fine" role="status">{progress}</p>}{notice && <p className="desk-success">{notice}</p>}{error && <p className="desk-error" role="alert">{error}</p>}</div>
  return <><div className="desk-heading"><div><p className="desk-overline">میز تحریریه / اعضا</p><h1>دفتر اعضای رَسا</h1><p>کارت‌ها را به ترتیب نمایش در سایت مدیریت کنید.</p></div>
    <button className="desk-key primary" disabled={busy || !rows} onClick={() => choose(null)}><Plus size={17} />عضو جدید</button></div>
    {!rows && feedback}
    {!rows ? <div className="desk-box paper">{error ? <button className="desk-key" onClick={() => void load(selected)}>دریافت دوبارهٔ فهرست</button> : <p role="status">در حال دریافت اعضا…</p>}</div> :
      <div className="desk-grid"><aside className="desk-list paper" aria-label="فهرست ویرایش اعضا"><h2><UsersRound size={16} />فهرست اعضا <b>{numberFa(rows.length)}</b></h2>
        {rows.length === 0 && <p className="desk-fine">هنوز عضوی ثبت نشده است.</p>}
        {rows.map(m => <button type="button" key={m.id} disabled={busy} aria-current={m.id===selected ? 'true' : undefined} onClick={() => { if (m.id !== selected) choose(m.id) }}>
          <span className="seat-number">{numberFa(m.sort_order)}</span><span><strong>{m.name}</strong><small>{m.role}</small></span></button>)}
      </aside><MemberForm key={revision} member={member} members={rows} busy={busy} feedback={feedback} onDirty={() => setDirty(true)} onSave={(v, edits) => void write(v, edits)}
        onDelete={() => { if (member) setConfirm({ message:`کارت «${member.name}» از سایت حذف شود؟ این کار قابل بازگشت نیست.`, action:'تأیید حذف', accept:() => void write('delete') }) }} /></div>}
    {confirm && <Confirm value={confirm} close={() => setConfirm(null)} />}
  </>
}
