// Release smoke test. No owner link, PIN, session, writes, or real rows in logs.
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

const base = new URL(process.env.PAGES_URL)
base.pathname = base.pathname.replace(/\/?$/, '/')
const project = (process.env.VITE_SUPABASE_URL || 'https://gshcslntlndqfzudxhub.supabase.co').replace(/\/+$/, '')
const origin = base.origin
let phase = 'published desk HTML'
const get = async (url, init) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...init })
  assert.ok(response.ok, `HTTP ${response.status}: ${new URL(url).pathname}`)
  return response
}
async function check() {
  phase = 'published desk HTML'
  const desk = new URL('admin/', base)
  desk.searchParams.set('release', process.env.GITHUB_SHA ?? 'current')
  const html = await (await get(desk)).text()
  const entry = html.match(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/)?.[1]
  assert.ok(entry && html.includes('noindex'), 'Missing private desk entry')
  phase = 'published PIN bundle'
  assert.ok((await (await get(new URL(entry,desk))).text()).includes('rassa_open_desk'), 'PIN bundle not yet served')

  const permitsPages = res => ['*', origin].includes(res.headers.get('access-control-allow-origin'))
  phase = 'public anon configuration'
  let key = process.env.VITE_SUPABASE_ANON_KEY
  if (!key) {
    const config = await get(`${project}/functions/v1/rassa-public-config`, { headers: { origin } })
    assert.ok(permitsPages(config), 'Public config unavailable from Pages')
    key = (await config.json()).anonKey
  }
  assert.equal(JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role, 'anon')
  phase = 'cross-origin session preflight'
  const preflight = await get(`${project}/rest/v1/rpc/rassa_close_desk`, {
    method: 'OPTIONS', headers: { origin, 'access-control-request-method': 'POST',
      'access-control-request-headers': 'apikey,authorization,content-type,x-client-info,x-rassa-desk-session' },
  })
  const allowed = (preflight.headers.get('access-control-allow-headers') ?? '').toLowerCase().split(/\s*,\s*/)
  assert.ok(permitsPages(preflight) && (allowed.includes('*') || allowed.includes('x-rassa-desk-session')), 'Desk request header not allowed')
  const headers = { origin, apikey: key, authorization: `Bearer ${key}` }
  phase = 'anonymous public roster read'
  const members = await get(`${project}/rest/v1/members?select=id&limit=1`, { headers })
  assert.ok(Array.isArray(await members.json()), 'Anonymous roster read failed')
  phase = 'closed-by-default login endpoint'
  const login = await get(`${project}/rest/v1/rpc/rassa_open_desk`, {
    method:'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({p_link:'',p_pin:''}),
  })
  assert.ok(['*', origin].includes(login.headers.get('access-control-allow-origin')), 'Pages origin not allowed')
  assert.ok((await login.json())?.state === 'denied', 'Invalid link was not explicitly denied')
}
for (let i=0; ; i++) {
  try {
    await check()
    console.log('Live Pages PIN entry, anonymous member read and closed-by-default login verified.')
    break
  } catch (e) {
    if (i < 3) { await delay(5000); continue }
    // Surface only the failed phase/status, never a response body or credentials.
    const status = /^HTTP \d{3}:/u.exec(e.message)?.[0].slice(0, -1)
    console.error(`::error title=Published desk check::Failed: ${phase}${status ? ' (' + status + ')' : ''}`)
    process.exitCode = 1
    break
  }
}
