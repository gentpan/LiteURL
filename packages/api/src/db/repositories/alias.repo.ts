import type { AliasRecord } from 'models'
import { connect } from '../connection'
import { getEnv } from '../../core/config'

function rowToRecord(row: Record<string, unknown>): AliasRecord {
  return {
    id: row.id as string,
    url: row.url as string,
    alias: row.slug as string,
    remark: row.comment === null ? undefined : row.comment as string,
    created: row.created_at as number,
    updated: row.updated_at as number,
    expires: row.expiration === null ? undefined : row.expiration as number,
    pageTitle: row.title === null ? undefined : row.title as string,
    pageDesc: row.description === null ? undefined : row.description as string,
    previewImg: row.image === null ? undefined : row.image as string,
    iosDeepLink: row.apple === null ? undefined : row.apple as string,
    androidDeepLink: row.google === null ? undefined : row.google as string,
    maskDestination: row.cloaking ? true : undefined,
    forwardQuery: row.redirect_with_query ? true : undefined,
    secret: row.password === null ? undefined : row.password as string,
    flagged: row.unsafe ? true : undefined,
    geoRules: row.geo ? JSON.parse(row.geo as string) : undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : undefined,
  }
}

function recordToRow(r: AliasRecord) {
  return {
    id: r.id,
    url: r.url,
    slug: r.alias,
    comment: r.remark ?? null,
    createdAt: r.created,
    updatedAt: r.updated,
    expiration: r.expires ?? null,
    title: r.pageTitle ?? null,
    description: r.pageDesc ?? null,
    image: r.previewImg ?? null,
    apple: r.iosDeepLink ?? null,
    google: r.androidDeepLink ?? null,
    cloaking: r.maskDestination ? 1 : 0,
    redirectWithQuery: r.forwardQuery ? 1 : 0,
    password: r.secret ?? null,
    unsafe: r.flagged ? 1 : 0,
    geo: r.geoRules ? JSON.stringify(r.geoRules) : null,
    tags: r.tags && r.tags.length ? JSON.stringify(r.tags) : null,
  }
}

export function normalizeAlias(value: string): string {
  return getEnv().caseFold ? value : value.toLowerCase()
}

export function upsertRecord(r: AliasRecord): void {
  connect().prepare(`
    INSERT INTO links (id, url, slug, comment, created_at, updated_at, expiration, title, description, image, apple, google, cloaking, redirect_with_query, password, unsafe, geo, tags)
    VALUES (@id, @url, @slug, @comment, @createdAt, @updatedAt, @expiration, @title, @description, @image, @apple, @google, @cloaking, @redirectWithQuery, @password, @unsafe, @geo, @tags)
    ON CONFLICT(slug) DO UPDATE SET
      url = @url, comment = @comment, updated_at = @updatedAt, expiration = @expiration,
      title = @title, description = @description, image = @image, apple = @apple, google = @google,
      cloaking = @cloaking, redirect_with_query = @redirectWithQuery, password = @password,
      unsafe = @unsafe, geo = @geo, tags = @tags
  `).run(recordToRow(r))
}

export function fetchRecord(slug: string): AliasRecord | null {
  const row = connect().prepare('SELECT * FROM links WHERE slug = ?').get(slug) as Record<string, unknown> | undefined
  if (!row) return null
  const rec = rowToRecord(row)
  if (rec.expires && rec.expires < Math.floor(Date.now() / 1000)) return null
  return rec
}

export function removeRecord(slug: string): void {
  connect().prepare('DELETE FROM links WHERE slug = ?').run(slug)
}

export function removeMany(slugs: string[]): number {
  if (!slugs.length) return 0
  const db = connect()
  const stmt = db.prepare('DELETE FROM links WHERE slug = ?')
  const tx = db.transaction((items: string[]) => {
    for (const s of items) stmt.run(s)
  })
  tx(slugs)
  return slugs.length
}

export type ScanOpts = { size: number, cursor?: string, q?: string, sort?: string, tag?: string }

export function scanAll(opts: ScanOpts) {
  const db = connect()
  const size = Math.min(opts.size, 1000)
  const offset = opts.cursor ? Number(opts.cursor) : 0

  const where: string[] = []
  const params: unknown[] = []
  if (opts.q) {
    where.push('(slug LIKE ? OR url LIKE ? OR comment LIKE ?)')
    const like = `%${opts.q}%`
    params.push(like, like, like)
  }
  if (opts.tag) {
    where.push('tags LIKE ?')
    params.push(`%"${opts.tag}"%`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

  let orderSql = 'created_at DESC'
  if (opts.sort === 'oldest') orderSql = 'created_at ASC'
  else if (opts.sort === 'az') orderSql = 'slug ASC'
  else if (opts.sort === 'za') orderSql = 'slug DESC'

  const rows = db.prepare(`
    SELECT l.*, (SELECT COUNT(*) FROM access_logs WHERE slug = l.slug) AS visits
    FROM links l ${whereSql}
    ORDER BY ${orderSql}
    LIMIT ? OFFSET ?
  `).all(...params, size + 1, offset) as Record<string, unknown>[]
  const hasMore = rows.length > size
  if (hasMore) rows.pop()

  return {
    records: rows.map(r => ({ ...rowToRecord(r), visits: (r.visits as number) || 0 })),
    complete: !hasMore,
    cursor: String(offset + (hasMore ? size : rows.length)),
  }
}

export function searchAll(): Array<{ alias: string, url: string, remark?: string }> {
  return connect().prepare('SELECT slug, url, comment FROM links ORDER BY created_at DESC')
    .all() as any[]
}

export function dumpAll(): AliasRecord[] {
  return (connect().prepare('SELECT * FROM links ORDER BY created_at DESC').all() as Record<string, unknown>[])
    .map(rowToRecord)
}
