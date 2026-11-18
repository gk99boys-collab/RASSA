// Inert offline fixture. Works only with the test browser's intercepted API.
export const publicConfig = { anonKey: `offline.${Buffer.from('{"role":"anon"}').toString('base64url')}.fixture` }
