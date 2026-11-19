import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The project address is public. Credentials, link verifiers and sessions are not build inputs.
const hostedProject = 'https://gshcslntlndqfzudxhub.supabase.co'
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const project = (url || hostedProject).replace(/\/+$/, '')
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const client = (origin: string, key: string) => createClient(origin, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  // Bound file transfers too (the Storage SDK has no per-upload abortSignal).
  global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(60000) }) },
})
export let publicDb: SupabaseClient | null = url && anon ? client(url, anon) : null
let pending: Promise<SupabaseClient> | undefined

async function discover() {
  // Never accept a host from the private link or from the discovery response.
  const abort = new AbortController()
  const timeout = window.setTimeout(() => abort.abort(), 4500)
  try {
    const res = await fetch(`${project}/functions/v1/rassa-public-config`, {
      credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error', signal: abort.signal,
    })
    if (!res.ok) throw new Error('Public connection unavailable')
    const { anonKey } = await res.json()
    if (typeof anonKey !== 'string' || JSON.parse(atob(anonKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role !== 'anon') {
      throw new Error('Invalid public configuration')
    }
    return publicDb = client(project, anonKey)
  } finally { window.clearTimeout(timeout) }
}

export function connectPublic(): Promise<SupabaseClient> {
  if (publicDb) return Promise.resolve(publicDb)
  // Retry a failed discovery on the next request; don't cache an offline error.
  return pending ??= discover().finally(() => { pending = undefined })
}
