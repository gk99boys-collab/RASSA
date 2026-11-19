// Release smoke test. No owner link, PIN, session, writes, or real rows in logs.
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

const base = new URL(process.env.PAGES_URL)
base.pathname = base.pathname.replace(/\/?$/, '/')
const project = (process.env.VITE_SUPABASE_URL || 'https://gshcslntlndqfzudxhub.supabase.co').replace(/\/+$/, '')
const origin = base.origin
class HttpFailure extends Error {}
let phase = 'published desk HTML'
const get = async (url, init) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), ...init })
  if (!response.ok) {
    const { code } = await response.json().catch(() => ({}))
    const known = ['BOOT_ERROR', 'WORKER_ERROR', 'PUBLIC_CONFIG_UNAVAILABLE', 'NOT_FOUND', 'PGRST202']
    throw new HttpFailure(`HTTP ${response.status}${known.includes(code) ? ': ' + code : ''}`)
  }
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
  const bundle = await (await get(new URL(entry,desk))).text()
  assert.ok(bundle.includes('rassa_open_desk'), 'PIN bundle not yet served')
  // A manual branch run checks the API before Pages serves the new build.
  if (process.env.GITHUB_REF === 'refs/heads/main') {
    phase = 'published member upload editor'
    assert.ok(bundle.includes('rassa_save_member_card'), 'Upload editor not yet served')
  }

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
  async function preflight(path, method, names) {
    const res = await get(project + path, { method:'OPTIONS', headers:{ origin,
      'access-control-request-method':method,'access-control-request-headers':names.join(',') } })
    const allowed = (res.headers.get('access-control-allow-headers') ?? '').toLowerCase().split(/\s*,\s*/)
    const methods = (res.headers.get('access-control-allow-methods') ?? '').toUpperCase().split(/\s*,\s*/)
    assert.ok(permitsPages(res) && (methods.includes(method) || methods.includes('*')) && names.every(name =>
      allowed.includes(name) || (name !== 'authorization' && allowed.includes('*'))), 'Pages preflight rejected')
  }
  const common = ['apikey','authorization','content-type','x-client-info','x-rassa-desk-session']
  await preflight('/rest/v1/rpc/rassa_close_desk', 'POST', common)
  phase = 'Storage preflight for upload and cleanup'
  const objects = '/storage/v1/object/rassa-member-media'
  await preflight(objects + '/cover/preflight.png','POST',[...common,'x-upsert','cache-control'])
  await preflight(objects,'DELETE',common)
  const headers = { origin, apikey: key, authorization: `Bearer ${key}` }
  phase = 'anonymous public roster read'
  const members = await get(`${project}/rest/v1/members?select=id,media:rassa_member_media(portrait_path,cover_path)&limit=1`, { headers })
  const sample = await members.json()
  assert.ok(Array.isArray(sample) && sample.every(row => Object.hasOwn(row,'media') &&
    (row.media === null || (!Array.isArray(row.media) && Object.hasOwn(row.media,'cover_path') && Object.hasOwn(row.media,'portrait_path')))), 'Member media join failed')
  phase = 'anonymous media session check'
  const session = await get(`${project}/rest/v1/rpc/rassa_is_member_admin`, {
    method:'POST', headers:{...headers,'content-type':'application/json'}, body:'{}',
  })
  assert.equal(await session.json(),false)
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
    console.log('Live Pages desk, member media readback, upload/cleanup preflights and closed-by-default access verified.')
    break
  } catch (e) {
    if (i < 3) { await delay(5000); continue }
    // Surface only the failed phase/status, never a response body or credentials.
    const status = e instanceof HttpFailure ? e.message : ''
    console.error(`::error title=Published desk check::Failed: ${phase}${status ? ' (' + status + ')' : ''}`)
    process.exitCode = 1
    break
  }
}
