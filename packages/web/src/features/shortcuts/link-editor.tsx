import { useEffect, useState } from 'react'
import type { AliasRecord } from 'models'
import { useCreateAlias, useEditAlias } from './aliases.hook'
import { Dialog, Field, Input, Button } from '../../components/ui'

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
    <Dialog
      open={open}
      onOpenChange={o => !o && onClose()}
      title={isEdit ? 'Edit Link' : 'New Link'}
      footer={(
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={busy} onClick={submit}>
            {busy ? 'Saving...' : isEdit ? 'Save' : 'Create'}
          </Button>
        </>
      )}
    >
      <div className="p-5 space-y-4">
        <Field label={<>Target URL <span className="text-red-400">*</span></>}>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" />
        </Field>
        <Field label="Short alias">
          <Input value={alias} disabled={isEdit} onChange={e => setAlias(e.target.value)} placeholder={isEdit ? '' : 'leave empty for random'} />
        </Field>
        <Field label="Remark">
          <Input value={remark} onChange={e => setRemark(e.target.value)} placeholder="optional note" />
        </Field>
        <Field label="Tags" hint="comma separated">
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="social, campaign" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Password">
            <Input value={password} onChange={e => setPassword(e.target.value)} type="text" placeholder={isEdit ? 'set new' : 'optional'} />
          </Field>
          <Field label="Expires">
            <Input value={expires} onChange={e => setExpires(e.target.value)} type="datetime-local" />
          </Field>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </Dialog>
  )
}
