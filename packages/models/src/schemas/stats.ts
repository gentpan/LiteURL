import { z } from 'zod'
import { DEFAULT_ALIAS_LEN } from './alias'

export const ANALYTICS_LIMIT = 500

export const StatsFilter = z.object({
  id: z.string().optional(),
  from: z.coerce.number().int().safe().optional(),
  to: z.coerce.number().int().safe().optional(),
  url: z.string().optional(),
  alias: z.string().optional(),
  referrer: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  tz: z.string().optional(),
  lang: z.string().optional(),
  os: z.string().optional(),
  agent: z.string().optional(),
  agentKind: z.string().optional(),
  device: z.string().optional(),
  deviceKind: z.string().optional(),
  limit: z.coerce.number().int().safe().default(ANALYTICS_LIMIT),
})

export type StatsFilter = z.infer<typeof StatsFilter>
