import path from 'node:path'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getEnv } from './core/config'
import { connect } from './db/connection'
import { guard } from './core/auth.guard'
import { resolve } from './core/forwarder'
import { verifySession } from './handlers/session.handler'
import {
  createAlias, upsertAlias, editAlias, removeAlias,
  queryAlias, listAliases, searchAliases, exportAliases, importAliases,
  checkLinks, backupNow, geoLocation, uploadMedia, serveAsset,
} from './handlers/alias.handler'
import { getCounters, getMetrics, getViews, getHeatmap, getEvents, getGeo, exportCsv } from './handlers/stats.handler'

const app = new Hono()
const env = getEnv()

connect()

if (env.corsOn) app.use('*', cors())

app.get('/_assets/*', serveAsset)
app.use('/api/*', guard)

// Session
app.get('/api/verify', verifySession)

// Aliases CRUD
app.post('/api/link/create', createAlias)
app.post('/api/link/upsert', upsertAlias)
app.put('/api/link/edit', editAlias)
app.post('/api/link/delete', removeAlias)
app.get('/api/link/query', queryAlias)
app.get('/api/link/list', listAliases)
app.get('/api/link/search', searchAliases)
app.get('/api/link/export', exportAliases)
app.post('/api/link/import', importAliases)
app.post('/api/link/check', checkLinks)

// Analytics
app.get('/api/stats/counters', getCounters)
app.get('/api/stats/metrics', getMetrics)
app.get('/api/stats/views', getViews)
app.get('/api/stats/heatmap', getHeatmap)
app.get('/api/stats/export', exportCsv)

// Logs
app.get('/api/logs/events', getEvents)
app.get('/api/logs/locations', getGeo)

// System
app.post('/api/backup', backupNow)
app.get('/api/location', geoLocation)
app.post('/api/upload/image', uploadMedia)

// SPA fallback - serve index.html for non-API, non-redirect routes
const SPA_DIR = path.resolve(import.meta.dirname ?? __dirname, '../../web/dist')
const SPA_INDEX = path.join(SPA_DIR, 'index.html')
const fs = await import('node:fs')

app.get('/*', async (c) => {
  const accept = c.req.header('accept') || ''

  // If HTML request, try SPA first for known SPA paths
  if (accept.includes('text/html')) {
    const raw = c.req.path.replace(/^\/|\/$/g, '')
    const isDashboard = raw.startsWith('dashboard') || raw === ''
    if (isDashboard) {
      const html = fs.readFileSync(SPA_INDEX, 'utf-8')
      return c.html(html)
    }
  }

  // Try short link
  const result = await resolve(c)
  if (result) return result

  // SPA fallback for HTML
  if (accept.includes('text/html')) {
    const html = fs.readFileSync(SPA_INDEX, 'utf-8')
    return c.html(html)
  }

  return c.notFound()
})

// Non-GET catch-all (POST, PUT, etc. for redirects)
app.all('/*', async (c) => {
  const result = await resolve(c)
  if (result) return result
  return c.notFound()
})

console.info(`[LiteURL] Running on port ${env.port}`)
serve({ fetch: app.fetch, port: env.port })
