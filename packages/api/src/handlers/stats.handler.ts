import type { Context } from 'hono'
import { StatsFilter, toCsv, stampFilename } from 'models'
import { buildFilter, buildTimeFilter, BLOBS_MAP } from '../lib/filter.builder'
import { queryCounters, queryMetric, queryTimeSeries, queryHeatmap, queryEvents, queryGeoPoints, exportStatsCsv } from '../db/repositories/click.repo'

const COL_MAP: Record<string, string> = {
  alias: 'slug', url: 'url', referrer: 'referer', country: 'country', region: 'region',
  city: 'city', tz: 'timezone', lang: 'language', os: 'os', agent: 'browser',
  agentKind: 'browser_type', device: 'device', deviceKind: 'device_type',
}

export async function getCounters(c: Context) {
  const parsed = StatsFilter.safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryCounters(f, t))
}

export async function getMetrics(c: Context) {
  const parsed = StatsFilter.extend({ type: z.string() }).safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const col = COL_MAP[parsed.data.type] || parsed.data.type
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryMetric(col, f, t, parsed.data.limit))
}

import { z } from 'zod'

export async function getViews(c: Context) {
  const parsed = StatsFilter.extend({ unit: z.enum(['minute', 'hour', 'day']).default('hour') }).safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryTimeSeries(parsed.data.unit, f, t))
}

export async function getHeatmap(c: Context) {
  const parsed = StatsFilter.safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryHeatmap(f, t))
}

export async function getEvents(c: Context) {
  const parsed = StatsFilter.safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryEvents(f, t))
}

export async function getGeo(c: Context) {
  const parsed = StatsFilter.safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  return c.json(queryGeoPoints(f, t))
}

export async function exportCsv(c: Context) {
  const parsed = StatsFilter.safeParse(c.req.query())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const f = buildFilter(parsed.data)
  const t = buildTimeFilter(parsed.data)
  const rows = exportStatsCsv(f, t) as any[]
  const cols = ['slug', 'url', 'viewer', 'views', 'referer']
  const csv = toCsv(cols, rows.map(r => cols.map(c => r[c])))
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${stampFilename('liteurl-stats', 'csv')}"`,
      'Cache-Control': 'no-store',
    },
  })
}
