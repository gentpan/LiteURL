export function unwrapError(error: unknown, cap?: number): string {
  const msg = error instanceof Error ? error.message : String(error)
  return cap ? msg.slice(0, cap) : msg
}
