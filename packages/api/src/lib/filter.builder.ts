import type { StatsFilter } from 'models'

export const BLOBS_MAP: Record<string, string> = {
  alias: 'slug', url: 'url', referrer: 'referer', country: 'country',
  region: 'region', city: 'city', tz: 'timezone', lang: 'language',
  os: 'os', agent: 'browser', agentKind: 'browser_type',
  device: 'device', deviceKind: 'device_type',
}

export function buildFilter(q: StatsFilter, prefix = ''): { sql: string, params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (q.id) {
    const ids = q.id.split(',').filter(Boolean)
    clauses.push(`${prefix}link_id IN (${ids.map(() => '?').join(',')})`)
    params.push(...ids)
  }

  for (const [key, col] of Object.entries(BLOBS_MAP)) {
    const val = (q as any)[key]
    if (typeof val === 'string' && val) {
      const vals = val.split(',').filter(Boolean)
      if (vals.length) {
        clauses.push(`${prefix}${col} IN (${vals.map(() => '?').join(',')})`)
        params.push(...vals)
      }
    }
  }

  return { sql: clauses.length ? clauses.join(' AND ') : '1=1', params }
}

export function buildTimeFilter(q: StatsFilter): { sql: string, params: unknown[] } {
  const clauses: string[] = []
  const params: unknown[] = []

  if (q.from) { clauses.push('created_at >= ?'); params.push(Math.floor(Number(q.from))) }
  if (q.to) { clauses.push('created_at <= ?'); params.push(Math.floor(Number(q.to))) }

  return { sql: clauses.length ? clauses.join(' AND ') : '1=1', params }
}
