import fs from 'node:fs'
import path from 'node:path'
import { getEnv } from '../core/config'

export function storeFile(key: string, buf: ArrayBuffer): string {
  const env = getEnv()
  const full = path.join(env.dataRoot, key)
  const dir = path.dirname(full)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(full, Buffer.from(buf))
  return `/_assets/${key}`
}

export function loadFile(key: string): Buffer | null {
  const env = getEnv()
  const full = path.join(env.dataRoot, key)
  return fs.existsSync(full) ? fs.readFileSync(full) : null
}

export function filePresent(key: string): boolean {
  return fs.existsSync(path.join(getEnv().dataRoot, key))
}
