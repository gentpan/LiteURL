import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from '../../shared/api.client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const DAY = 86400

export function OverviewPage() {
  const from = Math.floor(Date.now() / 1000) - 30 * DAY
  const { data: overview } = useQuery({ queryKey: ['overview'], queryFn: () => api('/stats/overview') })
  const { data: trend } = useQuery({ queryKey: ['overview', 'trend'], queryFn: () => api(`/stats/views?unit=day&from=${from}`) })
  const { data: sources } = useQuery({ queryKey: ['overview', 'sources'], queryFn: () => api('/stats/metrics?type=referrer&limit=6') })

  const o = overview as any

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-6">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Total Links</div>
          <div className="text-2xl font-bold text-[#fafafa]">{o?.totalLinks ?? 0}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <div className="text-sm text-[#a1a1aa] mb-1">Total Clicks</div>
          <div className="text-2xl font-bold text-[#fafafa]">{o?.totalClicks ?? 0}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4 col-span-2 lg:col-span-1">
          <div className="text-sm text-[#a1a1aa] mb-1">Clicks (30d)</div>
          <div className="text-2xl font-bold text-[#fafafa]">
            {(trend as any[] || []).reduce((s: number, d: any) => s + (d.visits || 0), 0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Traffic (last 30 days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={(trend as any[]) || []}>
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={11} tickFormatter={v => (v || '').slice(5)} />
              <YAxis stroke="#a1a1aa" fontSize={11} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Area type="monotone" dataKey="visits" stroke="#fafafa" fill="#fafafa" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Top Sources</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(sources as any[]) || []} layout="vertical">
              <XAxis type="number" stroke="#a1a1aa" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={11} width={90} tickFormatter={v => (v ? String(v).slice(0, 14) : '')} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Bar dataKey="count" fill="#fafafa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
        <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Top Links</h2>
        <table className="w-full">
          <thead><tr className="border-b border-[#27272a]">
            <th className="text-left p-2 text-sm text-[#a1a1aa] font-medium">Alias</th>
            <th className="text-left p-2 text-sm text-[#a1a1aa] font-medium">Destination</th>
            <th className="text-right p-2 text-sm text-[#a1a1aa] font-medium">Visits</th>
          </tr></thead>
          <tbody>
            {(o?.topLinks || []).map((l: any) => (
              <tr key={l.slug} className="border-b border-[#27272a] last:border-0">
                <td className="p-2"><Link to="/dashboard/link/$alias" params={{ alias: l.slug }} className="text-[#fafafa] hover:underline text-sm font-mono">{l.slug}</Link></td>
                <td className="p-2 text-sm text-[#a1a1aa] max-w-md truncate">{l.url}</td>
                <td className="p-2 text-sm text-[#fafafa] text-right font-mono">{l.visits}</td>
              </tr>
            ))}
            {(!o || o.topLinks?.length === 0) && (
              <tr><td colSpan={3} className="p-6 text-center text-sm text-[#a1a1aa]">No clicks yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
