let _token: string | null = localStorage.getItem('lu_session')

export function setSession(t: string) { _token = t; localStorage.setItem('lu_session', t) }
export function clearSession() { _token = null; localStorage.removeItem('lu_session') }
export function getSession(): string | null { return _token }

export async function api<T = any>(path: string, opts: Omit<RequestInit, 'body'> & { body?: any } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string>) }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const body = opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)
    ? JSON.stringify(opts.body) : opts.body as BodyInit | undefined

  const res = await fetch(`/api${path}`, { ...opts, body, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  const txt = await res.text()
  return txt ? JSON.parse(txt) : (null as T)
}
