import type { Context } from 'hono'

export function verifySession(c: Context) {
  return c.json({
    brand: 'LiteURL',
    homepage: 'https://liteurl.app',
    method: c.get('authMode'),
    features: { ai: !!process.env.AI_API_KEY },
  })
}
