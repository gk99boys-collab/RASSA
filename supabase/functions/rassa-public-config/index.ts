// Only the browser-safe key is public. Never accept owner credentials or use a privileged client here.
Deno.serve(request => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'X-Content-Type-Options': 'nosniff', 'Content-Type': 'application/json' }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'GET') return new Response(null, { status: 405, headers })
  try {
    const key = Deno.env.get('RASSA_BROWSER_ANON') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (claims.role !== 'anon' || claims.ref !== 'gshcslntlndqfzudxhub') throw new Error('Invalid browser key')
    return new Response(JSON.stringify({ anonKey: key }), { headers: { ...headers, 'Cache-Control': 'public, max-age=600' } })
  } catch { return new Response('{"code":"PUBLIC_CONFIG_UNAVAILABLE"}', { status: 503, headers }) }
})
