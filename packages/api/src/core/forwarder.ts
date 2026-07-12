import type { Context } from 'hono'
import type { AliasRecord } from 'models'
import { getEnv } from '../core/config'
import { fetchRecord, normalizeAlias } from '../db/repositories/alias.repo'
import { logClick } from '../db/repositories/click.repo'
import { verifyCredential } from '../services/vault'
import { detectLocale } from '../lib/i18n'
import { buildPasswordPage, buildWarnPage, buildOgPage, buildCloakPage } from '../lib/html.builder'

const SOCIAL_AGENTS = ['applebot','discordbot','facebot','facebookexternalhit','linkedinbot','linkexpanding','mastodon','skypeuripreview','slackbot','slackbot-linkexpanding','snapchat','telegrambot','tiktok','twitterbot','whatsapp']
const IOS_MARKERS = ['iphone','ipad','ipod','crios']

function isSocial(userAgent: string): boolean {
  const u = userAgent.toLowerCase()
  return SOCIAL_AGENTS.some(a => u.includes(a))
}

function deviceRedirect(ua: string, rec: AliasRecord): string | null {
  if (!rec.iosDeepLink && !rec.androidDeepLink) return null
  const u = ua.toLowerCase()
  if (rec.androidDeepLink && u.includes('android')) return rec.androidDeepLink
  if (rec.iosDeepLink && IOS_MARKERS.some(m => u.includes(m))) return rec.iosDeepLink
  return null
}

export async function resolve(c: any): Promise<Response | void> {
  const env = getEnv()
  const raw = c.req.path.replace(/^\/|\/$/g, '')
  const alias = raw.split('/')[0] || ''

  if (raw === '' && env.landingTarget) return c.redirect(env.landingTarget, 302)
  if (!alias || !/^[a-zA-Z0-9_-]+$/.test(alias)) return

  const rec = fetchRecord(normalizeAlias(alias))
  if (!rec) {
    if (env.fallbackPage) return c.redirect(env.fallbackPage, 302)
    return c.notFound()
  }

  const ua = c.req.header('user-agent') || ''
  let target = rec.url
  if (rec.forwardQuery ?? env.passQuery) {
    const qi = c.req.url.indexOf('?')
    if (qi >= 0) target += c.req.url.slice(qi)
  }

  const devUrl = deviceRedirect(ua, rec)
  const final = devUrl ?? target
  const locale = detectLocale(c.req.header('accept-language'))
  const html = (h: string) => new Response(h, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })

  // Password gate
  if (rec.secret) {
    if (c.req.method === 'POST') {
      const body = await c.req.parseBody()
      if (!await verifyCredential(String(body?.password || ''), rec.secret)) return html(buildPasswordPage(alias, { error: true, locale }))
      if (rec.flagged && body?.confirm !== 'true') return html(buildWarnPage(alias, final, { secret: String(body?.password || ''), locale }))
    } else {
      const hdr = c.req.header('x-link-password')
      if (hdr) {
        if (!await verifyCredential(hdr, rec.secret)) return c.json({ error: 'Incorrect password' }, 403)
        if (rec.flagged && c.req.header('x-link-confirm') !== 'true') return c.json({ error: 'Confirmation required' }, 403)
      } else {
        return html(buildPasswordPage(alias, { locale }))
      }
    }
  }

  // Unsafe gate
  if (!rec.secret && rec.flagged) {
    if (c.req.method === 'POST') {
      const body = await c.req.parseBody()
      if (body?.confirm !== 'true') return html(buildWarnPage(alias, final, { locale }))
    } else {
      return html(buildWarnPage(alias, final, { locale }))
    }
  }

  // Log click
  const logData = { ua, ip: c.req.header('x-forwarded-for')?.split(',')[0] || '', referer: c.req.header('referer') || '', language: (c.req.header('accept-language') || '').split(',')[0] || '' }
  try { logClick(rec.id, rec.alias, rec.url, logData) } catch { /* ok */ }

  // Device redirect
  if (devUrl) {
    const h: Record<string, string> = env.noCache ? { 'Cache-Control': 'no-store' } : {}
    return c.redirect(final, env.fwdCode as 301|302|303|307|308)
  }

  // Social bot OG
  if (isSocial(ua) && (rec.pageTitle || rec.previewImg)) {
    const base = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host') || 'localhost'}`
    return html(buildOgPage(rec, target, base))
  }

  // Cloaking
  if (rec.maskDestination) {
    const base = `${c.req.header('x-forwarded-proto') || 'http'}://${c.req.header('host') || 'localhost'}`
    return new Response(buildCloakPage(rec, target, base), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, private' },
    })
  }

  const h: Record<string, string> = env.noCache ? { 'Cache-Control': 'no-store' } : {}
  return c.redirect(final, env.fwdCode as 301|302|303|307|308)
}
