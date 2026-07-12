import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, BarChart3, Plus, Search, X } from 'lucide-react'
import { useAliasList, useRemoveAlias, useBatchRemoveAliases } from './aliases.hook'
import { LinkEditor } from './link-editor'
import { formatLocal } from '../../shared/datetime'
import { Button, Input, Select, AlertDialog } from '../../components/ui'
import type { AliasListItem } from 'models'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'Alias A-Z' },
  { value: 'za', label: 'Alias Z-A' },
]

export function AliasList() {
  const [cursor, setCursor] = useState<string | undefined>()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [tag, setTag] = useState<string | undefined>()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { data, isLoading } = useAliasList(20, cursor, { q: q || undefined, sort, tag })
  const remove = useRemoveAlias()
  const batchRemove = useBatchRemoveAliases()
  const navigate = useNavigate()
  const records = (data?.records || []) as AliasListItem[]

  const [pending, setPending] = useState<AliasListItem | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<AliasListItem | null>(null)

  const toggle = (alias: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(alias)) next.delete(alias)
      else next.add(alias)
      return next
    })
  }
  const allSelected = records.length > 0 && records.every(r => selected.has(r.alias))
  const toggleAll = () => {
    setSelected(prev => allSelected ? new Set() : new Set(records.map(r => r.alias)))
  }

  const confirmRemove = () => {
    if (pending) remove.mutate(pending.alias)
    setPending(null)
  }
  const confirmBatch = () => {
    batchRemove.mutate([...selected])
    setSelected(new Set())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#fafafa]">Aliases</h1>
        <Button size="sm" onClick={() => { setEditing(null); setEditorOpen(true) }}>
          <Plus className="w-4 h-4" /> New Link
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b] z-10" />
          <Input value={q} onChange={e => { setQ(e.target.value); setCursor(undefined) }}
            placeholder="Search URL, alias, remark..." className="pl-9" />
        </div>
        <Select value={sort} onValueChange={v => { setSort(v); setCursor(undefined) }} options={SORT_OPTIONS} />
        {tag && (
          <button onClick={() => setTag(undefined)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#27272a] text-[#fafafa] rounded-md hover:bg-[#3f3f46]">
            #{tag} <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md">
          <span className="text-sm text-[#a1a1aa]">{selected.size} selected</span>
          <Button variant="danger" size="sm" onClick={confirmBatch} disabled={batchRemove.isPending}>
            {batchRemove.isPending ? 'Deleting...' : 'Delete selected'}
          </Button>
        </div>
      )}

      {isLoading ? <div className="text-[#a1a1aa]">Loading...</div> : (
        <>
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-[#27272a]">
                <th className="w-10 p-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#fafafa]" /></th>
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Alias</th>
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Destination</th>
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Created</th>
                <th className="text-right p-3 text-sm text-[#a1a1aa] font-medium">Visits</th>
                <th className="text-right p-3 text-sm text-[#a1a1aa] font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-[#27272a] last:border-0 hover:bg-[#18181b]">
                    <td className="p-3"><input type="checkbox" checked={selected.has(r.alias)} onChange={() => toggle(r.alias)} className="accent-[#fafafa]" /></td>
                    <td className="p-3">
                      <Link to="/dashboard/link/$alias" params={{ alias: r.alias }} className="text-[#fafafa] hover:underline text-sm font-mono">{r.alias}</Link>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.tags.map(t => (
                            <button key={t} onClick={() => { setTag(t); setCursor(undefined) }}
                              className="text-[10px] px-1.5 py-0.5 bg-[#27272a] text-[#a1a1aa] rounded hover:text-[#fafafa]">#{t}</button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-[#a1a1aa] max-w-md truncate">{r.url}</td>
                    <td className="p-3 text-sm text-[#a1a1aa] whitespace-nowrap">{formatLocal(r.created)}</td>
                    <td className="p-3 text-sm text-[#fafafa] text-right font-mono">{r.visits}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="icon" title="Analysis"
                          onClick={() => navigate({ to: '/dashboard/link/$alias', params: { alias: r.alias } })}>
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="icon" className="text-xs" title="Edit"
                          onClick={() => { setEditing(r); setEditorOpen(true) }}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="icon" title="Delete"
                          className="hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10"
                          onClick={() => setPending(r)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-[#a1a1aa]">No links found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data && (
            <div className="flex justify-between mt-4">
              <Button variant="secondary" size="sm" disabled={!cursor} onClick={() => { setCursor(undefined); setSelected(new Set()) }}>First</Button>
              {!data.complete && <Button variant="secondary" size="sm" onClick={() => setCursor(data.cursor)}>Next</Button>}
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!pending}
        onOpenChange={o => !o && setPending(null)}
        title="Delete link"
        description={pending ? `Delete "${pending.alias}"? This cannot be undone.` : undefined}
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onConfirm={confirmRemove}
      />

      <LinkEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)}
        onSaved={() => { setEditorOpen(false); setCursor(undefined) }} />
    </div>
  )
}
