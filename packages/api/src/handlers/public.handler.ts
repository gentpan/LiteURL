import type { Context } from 'hono'
import { AliasRecord, makeAlias, ALIAS_CHARS } from 'models'
import { upsertRecord, fetchRecord, normalizeAlias } from '../db/repositories/alias.repo'
import { isSafeDestination } from '../services/url.guard'
import { getEnv } from '../core/config'
import { z } from 'zod'

const PublicInput = z.object({
  url: z.string().trim().url().max(2048),
  alias: z.string().trim().max(2048).regex(ALIAS_CHARS).optional(),
})

export async function createPublicAlias(c: Context) {
  const parsed = PublicInput.safeParse(await c.req.json().catch(() => ({})))
  if (!parsed.success) return c.json({ error: 'Invalid input', detail: parsed.error.flatten() }, 400)

  const { url, alias } = parsed.data
  const finalAlias = normalizeAlias(alias || makeAlias(getEnv().aliasLen))

  if (fetchRecord(finalAlias)) {
    if (alias) return c.json({ error: 'Alias already exists' }, 409)
    // 随机别名冲突时重新生成一个
    return createPublicAlias(c)
  }

  const rec: AliasRecord = {
    id: makeAlias(10),
    url,
    alias: finalAlias,
    created: Math.floor(Date.now() / 1000),
    updated: Math.floor(Date.now() / 1000),
    flagged: !(await isSafeDestination(url)),
  }

  upsertRecord(rec)
  const host = c.req.header('host') || 'localhost'
  const proto = host.includes('localhost') ? 'http' : 'https'
  return c.json({ alias: rec.alias, shortUrl: `${proto}://${host}/${rec.alias}`, url: rec.url }, 201)
}
