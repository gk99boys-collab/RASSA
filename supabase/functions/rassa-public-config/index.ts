// This endpoint serves ONLY a browser-safe key, just as a configured Vite build would.
// It never receives the desk link/PIN, reads database rows, or uses a privileged client.
Deno.serve((request: Request) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'X-Content-Type-Options': 'nosniff' }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
  if (request.method !== 'GET') return new Response(null, { status: 405, headers })
  try {
    const key = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.role !== 'anon') throw new Error('Not a public key')
    return Response.json({ anonKey: key }, { headers: { ...headers, 'Cache-Control': 'public, max-age=600' } })
  } catch { return new Response(null, { status: 503, headers }) }
})
