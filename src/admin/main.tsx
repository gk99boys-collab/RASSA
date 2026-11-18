import { StrictMode, useEffect, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, KeyRound, LockKeyhole, LogIn, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { desk } from './client'
import { MemberDesk } from './MemberDesk'
import '../fonts.css'
import './style.css'

function SignIn() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!desk || busy) return
    const values = new FormData(e.currentTarget)
    setBusy(true); setError('')
    try {
      const result = await desk.auth.signInWithPassword({ email: String(values.get('email')).trim(), password: String(values.get('password')) })
      if (result.error) setError('ورود انجام نشد. ایمیل، رمز حساب و اتصال اینترنت را بررسی کنید.')
    } catch { setError('اتصال برقرار نشد. دوباره تلاش کنید.') }
    finally { setBusy(false) }
  }
  return <section className="desk-login paper"><div className="login-seal"><LockKeyhole size={26} /></div>
    <p className="desk-overline">ورود به میز تحریریه</p><h1>مدیریت اعضای رَسا</h1>
    <p className="desk-lede">با حساب مدیریت تیم وارد شوید. این میز برای ویرایش کارت‌های سایت است.</p>
    {desk ? <form onSubmit={login}><label>ایمیل مدیر<input type="email" name="email" required autoComplete="username" dir="ltr" /></label>
      <label>رمز عبور<input type="password" name="password" required autoComplete="current-password" dir="ltr" /></label>
      {error && <p className="desk-error" role="alert">{error}</p>}
      <button className="desk-key primary" disabled={busy}><LogIn size={16} />{busy ? 'در حال ورود…' : 'ورود به پنل'}</button>
    </form> : <p className="desk-error" role="alert">اتصال مدیریت تنظیم نشده است. دو متغیر عمومی Supabase را در تنظیمات انتشار سایت قرار دهید و دوباره منتشر کنید.</p>}
    <p className="desk-fine"><KeyRound size={14} />ثبت‌نام عمومی ندارد. با بستن یا تازه‌کردن این صفحه، ورود دوباره لازم است.</p>
  </section>
}

function Access({ user }: { user: User }) {
  const [state, setState] = useState<'checking' | 'allowed' | 'denied' | 'error'>('checking')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    async function check() {
      try {
        const { data, error } = await desk!.rpc('rassa_is_member_admin').abortSignal(controller.signal)
        if (alive) setState(error ? 'error' : data === true ? 'allowed' : 'denied')
      } catch { if (alive) setState('error') }
    }
    void check()
    return () => { alive = false; controller.abort() }
  }, [attempt])
  if (state === 'allowed') return <MemberDesk onDenied={() => setState('denied')} />
  return <section className="desk-login paper"><div className="login-seal"><KeyRound /></div><h1>{state === 'checking' ? 'بررسی دسترسی…' : state === 'denied' ? 'این حساب مجوز مدیریت ندارد' : 'بررسی دسترسی انجام نشد'}</h1>
    {state !== 'checking' && <><p className="desk-lede">{state === 'denied' ? 'مالک پروژه باید شناسهٔ این حساب را در فهرست مدیران تأیید کند.' : 'اتصال یا راه‌اندازی میز مدیریت را بررسی کنید.'}</p>
      {state === 'denied' && <p>شناسهٔ حساب: <bdi className="desk-uid">{user.id}</bdi></p>}
      <button className="desk-key" onClick={() => { setState('checking'); setAttempt(n => n + 1) }}>بررسی دوباره</button></>}
  </section>
}

function Admin() {
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    const sub = desk?.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => sub?.data.subscription.unsubscribe()
  }, [])
  async function logout() {
    try { await desk?.auth.signOut({ scope: 'local' }) } finally { window.location.replace(window.location.pathname) }
  }
  return <><header className="desk-head"><div className="desk-width"><a href="../" className="desk-brand"><img src="../logo-rasa-mark.png" alt="" width="45" height="22" />میز مدیریت رَسا</a>
    <nav aria-label="ابزار مدیریت"><a href="../#members"><ArrowRight size={15} />بازگشت به سایت</a>
      {user && <button type="button" onClick={logout}><LogOut size={15} />خروج</button>}</nav></div></header>
    <main className="desk-width desk-main">{user ? <Access key={user.id} user={user} /> : <SignIn />}</main></>
}

createRoot(document.getElementById('desk')!).render(<StrictMode><Admin /></StrictMode>)
