import { useQuery } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function AnalyticsPage() {
  const { data: counters } = useQuery({ queryKey: ['analytics', 'counters'], queryFn: () => api('/stats/counters') })
  const { data: views } = useQuery({ queryKey: ['analytics', 'views'], queryFn: () => api('/stats/views?unit=hour') })
  const { data: agents } = useQuery({ queryKey: ['analytics', 'agents'], queryFn: () => api('/stats/metrics?type=agent&limit=10') })

  const c = counters as any

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-6">Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Total Visits</div>
          <div className="text-2xl font-bold text-[#fafafa]">{c?.visits || 0}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Unique Visitors</div>
          <div className="text-2xl font-bold text-[#fafafa]">{c?.visitors || 0}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Referrers</div>
          <div className="text-2xl font-bold text-[#fafafa]">{c?.referers || 0}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Traffic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={(views as any[]) || []}>
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Area type="monotone" dataKey="visits" stroke="#fafafa" fill="#fafafa" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">User Agents</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(agents as any[]) || []} layout="vertical">
              <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Bar dataKey="count" fill="#fafafa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
