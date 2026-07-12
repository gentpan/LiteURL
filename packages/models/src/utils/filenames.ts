export function stampFilename(prefix: string, ext: string, d = new Date()): string {
  const clean = ext.replace(/^\./, '')
  const ts = d.toISOString().replaceAll(':', '-').replaceAll('.', '-')
  return `${prefix}-${ts}.${clean}`
}
