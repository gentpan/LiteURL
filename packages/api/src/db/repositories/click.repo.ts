import { connect } from '../connection'
import { getEnv } from '../../core/config'
import type { StatsFilter } from 'models'
import { BLOBS_MAP } from '../../lib/filter.builder'

export function logClick(linkId: string, slug: string, url: string, data: Record<string, unknown>): void {
  const db = connect()
  const now = Math.floor(Date.now() / 1000)
  db.prepare(`
    INSERT INTO access_logs (link_id, slug, url, ua, ip, referer, country, region, city, timezone, language, os, browser, browser_type, device, device_type, latitude, longitude, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    linkId, slug, url, data.ua || '', data.ip || '', data.referer || '',
    data.country || '', data.region || '', data.city || '', data.timezone || '',
    data.language || '', data.os || '', data.browser || '', data.browserType || '',
    data.device || '', data.deviceType || '', data.latitude || 0, data.longitude || 0, now,
  )
}

export function queryCounters(filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT COUNT(*) as visits, COUNT(DISTINCT ip) as visitors, COUNT(DISTINCT referer) as referers FROM access_logs WHERE ${where}`
  ).get(...params)
}

export function queryMetric(col: string, filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }, limit: number) {
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT ${col} as name, COUNT(*) as count FROM access_logs WHERE ${where} GROUP BY name ORDER BY count DESC LIMIT ${limit}`
  ).all(...params)
}

export function queryTimeSeries(unit: string, filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const fmt = { minute: '%Y-%m-%d %H:%M', hour: '%Y-%m-%d %H', day: '%Y-%m-%d' }[unit] || '%Y-%m-%d %H'
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT strftime('${fmt}', created_at, 'unixepoch') as time, COUNT(*) as visits, COUNT(DISTINCT ip) as visitors FROM access_logs WHERE ${where} GROUP BY time ORDER BY time ASC`
  ).all(...params)
}

export function queryHeatmap(filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT CAST(strftime('%w', created_at, 'unixepoch') AS INTEGER) as weekday, CAST(strftime('%H', created_at, 'unixepoch') AS INTEGER) as hour, COUNT(*) as visits, COUNT(DISTINCT ip) as visitors FROM access_logs WHERE ${where} GROUP BY weekday, hour ORDER BY weekday, hour`
  ).all(...params)
}

export function queryEvents(filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  const rows = connect().prepare(`SELECT * FROM access_logs WHERE ${where} ORDER BY created_at DESC`).all(...params) as Record<string, unknown>[]
  return rows.map(r => ({
    slug: r.slug, url: r.url, referer: r.referer, country: r.country, region: r.region,
    city: r.city, timezone: r.timezone, language: r.language, os: r.os, browser: r.browser,
    agentKind: r.browser_type, device: r.device, deviceKind: r.device_type,
    lat: r.latitude, lng: r.longitude, id: crypto.randomUUID(), timestamp: r.created_at,
  }))
}

export function queryGeoPoints(filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const where = ['latitude != 0', 'longitude != 0', filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT city, latitude, longitude, COUNT(*) as count FROM access_logs WHERE ${where} GROUP BY city, latitude, longitude`
  ).all(...params)
}

export function exportStatsCsv(filter: { sql: string, params: unknown[] }, time: { sql: string, params: unknown[] }) {
  const where = [filter.sql, time.sql].filter(Boolean).join(' AND ')
  const params = [...filter.params, ...time.params]
  return connect().prepare(
    `SELECT slug, url, COUNT(DISTINCT ip) as viewer, COUNT(*) as views, COUNT(DISTINCT referer) as referer FROM access_logs WHERE ${where} GROUP BY slug, url ORDER BY views DESC`
  ).all(...params)
}
