import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { AliasRecord } from 'models'
import { useCreateAlias, useEditAlias } from './aliases.hook'

interface Props {
  open: boolean
  initial?: AliasRecord | null
  onClose: () => void
  onSaved: () => void
}

function toLocalInput(ts?: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

export function LinkEditor({ open, initial, onClose, onSaved }: Props) {
  const isEdit = !!initial
  const create = useCreateAlias()
  const edit = useEditAlias()

  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [remark, setRemark] = useState('')
  const [tags, setTags] = useState('')
  const [password, setPassword] = useState('')
  const [expires, setExpires] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setUrl(initial?.url || '')
    setAlias(initial?.alias || '')
    setRemark(initial?.remark || '')
    setTags((initial?.tags || []).join(', '))
    setPassword('')
    setExpires(toLocalInput(initial?.expires))
  }, [open, initial])

  if (!open) return null

  const submit = async () => {
    setError('')
    if (!url.trim()) { setError('Target URL is required'); return }
    const payload: Partial<AliasRecord> = {
      url: url.trim(),
      remark: remark.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (!isEdit) payload.alias = alias.trim()
    if (password) payload.secret = password
    if (expires) payload.expires = Math.floor(new Date(expires).getTime() / 1000)
    if (isEdit && initial) payload.alias = initial.alias

    try {
      if (isEdit) await edit.mutateAsync(payload)
      else await create.mutateAsync(payload)
      onSaved()
    } catch (e: any) {
      setError(e.message || 'Failed')
    }
  }

  const busy = create.isPending || edit.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#27272a] rounded-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a]">
          <h2 className="text-lg font-semibold text-[#fafafa]">{isEdit ? 'Edit Link' : 'New Link'}</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-[#fafafa]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Target URL <span className="text-red-400">*</span></label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Short alias</label>
            <input value={alias} disabled={isEdit} onChange={e => setAlias(e.target.value)} placeholder={isEdit ? '' : 'leave empty for random'}
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b] disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Remark</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} placeholder="optional note"
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">Tags <span className="text-[#52525b]">(comma separated)</span></label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="social, campaign"
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="text" placeholder={isEdit ? 'set new' : 'optional'}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1.5">Expires</label>
              <input value={expires} onChange={e => setExpires(e.target.value)} type="datetime-local"
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#27272a]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md hover:text-[#fafafa]">Cancel</button>
          <button onClick={submit} disabled={busy}
            className="px-4 py-2 text-sm bg-[#fafafa] text-[#18181b] rounded-md font-medium hover:bg-[#e4e4e7] disabled:opacity-50">
            {busy ? 'Saving...' : isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
