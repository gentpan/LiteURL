import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import { useAliasDetail } from './aliases.hook'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function AliasDetail() {
  const { alias } = useParams({ from: '/dashboard/link/$alias' })
  const { data: rec, isLoading } = useAliasDetail(alias)
  const { data: views } = useQuery({
    queryKey: ['stats', 'views', alias],
    queryFn: () => api(`/stats/views?alias=${alias}&unit=day`),
    enabled: !!alias,
  })

  if (isLoading) return <div className="text-[#a1a1aa]">Loading...</div>
  if (!rec) return <div className="text-[#a1a1aa]">Not found</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-2">{rec.alias}</h1>
      <p className="text-sm text-[#a1a1aa] mb-6 break-all">{rec.url}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Created</div>
          <div className="text-lg font-semibold text-[#fafafa]">{new Date(rec.created * 1000).toLocaleDateString()}</div>
        </div>
        {rec.expires && (
          <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
            <div className="text-sm text-[#a1a1aa] mb-1">Expires</div>
            <div className="text-lg font-semibold text-[#fafafa]">{new Date(rec.expires * 1000).toLocaleDateString()}</div>
          </div>
        )}
      </div>

      {views && (
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
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
    </div>
  )
}
