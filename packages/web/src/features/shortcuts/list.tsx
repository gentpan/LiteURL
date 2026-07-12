import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, BarChart3, Plus, Search, X } from 'lucide-react'
import { useAliasList, useRemoveAlias, useBatchRemoveAliases } from './aliases.hook'
import { LinkEditor } from './link-editor'
import { formatLocal } from '../../shared/datetime'
import type { AliasListItem } from 'models'

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
        <button onClick={() => { setEditing(null); setEditorOpen(true) }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#fafafa] text-[#18181b] rounded-md font-medium hover:bg-[#e4e4e7]">
          <Plus className="w-4 h-4" /> New Link
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input value={q} onChange={e => { setQ(e.target.value); setCursor(undefined) }}
            placeholder="Search URL, alias, remark..."
            className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]" />
        </div>
        <select value={sort} onChange={e => { setSort(e.target.value); setCursor(undefined) }}
          className="px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] outline-none focus:border-[#52525b]">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">Alias A-Z</option>
          <option value="za">Alias Z-A</option>
        </select>
        {tag && (
          <button onClick={() => setTag(undefined)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#27272a] text-[#fafafa] rounded-md hover:bg-[#3f3f46]">
            #{tag} <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between mb-3 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-md">
          <span className="text-sm text-[#a1a1aa]">{selected.size} selected</span>
          <button onClick={confirmBatch} disabled={batchRemove.isPending}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50">
            {batchRemove.isPending ? 'Deleting...' : 'Delete selected'}
          </button>
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
                        <button onClick={() => navigate({ to: '/dashboard/link/$alias', params: { alias: r.alias } })} title="Analysis"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditing(r); setEditorOpen(true) }} title="Edit"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors text-xs">
                          Edit
                        </button>
                        <button onClick={() => setPending(r)} title="Delete"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[#27272a] text-[#a1a1aa] hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              <button onClick={() => { setCursor(undefined); setSelected(new Set()) }} disabled={!cursor} className="px-3 py-1.5 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md disabled:opacity-50 hover:text-[#fafafa]">First</button>
              {!data.complete && <button onClick={() => setCursor(data.cursor)} className="px-3 py-1.5 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md hover:text-[#fafafa]">Next</button>}
            </div>
          )}
        </>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPending(null)}>
          <div className="w-full max-w-sm mx-4 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-2">Delete link</h2>
            <p className="text-sm text-[#a1a1aa] mb-1">Delete <span className="font-mono text-[#fafafa]">{pending.alias}</span>?</p>
            <p className="text-sm text-[#a1a1aa] mb-6">This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPending(null)} className="px-4 py-2 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md hover:text-[#fafafa]">Cancel</button>
              <button onClick={confirmRemove} disabled={remove.isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50">
                {remove.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LinkEditor open={editorOpen} initial={editing} onClose={() => setEditorOpen(false)}
        onSaved={() => { setEditorOpen(false); setCursor(undefined) }} />
    </div>
  )
}
