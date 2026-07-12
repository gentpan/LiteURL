import { customAlphabet } from 'nanoid'
import { z } from 'zod'
import { CREDENTIAL_MASK } from '../utils/credential'

export const ALIAS_CHARS = /^[a-zA-Z0-9_-]+$/
export const DEFAULT_ALIAS_LEN = 6

export const makeAlias = (len: number = DEFAULT_ALIAS_LEN) =>
  customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', len)()

const GeoMap = z.preprocess((v) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).map(([k, u]) => [k.trim().toUpperCase(), u]),
  )
}, z.record(z.string().trim().regex(/^[A-Z]{2}$/), z.string().trim().url().max(2048)))

export const SecretField = z.string().trim().min(1).max(128).refine(
  s => !s.startsWith(CREDENTIAL_MASK),
  'masked value cannot be submitted',
)

export const OptionalSecret = z.string().trim().max(128).refine(
  s => !s.startsWith(CREDENTIAL_MASK),
  'masked value cannot be submitted',
).optional()

export const AliasRecord = z.object({
  id: z.string().trim().max(26).default(() => makeAlias(10)),
  url: z.string().trim().url().max(2048),
  alias: z.string().trim().max(2048).regex(ALIAS_CHARS).default(() => makeAlias()),
  remark: z.string().trim().max(2048).optional(),
  created: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  updated: z.number().int().safe().default(() => Math.floor(Date.now() / 1000)),
  expires: z.number().int().safe().refine(t => t > Math.floor(Date.now() / 1000), {
    message: 'expiration must be greater than current time',
    path: ['expires'],
  }).optional(),
  pageTitle: z.string().trim().max(256).optional(),
  pageDesc: z.string().trim().max(2048).optional(),
  previewImg: z.string().trim().max(128).optional(),
  iosDeepLink: z.string().trim().url().max(2048).optional(),
  androidDeepLink: z.string().trim().url().max(2048).optional(),
  maskDestination: z.boolean().optional(),
  forwardQuery: z.boolean().optional(),
  secret: SecretField.optional(),
  flagged: z.boolean().optional(),
  geoRules: GeoMap.optional(),
  tags: z.array(z.string().trim().max(40).regex(/^[^,]+$/)).max(30).optional(),
})

export type AliasRecord = z.infer<typeof AliasRecord>

export interface ExportBundle {
  version: string
  exportedAt: string
  count: number
  records: AliasRecord[]
  cursor?: string
  complete: boolean
}
