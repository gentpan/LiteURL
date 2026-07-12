import { connect } from '../db/connection'
import type { AliasRecord } from 'models'
import fs from 'node:fs'
import path from 'node:path'
import { getEnv } from '../core/config'

export function runBackup(): { file: string, count: number } {
  const rows = connect().prepare('SELECT * FROM links ORDER BY created_at DESC').all() as Record<string, unknown>[]
  const records: AliasRecord[] = rows.map(r => ({
    id: r.id as string, url: r.url as string, alias: r.slug as string,
    remark: r.comment as string | undefined, created: r.created_at as number,
    updated: r.updated_at as number, expires: r.expiration as number | undefined,
    pageTitle: r.title as string | undefined, pageDesc: r.description as string | undefined,
    previewImg: r.image as string | undefined, iosDeepLink: r.apple as string | undefined,
    androidDeepLink: r.google as string | undefined, maskDestination: r.cloaking ? true : undefined,
    forwardQuery: r.redirect_with_query ? true : undefined, secret: r.password as string | undefined,
    flagged: r.unsafe ? true : undefined,
    geoRules: r.geo ? JSON.parse(r.geo as string) : undefined,
  }))

  const env = getEnv()
  const now = new Date()
  const file = `backups/snapshot-${now.toISOString().replace(/:/g, '-')}.json`
  const full = path.join(env.dataRoot, file)
  const dir = path.dirname(full)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(full, JSON.stringify({ version: '1.0', exportedAt: now.toISOString(), count: records.length, records }, null, 2))

  console.info(`[vault] Backup written: ${file} (${records.length} records)`)
  return { file, count: records.length }
}
