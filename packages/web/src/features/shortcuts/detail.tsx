import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import { useAliasDetail } from './aliases.hook'
import { formatLocal } from '../../shared/datetime'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function AliasDetail() {
  const { alias } = useParams({ from: '/dashboard/link/$alias' })
  const { data: rec, isLoading } = useAliasDetail(alias)
  const { data: views } = useQuery({
    queryKey: ['stats', 'views', alias],
    queryFn: () => api(`/stats/views?alias=${alias}&unit=day`),
    enabled: !!alias,
  })
  const { data: events } = useQuery({
    queryKey: ['logs', 'events', alias],
    queryFn: () => api(`/logs/events?alias=${alias}&limit=50`),
    enabled: !!alias,
  })

  if (isLoading) return <div className="text-[#a1a1aa]">Loading...</div>
  if (!rec) return <div className="text-[#a1a1aa]">Not found</div>

  const rows = (events as any[]) || []

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-2">{rec.alias}</h1>
      <p className="text-sm text-[#a1a1aa] mb-6 break-all">{rec.url}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Created</div>
          <div className="text-lg font-semibold text-[#fafafa]">{formatLocal(rec.created)}</div>
        </div>
        {rec.expires && (
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
            <div className="text-sm text-[#a1a1aa] mb-1">Expires</div>
            <div className="text-lg font-semibold text-[#fafafa]">{formatLocal(rec.expires)}</div>
          </div>
        )}
        {rec.tags && rec.tags.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
            <div className="text-sm text-[#a1a1aa] mb-1">Tags</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {rec.tags.map(t => (
                <span key={t} className="text-[11px] px-1.5 py-0.5 bg-[#27272a] text-[#a1a1aa] rounded">#{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {views && (
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Views</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={views as any[]}>
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Bar dataKey="visits" fill="#fafafa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
        <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#27272a] text-left">
              <th className="p-2 text-[#a1a1aa] font-medium">Time</th>
              <th className="p-2 text-[#a1a1aa] font-medium">Country</th>
              <th className="p-2 text-[#a1a1aa] font-medium">Referrer</th>
              <th className="p-2 text-[#a1a1aa] font-medium">Browser</th>
              <th className="p-2 text-[#a1a1aa] font-medium">Device</th>
            </tr></thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i} className="border-b border-[#27272a] last:border-0">
                  <td className="p-2 text-[#a1a1aa] whitespace-nowrap">{formatLocal(e.timestamp)}</td>
                  <td className="p-2 text-[#a1a1aa]">{e.country || '-'}</td>
                  <td className="p-2 text-[#a1a1aa] max-w-[200px] truncate">{e.referer || 'direct'}</td>
                  <td className="p-2 text-[#a1a1aa]">{e.browser || '-'}</td>
                  <td className="p-2 text-[#a1a1aa]">{e.device || '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-[#a1a1aa]">No activity yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
