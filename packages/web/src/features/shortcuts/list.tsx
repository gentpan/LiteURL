import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAliasList, useRemoveAlias } from './aliases.hook'
import type { AliasRecord } from 'models'

export function AliasList() {
  const [cursor, setCursor] = useState<string | undefined>()
  const { data, isLoading } = useAliasList(20, cursor)
  const remove = useRemoveAlias()
  const records = (data?.records || []) as AliasRecord[]

  const handleRemove = (alias: string) => {
    if (confirm('Delete this alias?')) remove.mutate(alias)
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
                    <td className="p-3 text-sm text-[#a1a1aa]">{new Date(r.created * 1000).toLocaleDateString()}</td>
                    <td className="p-3 text-right"><button onClick={() => handleRemove(r.alias)} className="text-sm text-red-500 hover:text-red-400">Delete</button></td>
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
    </div>
  )
}
