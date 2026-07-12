import type { Context, Next } from 'hono'

interface Bucket { count: number, reset: number }
const buckets = new Map<string, Bucket>()
const WINDOW = 60_000
const LIMIT = 20

export async function rateLimit(c: Context, next: Next) {
  const key = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + WINDOW })
    return next()
  }
  b.count++
  if (b.count > LIMIT) {
    return c.json({ error: 'Too many requests, try again later' }, 429)
  }
  return next()
}
