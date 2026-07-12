import { z } from 'zod'

function isHttp(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch { return false }
}

export const TargetSchema = z.object({
  alias: z.string().trim().min(1).max(2048),
  url: z.string().trim().url().max(2048).refine(isHttp, 'URL must use HTTP or HTTPS'),
})

export const BatchCheckSchema = z.object({
  targets: z.array(TargetSchema).min(1).max(10),
  timeout: z.coerce.number().int().min(1).max(30).default(6),
})

export type Target = z.infer<typeof TargetSchema>
export type BatchCheck = z.infer<typeof BatchCheckSchema>

export interface CheckOutcome extends Target {
  status: number
  ok: boolean
  latency: number
  checkedAt: string
  failure?: string
}

export interface CheckReport {
  outcomes: CheckOutcome[]
}
