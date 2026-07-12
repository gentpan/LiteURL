import { getEnv } from '../core/config'

export async function isSafeDestination(url: string): Promise<boolean> {
  const env = getEnv()
  if (!env.safeCheckDoh) return true

  try {
    const { hostname } = new URL(url)
    const endpoint = new URL(env.safeCheckDoh)
    endpoint.searchParams.set('type', 'A')
    endpoint.searchParams.set('name', hostname)

    const res = await fetch(endpoint.toString(), { headers: { accept: 'application/dns-json' } })
    if (res.ok) {
      const data = await res.json() as { Answer?: Array<{ data: string }> }
      if (data?.Answer?.some(a => a.data === '0.0.0.0')) return false
    }
  } catch { /* ok */ }

  return true
}
