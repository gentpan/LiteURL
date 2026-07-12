import { getEnv } from '../core/config'

export async function askAi(messages: Array<{ role: string, content: string }>): Promise<string> {
  const env = getEnv()
  if (!env.aiKey) throw new Error('AI not configured')

  const res = await fetch(`${env.aiEndpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.aiKey}` },
    body: JSON.stringify({ model: env.aiModel, messages }),
  })
  if (!res.ok) throw new Error(`AI error: ${res.status}`)
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}

export function stripFences(s: string): string {
  const t = s.trim()
  if (!t.startsWith('```') || !t.endsWith('```')) return t
  const lines = t.split('\n')
  lines.shift()
  lines.pop()
  return lines.join('\n').trim()
}

export async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'text/html, text/markdown' }, signal: AbortSignal.timeout(5000) })
    const ct = res.headers.get('content-type') || ''
    const body = await res.text()
    if (!body) return null
    if (ct.includes('text/markdown')) return body.slice(0, 4096)
    if (ct.includes('text/html')) {
      return body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ').trim().slice(0, 4096)
    }
  } catch { /* ok */ }
  return null
}
