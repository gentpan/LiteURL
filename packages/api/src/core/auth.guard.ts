import type { Context, Next } from 'hono'
import { timingSafeEqual } from 'node:crypto'
import { getEnv } from '../core/config'

export async function guard(c: Context, next: Next) {
  if (!c.req.path.startsWith('/api/')) return next()

  const token = c.req.header('Authorization')?.replace(/^Bearer\s+/, '')
  if (token && await matchToken(token, getEnv().secret)) {
    c.set('authMode', 'bearer-token')
    return next()
  }

  if (token && token.length < 8) return c.json({ error: 'Token is too short' }, 401)
  return c.json({ error: 'Unauthorized' }, 401)
}

async function matchToken(provided: string | undefined, expected: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(provided || '')),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ])
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
