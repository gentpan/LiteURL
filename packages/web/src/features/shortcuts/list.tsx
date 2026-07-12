import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, BarChart3 } from 'lucide-react'
import { useAliasList, useRemoveAlias } from './aliases.hook'
import { formatLocal } from '../../shared/datetime'
import type { AliasRecord } from 'models'

export function AliasList() {
  const [cursor, setCursor] = useState<string | undefined>()
  const { data, isLoading } = useAliasList(20, cursor)
  const remove = useRemoveAlias()
  const navigate = useNavigate()
  const records = (data?.records || []) as AliasRecord[]

  const [pending, setPending] = useState<AliasRecord | null>(null)

  const confirmRemove = () => {
    if (pending) remove.mutate(pending.alias)
    setPending(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#fafafa]">Aliases</h1>
      </div>

      {isLoading ? <div className="text-[#a1a1aa]">Loading...</div> : (
        <>
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-[#27272a]">
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Alias</th>
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Destination</th>
                <th className="text-left p-3 text-sm text-[#a1a1aa] font-medium">Created</th>
                <th className="text-right p-3 text-sm text-[#a1a1aa] font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-[#27272a] last:border-0 hover:bg-[#18181b]">
                    <td className="p-3"><Link to="/dashboard/link/$alias" params={{ alias: r.alias }} className="text-[#fafafa] hover:underline text-sm font-mono">{r.alias}</Link></td>
                    <td className="p-3 text-sm text-[#a1a1aa] max-w-md truncate">{r.url}</td>
                    <td className="p-3 text-sm text-[#a1a1aa] whitespace-nowrap">{formatLocal(r.created)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate({ to: '/dashboard/link/$alias', params: { alias: r.alias } })}
                          title="Analysis"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPending(r)}
                          title="Delete"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-[#27272a] text-[#a1a1aa] hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && (
            <div className="flex justify-between mt-4">
              <button onClick={() => setCursor(undefined)} disabled={!cursor} className="px-3 py-1.5 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md disabled:opacity-50 hover:text-[#fafafa]">First</button>
              {!data.complete && <button onClick={() => setCursor(data.cursor)} className="px-3 py-1.5 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md hover:text-[#fafafa]">Next</button>}
            </div>
          )}
        </>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPending(null)}>
          <div className="w-full max-w-sm mx-4 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-2">删除短链</h2>
            <p className="text-sm text-[#a1a1aa] mb-1">确定要删除 <span className="font-mono text-[#fafafa]">{pending.alias}</span> 吗？</p>
            <p className="text-sm text-[#a1a1aa] mb-6">此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPending(null)} className="px-4 py-2 text-sm text-[#a1a1aa] border border-[#27272a] rounded-md hover:text-[#fafafa]">取消</button>
              <button
                onClick={confirmRemove}
                disabled={remove.isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {remove.isPending ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
