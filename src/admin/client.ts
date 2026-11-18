import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Separate document and client. No session in storage, no tokens accepted from URLs.
export const desk = url && anon ? createClient(url, anon, { auth: {
  storageKey: 'rassa:member-desk', persistSession: false, autoRefreshToken: true, detectSessionInUrl: false,
} }) : null
export const numberFa = (value: number) => value.toLocaleString('fa-IR', { useGrouping: false })
