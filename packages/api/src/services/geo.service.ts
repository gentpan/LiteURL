import { connect } from '../db/connection'
import { getEnv } from '../core/config'

export interface GeoData {
  country: string
  region: string
  city: string
  timezone: string
  latitude: number
  longitude: number
}

const cache = new Map<string, GeoData | null>()
const inflight = new Map<string, Promise<GeoData | null>>()

const PRIVATE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1|fe80:)/i

function applyGeo(ip: string, g: GeoData) {
  try {
    connect().prepare(
      `UPDATE access_logs SET country=?, region=?, city=?, timezone=?, latitude=?, longitude=? WHERE ip = ? AND country = ''`,
    ).run(g.country, g.region, g.city, g.timezone, g.latitude, g.longitude, ip)
  } catch { /* ignore */ }
}

export function enrichGeo(ip: string | undefined): void {
  if (!getEnv().geoOn || !ip || PRIVATE.test(ip)) return
  const cached = cache.get(ip)
  if (cached !== undefined) {
    if (cached) applyGeo(ip, cached)
    return
  }
  if (inflight.has(ip)) return
  const p = fetch(`https://api.cnip.io/geoip/${encodeURIComponent(ip)}`)
    .then(r => (r.ok ? r.json() : null))
    .then((d: any) => {
      const g: GeoData | null = d && d.country_code
        ? {
            country: String(d.country_code),
            region: String(d.region || ''),
            city: String(d.city || ''),
            timezone: String(d.timezone || ''),
            latitude: Number(d.latitude) || 0,
            longitude: Number(d.longitude) || 0,
          }
        : null
      cache.set(ip, g)
      if (g) applyGeo(ip, g)
      return g
    })
    .catch(() => { cache.set(ip, null); return null })
  inflight.set(ip, p)
  p.finally(() => inflight.delete(ip))
}

export function backfillGeo(): void {
  if (!getEnv().geoOn) return
  try {
    const rows = connect().prepare('SELECT DISTINCT ip FROM access_logs WHERE country = ? AND ip != ?').all('', '') as Array<{ ip: string }>
    for (const r of rows) enrichGeo(r.ip)
  } catch { /* ignore */ }
}
