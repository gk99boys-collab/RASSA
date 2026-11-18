import type { SupabaseClient } from '@supabase/supabase-js'
import { connectPublic } from '../lib/connection'

export const numberFa = (value: number) => value.toLocaleString('fa-IR', { useGrouping: false })
export const ticketHeader = 'x-rassa-desk-session'
export type DeskSession = { db: SupabaseClient; ticket: string; lifetime: number }
export class LoginError extends Error {}

export async function unlock(typed: string): Promise<DeskSession> {
  const link = new URLSearchParams(window.location.hash.slice(1)).get('k') ?? ''
  const pin = typed.trim().replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660))
  const denied = 'رمز یا لینک خصوصی درست نیست.'
  if (!/^[a-f0-9]{64}$/.test(link) || !/^\d{4}$/.test(pin)) throw new LoginError(denied)

  const db = await connectPublic()
  const { data, error } = await db.rpc('rassa_open_desk', { p_link: link, p_pin: pin }).abortSignal(AbortSignal.timeout(15000))
  if (error) throw new LoginError('پاسخی از میز مدیریت دریافت نشد. دوباره تلاش کنید.')
  if (data?.state === 'wait') {
    const minutes = Math.max(1, Math.ceil(Number(data.seconds) / 60))
    throw new LoginError(`ورود موقتاً بسته است. ${numberFa(minutes)} دقیقهٔ دیگر امتحان کنید.`)
  }
  if (data?.state !== 'ok') throw new LoginError(denied)
  const { ticket, expires_in: seconds } = data
  if (typeof ticket !== 'string' || !/^[a-f0-9]{64}$/.test(ticket) || !Number.isSafeInteger(seconds) || seconds < 1 || seconds > 86400) {
    throw new LoginError('نشست مدیریت معتبر نیست. دوباره وارد شوید.')
  }
  return { db, ticket, lifetime: seconds * 1000 }
}

export async function lock({ db, ticket }: DeskSession) {
  // The browser has already dropped the ticket; confirm revocation on the server too.
  const { error } = await db.rpc('rassa_close_desk').setHeader(ticketHeader, ticket).abortSignal(AbortSignal.timeout(8000))
  if (error) throw new Error('Logout not confirmed')
}
