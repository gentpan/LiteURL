export type AuthMode = 'bearer-token'

export interface SessionInfo {
  brand: string
  homepage: string
  method: AuthMode
  features: Record<string, boolean>
}
