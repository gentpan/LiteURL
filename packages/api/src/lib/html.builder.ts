import type { AliasRecord } from 'models'
import { PHRASES, type Locale } from './i18n'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

function metaBlock(rec: AliasRecord, base: string) {
  const host = rec.url ? new URL(rec.url).hostname : ''
  const title = rec.pageTitle || host || 'Link'
  const hasImg = !!rec.previewImg
  const img = hasImg && rec.previewImg!.startsWith('/') ? `${base}${rec.previewImg}` : rec.previewImg
  const card = hasImg ? 'summary_large_image' : 'summary'
  const tags = [
    rec.pageDesc ? `<meta name="description" content="${esc(rec.pageDesc)}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${esc(base)}/${esc(rec.alias)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    rec.pageDesc ? `<meta property="og:description" content="${esc(rec.pageDesc)}">` : '',
    hasImg ? `<meta property="og:image" content="${esc(img!)}">` : '',
    `<meta name="twitter:card" content="${card}">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    rec.pageDesc ? `<meta name="twitter:description" content="${esc(rec.pageDesc)}">` : '',
    hasImg ? `<meta name="twitter:image" content="${esc(img!)}">` : '',
  ].filter(Boolean).join('\n    ')
  return { title, tags }
}

const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-downloads allow-modals'

export function buildCloakPage(rec: AliasRecord, target: string, base: string): string {
  const { title, tags } = metaBlock(rec, base)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>${tags}</head><body style="margin:0;overflow:hidden"><iframe src="${esc(target)}" style="width:100%;height:100%;border:none" sandbox="${SANDBOX}" allowfullscreen referrerpolicy="no-referrer"></iframe><noscript><meta http-equiv="refresh" content="0;url=${esc(target)}"></noscript></body></html>`
}

export function buildPasswordPage(slug: string, opts: { error?: boolean, locale?: Locale } = {}): string {
  const { error = false, locale = 'en-US' } = opts
  const t = PHRASES[locale] || PHRASES[FALLBACK]
  return `<!DOCTYPE html><html lang="${esc(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t.pwdTitle)}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}.card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2rem;width:100%;max-width:360px;margin:1rem}h1{font-size:1.125rem;font-weight:600;margin-bottom:1.5rem;text-align:center}.err{color:#ef4444;font-size:.875rem;margin-bottom:1rem;text-align:center}label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}input[type=password]{width:100%;padding:.5rem .75rem;background:#09090b;border:1px solid #27272a;border-radius:6px;font-size:.875rem;outline:none;color:#fafafa;margin-bottom:1rem}input:focus{border-color:#52525b}button{width:100%;padding:.5rem;background:#fafafa;color:#18181b;border:none;border-radius:6px;font-size:.875rem;font-weight:500;cursor:pointer}button:hover{background:#e4e4e7}</style></head><body><div class="card"><h1>${esc(t.pwdTitle)}</h1>${error ? `<p class="err">${esc(t.pwdError)}</p>` : ''}<form method="POST" action="/${esc(slug)}"><label>${esc(t.pwdLabel)}</label><input type="password" name="password" required autofocus placeholder="${esc(t.pwdPlaceholder)}"><button type="submit">${esc(t.proceed)}</button></form></div></body></html>`
}

export function buildWarnPage(slug: string, target: string, opts: { secret?: string, locale?: Locale } = {}): string {
  const { secret, locale = 'en-US' } = opts
  const t = PHRASES[locale] || PHRASES[FALLBACK]
  return `<!DOCTYPE html><html lang="${esc(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t.warnTitle)}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#fafafa}.card{background:#0a0a0a;border:1px solid #27272a;border-radius:8px;padding:2rem;width:100%;max-width:420px;margin:1rem}h1{font-size:1.125rem;font-weight:600;color:#ef4444;margin-bottom:1rem;text-align:center}.desc{font-size:.875rem;color:#a1a1aa;margin-bottom:1rem;line-height:1.5;text-align:center}.url{font-size:.8125rem;color:#a1a1aa;background:#18181b;border:1px solid #27272a;border-radius:6px;padding:.5rem .75rem;word-break:break-all;margin-bottom:1.5rem}.actions{display:flex;gap:.75rem}.btn{flex:1;padding:.5rem;border-radius:6px;font-size:.875rem;font-weight:500;cursor:pointer;text-align:center;text-decoration:none;border:none}.btn-back{border:1px solid #27272a;background:#18181b;color:#fafafa}.btn-go{background:#fafafa;color:#18181b}</style></head><body><div class="card"><h1>${esc(t.warnTitle)}</h1><p class="desc">${esc(t.warnDesc)}</p><div class="url">${esc(target)}</div><div class="actions"><a href="javascript:history.back()" class="btn btn-back">${esc(t.retreat)}</a><form method="POST" action="/${esc(slug)}" style="flex:1;display:flex"><input type="hidden" name="confirm" value="true">${secret ? `<input type="hidden" name="password" value="${esc(secret)}">` : ''}<button type="submit" class="btn btn-go" style="width:100%">${esc(t.proceed)}</button></form></div></div></body></html>`
}

export function buildOgPage(rec: AliasRecord, target: string, base: string): string {
  const { title, tags } = metaBlock(rec, base)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title>${tags}<meta http-equiv="refresh" content="1;url=${esc(target)}"></head><body><p>Redirecting to <a href="${esc(target)}">${esc(target)}</a>...</p></body></html>`
}
