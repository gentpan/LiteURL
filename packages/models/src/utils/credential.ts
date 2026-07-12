export const CREDENTIAL_HASH_PREFIX = 'vault:v1:'
export const LEGACY_CREDENTIAL_HASH_PREFIX = 'sink-pwd:v1:'
export const CREDENTIAL_MASK = '__VAULT__'

export function isMasked(value: string): boolean {
  return value.startsWith(CREDENTIAL_MASK)
}

export function isHashed(value: string): boolean {
  return value.startsWith(CREDENTIAL_HASH_PREFIX) || value.startsWith(LEGACY_CREDENTIAL_HASH_PREFIX)
}

function b64urlDecode(value: string): string | undefined {
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch { return undefined }
}

export function credentialTail(value: string): string {
  const prefix = value.startsWith(CREDENTIAL_HASH_PREFIX)
    ? CREDENTIAL_HASH_PREFIX
    : value.startsWith(LEGACY_CREDENTIAL_HASH_PREFIX)
      ? LEGACY_CREDENTIAL_HASH_PREFIX
      : null
  if (!prefix) return [...value].slice(-3).join('')
  const parts = value.slice(prefix.length).split(':')
  const tail = parts[3]
  return tail ? b64urlDecode(tail) ?? '' : ''
}

export function maskCredential(value: string): string {
  return `${CREDENTIAL_MASK}···${credentialTail(value)}`
}
