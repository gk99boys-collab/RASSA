import { StrictMode, useCallback, useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, LockKeyhole, LogIn, LogOut } from 'lucide-react'
import { lock, unlock, LoginError, type DeskSession } from './client'
import { MemberDesk } from './MemberDesk'
import '../fonts.css'
import './style.css'

function SignIn({ message, enter }: { message: string; enter: (s: DeskSession) => void }) {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(message)
  const [error, setError] = useState('')
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    const form = e.currentTarget
    const pin = String(new FormData(form).get('pin') ?? '')
    setBusy(true); setNotice(''); setError('')
    try {
      const session = await unlock(pin)
      form.reset(); enter(session)
    } catch (problem) {
      form.reset()
      setError(problem instanceof LoginError ? problem.message : 'ارتباط برقرار نشد. دوباره تلاش کنید.')
    } finally { setBusy(false) }
  }
  return <section className="desk-login paper"><div className="login-seal"><LockKeyhole size={26} /></div>
    <p className="desk-overline">میز خصوصی تحریریه</p><h1>مدیریت اعضای رَسا</h1>
    <p className="desk-lede">برای باز کردن دفتر اعضا، رمز چهاررقمی مدیریت را وارد کنید.</p>
    <form method="post" onSubmit={login}><label>رمز مدیریت<input className="desk-pin" type="password" name="pin" inputMode="numeric" required
      disabled={busy} minLength={4} maxLength={4} pattern="[0-9۰-۹٠-٩]{4}" autoComplete="current-password" dir="ltr" /></label>
      {notice && <p className="desk-fine" role="status">{notice}</p>}
      {error && <p className="desk-error" role="alert">{error}</p>}
      <button className="desk-key primary" disabled={busy}><LogIn size={16} />{busy ? 'در حال بررسی…' : 'ورود به پنل'}</button>
    </form>
  </section>
}

function Admin() {
  const [session, setSession] = useState<DeskSession | null>(null)
  const [message, setMessage] = useState('')
  const [closing, setClosing] = useState(false)
  const expired = useCallback(() => { setSession(null); setMessage('نشست مدیریت پایان یافت. دوباره رمز را وارد کنید.') }, [])
  useEffect(() => {
    if (!session) return
    const timer = window.setTimeout(expired, session.lifetime)
    return () => window.clearTimeout(timer)
  }, [session, expired])
  async function logout() {
    if (!session) return
    setClosing(true); setSession(null)
    try { await lock(session); setMessage('از پنل خارج شدید.') }
    catch { setMessage('از این صفحه خارج شدید، اما سرور پاسخ نداد. ورود دوباره، نشست قبلی را می‌بندد.') }
    finally { setClosing(false) }
  }
  return <><header className="desk-head"><div className="desk-width"><a href="../" className="desk-brand"><img src="../logo-rasa-mark.png" alt="" width="45" height="22" />میز مدیریت رَسا</a>
    <nav aria-label="ابزار مدیریت"><a href="../#members"><ArrowRight size={15} />بازگشت به سایت</a>
      {session && <button type="button" onClick={logout}><LogOut size={15} />خروج</button>}</nav></div></header>
    <main className="desk-width desk-main">{session ? <MemberDesk session={session} onDenied={expired} /> : closing
      ? <section className="desk-login paper" role="status">در حال بستن نشست…</section>
      : <SignIn message={message} enter={setSession} />}</main></>
}

createRoot(document.getElementById('desk')!).render(<StrictMode><Admin /></StrictMode>)
