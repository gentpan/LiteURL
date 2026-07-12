import { CREDENTIAL_HASH_PREFIX, isHashed, isMasked, CREDENTIAL_MASK } from 'models'

const ITERATIONS = 10_000
const SALT_LEN = 16
const HASH_BITS = 256

interface Stored { iterations: number, salt: Uint8Array, hash: Uint8Array }

function toB64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromB64url(v: string): Uint8Array {
  const b64 = v.replaceAll('-', '+').replaceAll('_', '/')
  const pad = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=')
  return Uint8Array.from(atob(pad), c => c.charCodeAt(0))
}

function encode(v: string): Uint8Array { return new TextEncoder().encode(v) }

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', toArrayBuffer(encode(password)), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: toArrayBuffer(salt), iterations }, key, HASH_BITS)
  return new Uint8Array(bits)
}

function parse(stored: string): Stored | undefined {
  const prefix = stored.startsWith(CREDENTIAL_HASH_PREFIX)
    ? CREDENTIAL_HASH_PREFIX
    : stored.startsWith('sink-pwd:v1:') ? 'sink-pwd:v1:' : null
  if (!prefix) return undefined
  const [it, salt, hash] = stored.slice(prefix.length).split(':')
  const iterations = Number(it)
  if (!Number.isSafeInteger(iterations) || iterations < 1 || !salt || !hash) return undefined
  try { return { iterations, salt: fromB64url(salt), hash: fromB64url(hash) } }
  catch { return undefined }
}

export async function sealCredential(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const hash = await derive(password, salt, ITERATIONS)
  const tail = toB64url(encode([...password].slice(-3).join('')))
  return `${CREDENTIAL_HASH_PREFIX}${ITERATIONS}:${toB64url(salt)}:${toB64url(hash)}:${tail}`
}

export async function ensureSealed(value: string): Promise<string> {
  if (isMasked(value)) throw new Error('masked value cannot be stored')
  if (parse(value)) return value
  return await sealCredential(value)
}

export async function verifyCredential(input: string, stored: string): Promise<boolean> {
  const parsed = parse(stored)
  if (!parsed) return input === stored
  const h = await derive(input, parsed.salt, parsed.iterations)
  return h.length === parsed.hash.length && h.every((b, i) => b === parsed.hash[i])
}

export function sanitizeSecret<T extends { secret?: string } | null>(rec: T): T {
  if (!rec?.secret) return rec
  return { ...rec, secret: `${CREDENTIAL_MASK}···${rec.secret.slice(-3)}` }
}

export function sanitizeSecrets<T extends { secret?: string } | null>(list: T[]): T[] {
  return list.map(sanitizeSecret)
}

export async function forExport(rec: { secret?: string }): Promise<typeof rec> {
  if (!rec.secret) return rec
  return { ...rec, secret: await ensureSealed(rec.secret) }
}
