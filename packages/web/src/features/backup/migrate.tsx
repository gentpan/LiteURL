import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import { Button, Textarea } from '../../components/ui'

export function MigratePage() {
  const [importJson, setImportJson] = useState('')
  const backup = useMutation({ mutationFn: () => api('/backup', { method: 'POST' }) })
  const exp = useMutation({
    mutationFn: () => api('/link/export'),
    onSuccess: (d) => {
      const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `liteurl-export-${Date.now()}.json`; a.click()
      URL.revokeObjectURL(url)
    },
  })
  const imp = useMutation({ mutationFn: (d: any) => api('/link/import', { method: 'POST', body: d }) })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-6">Migrate</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-2">Export</h2>
          <p className="text-sm text-[#a1a1aa] mb-4">Download all aliases as JSON</p>
          <Button onClick={() => exp.mutate()} disabled={exp.isPending}>{exp.isPending ? 'Exporting...' : 'Export'}</Button>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-2">Backup</h2>
          <p className="text-sm text-[#a1a1aa] mb-4">Create server backup</p>
          <Button onClick={() => backup.mutate()} disabled={backup.isPending}>{backup.isPending ? 'Backing up...' : 'Backup'}</Button>
          {backup.data && <p className="text-sm text-green-500 mt-2">Done!</p>}
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-2">Import</h2>
          <p className="text-sm text-[#a1a1aa] mb-4">Paste exported JSON</p>
          <Textarea value={importJson} onChange={e => setImportJson(e.target.value)} placeholder="Paste JSON here..." className="h-24 mb-4" />
          <Button onClick={() => { try { imp.mutate(JSON.parse(importJson)) } catch { alert('Invalid JSON') } }} disabled={imp.isPending || !importJson}>{imp.isPending ? 'Importing...' : 'Import'}</Button>
          {imp.data && <p className="text-sm text-green-500 mt-2">Done!</p>}
        </div>
      </div>
    </div>
  )
}
