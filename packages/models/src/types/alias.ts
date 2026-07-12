import type { AliasRecord } from '../schemas/alias'

export type { AliasRecord }

export type MutationKind = 'create' | 'edit' | 'remove'

export interface AliasSuggestion {
  alias: string
  url: string
  remark?: string
}

export interface PagedAliases {
  records: AliasRecord[]
  cursor: string
  complete: boolean
}

export type SortMode = 'newest' | 'oldest' | 'az' | 'za'
