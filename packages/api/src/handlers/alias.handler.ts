import type { Context } from 'hono'
import { AliasRecord, ALIAS_CHARS, makeAlias } from 'models'
import { upsertRecord, fetchRecord, removeRecord, scanAll, searchAll, normalizeAlias } from '../db/repositories/alias.repo'
import { sealCredential, sanitizeSecret, sanitizeSecrets, forExport } from '../services/vault'
import { isSafeDestination } from '../services/url.guard'
import { getEnv } from '../core/config'
import { z } from 'zod'

export async function createAlias(c: Context) {
  const parsed = AliasRecord.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const r = parsed.data
  r.alias = normalizeAlias(r.alias)
  if (r.flagged === undefined) r.flagged = !(await isSafeDestination(r.url))
  if (fetchRecord(r.alias)) return c.json({ error: 'Already exists' }, 409)
  if (r.secret) r.secret = await sealCredential(r.secret)

  upsertRecord(r)
  const host = c.req.header('host') || 'localhost'
  return c.json({ record: r, shortUrl: `${host.includes('localhost') ? 'http' : 'https'}://${host}/${r.alias}` }, 201)
}

export async function upsertAlias(c: Context) {
  const parsed = AliasRecord.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const r = parsed.data
  r.alias = normalizeAlias(r.alias)
  const existing = fetchRecord(r.alias)
  if (existing) return c.json({ status: 'existing', record: existing })

  if (r.secret) r.secret = await sealCredential(r.secret)
  upsertRecord(r)
  const host = c.req.header('host') || 'localhost'
  return c.json({ status: 'created', record: r, shortUrl: `${host.includes('localhost') ? 'http' : 'https'}://${host}/${r.alias}` }, 201)
}

export async function editAlias(c: Context) {
  const parsed = AliasRecord.extend({ secret: z.string().trim().max(128).optional() }).safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const r = parsed.data
  r.alias = normalizeAlias(r.alias)
  const existing = fetchRecord(r.alias)
  if (!existing) return c.json({ error: 'Not found' }, 404)

  if (r.url !== existing.url && r.flagged === undefined) r.flagged = !(await isSafeDestination(r.url))

  const merged = { ...existing, ...r, id: existing.id, created: existing.created, updated: Math.floor(Date.now() / 1000) }

  if (r.secret === '') delete merged.secret
  else if (r.secret) merged.secret = await sealCredential(r.secret)
  else if (merged.secret) merged.secret = await sealCredential(merged.secret)

  upsertRecord(merged)
  const host = c.req.header('host') || 'localhost'
  return c.json({ record: merged, shortUrl: `${host.includes('localhost') ? 'http' : 'https'}://${host}/${r.alias}` }, 201)
}

export async function removeAlias(c: Context) {
  const { alias } = await c.req.json()
  const s = z.string().trim().regex(ALIAS_CHARS).max(2048).min(1).safeParse(alias)
  if (!s.success) return c.json({ error: 'Invalid alias' }, 400)
  removeRecord(normalizeAlias(s.data))
  return c.body(null, 204)
}

export async function queryAlias(c: Context) {
  const slug = z.string().trim().min(1).max(2048).safeParse(c.req.query('alias'))
  if (!slug.success) return c.json({ error: 'Invalid alias' }, 400)
  const rec = fetchRecord(normalizeAlias(slug.data))
  if (!rec) return c.json({ error: 'Not found' }, 404)
  return c.json(sanitizeSecret(rec))
}

export async function listAliases(c: Context) {
  const size = z.coerce.number().max(1024).default(20).safeParse(c.req.query('size'))
  const cursor = c.req.query('cursor')
  const { records, complete, cursor: next } = scanAll({ size: size.success ? size.data : 20, cursor })
  return c.json({ records: sanitizeSecrets(records), complete, cursor: next })
}

export async function searchAliases(c: Context) {
  return c.json(searchAll())
}

export async function exportAliases(c: Context) {
  const cursor = c.req.query('cursor')
  const { records, complete, cursor: next } = scanAll({ size: 50, cursor })
  const protected_records = await Promise.all(records.map(forExport))
  return c.json({ version: '1.0', exportedAt: new Date().toISOString(), count: protected_records.length, records: protected_records, cursor: next, complete })
}

export async function importAliases(c: Context) {
  const ImportLink = z.object({
    id: z.string().trim().max(26).optional(),
    url: z.string().trim().url().max(2048),
    alias: z.string().trim().max(2048),
    remark: z.string().trim().max(2048).optional(),
    created: z.number().int().safe().optional(),
    updated: z.number().int().safe().optional(),
    expires: z.number().int().safe().optional(),
    pageTitle: z.string().trim().max(256).optional(),
    pageDesc: z.string().trim().max(2048).optional(),
    previewImg: z.string().trim().max(128).optional(),
    iosDeepLink: z.string().trim().url().max(2048).optional(),
    androidDeepLink: z.string().trim().url().max(2048).optional(),
    maskDestination: z.boolean().optional(),
    forwardQuery: z.boolean().optional(),
    secret: z.string().trim().optional(),
    flagged: z.boolean().optional(),
    geoRules: z.record(z.string(), z.string()).optional(),
  })
  const Schema = z.object({ records: z.array(ImportLink).min(1).max(500) })
  const body = Schema.safeParse(await c.req.json())
  if (!body.success) return c.json({ error: body.error.flatten() }, 400)

  const result = { ok: 0, skip: 0, fail: 0, okItems: [] as any[], skipItems: [] as any[], failItems: [] as any[] }

  for (let i = 0; i < body.data.records.length; i++) {
    const d = body.data.records[i]
    try {
      const slug = normalizeAlias(d.alias)
      if (fetchRecord(slug)) { result.skip++; result.skipItems.push({ i, alias: slug }); continue }
      const now = Math.floor(Date.now() / 1000)
      const rec = { ...d, id: d.id || makeAlias(10), alias: slug, created: d.created || now, updated: d.updated || now }
      if (rec.secret) rec.secret = await sealCredential(rec.secret)
      upsertRecord(rec as any)
      result.ok++; result.okItems.push({ i, alias: slug })
    } catch (e: any) {
      result.fail++; result.failItems.push({ i, alias: d.alias, reason: e.message || 'Unknown error' })
    }
  }
  return c.json(result)
}

export async function checkLinks(c: Context) {
  const { targets, timeout } = await c.req.json()
  const safeHeaders: Record<string, string> = {}
  const ua = c.req.header('user-agent')
  const al = c.req.header('accept-language')
  if (ua) safeHeaders['user-agent'] = ua
  if (al) safeHeaders['accept-language'] = al

  const outcomes = await Promise.all(targets.map(async (t: { alias: string, url: string }) => {
    const started = Date.now()
    const checkedAt = new Date().toISOString()
    const slug = normalizeAlias(t.alias)
    const rec = fetchRecord(slug)
    if (!rec) return { ...t, alias: slug, status: 0, ok: false, failure: 'Not found', latency: Date.now() - started, checkedAt }
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), (timeout || 6) * 1000)
      const res = await fetch(rec.url, { method: 'HEAD', headers: safeHeaders, signal: ctrl.signal })
      clearTimeout(timer)
      return { alias: slug, url: rec.url, status: res.status, ok: res.status < 400, latency: Date.now() - started, checkedAt }
    } catch (e: any) {
      return { alias: slug, url: rec.url, status: 0, ok: false, failure: e.message?.slice(0, 300) || 'Error', latency: Date.now() - started, checkedAt }
    }
  }))

  return c.json({ outcomes })
}

export async function backupNow(c: Context) {
  const { runBackup } = await import('../services/snapshot')
  const r = runBackup()
  return c.json({ success: true, ...r })
}

export async function geoLocation(c: Context) {
  return c.json({ lat: 0, lng: 0 })
}

export async function uploadMedia(c: Context) {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const alias = formData.get('alias') as string | null

  if (!file) return c.json({ error: 'File is required' }, 400)
  if (!alias) return c.json({ error: 'Alias is required' }, 400)

  const ALIASED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!ALIASED.includes(file.type)) return c.json({ error: 'Invalid type' }, 400)
  if (file.size > 5 * 1024 * 1024) return c.json({ error: 'Too large' }, 400)

  const ext = file.type.split('/')[1]
  const key = `images/${alias}/${makeAlias(10)}.${ext}`
  const { storeFile } = await import('../services/binary.store')
  const url = storeFile(key, await file.arrayBuffer())
  return c.json({ url, key })
}

export async function serveAsset(c: Context) {
  const key = c.req.param('path')
  if (!key?.startsWith('images/')) return c.json({ error: 'Denied' }, 403)
  const { loadFile } = await import('../services/binary.store')
  const buf = loadFile(key)
  if (!buf) return c.json({ error: 'Not found' }, 404)
  const ext = key.split('.').pop()?.toLowerCase() || ''
  const mime: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }
  return new Response(buf, { headers: { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
