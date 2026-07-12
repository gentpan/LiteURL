import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { api, getSession } from '../../shared/api.client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function countryFlag(cc: string): string {
  if (!cc || cc.length !== 2 || !/^[a-zA-Z]{2}$/.test(cc)) return ''
  return cc.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)))
}

const REGION_NAMES = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null

function countryName(cc: string): string {
  if (!cc) return 'Unknown'
  try { return REGION_NAMES?.of(cc.toUpperCase()) || cc.toUpperCase() } catch { return cc.toUpperCase() }
}

const DAY = 86400
const now = () => Math.floor(Date.now() / 1000)

const PRESETS = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'all', label: 'All' },
] as const

type PresetKey = '24h' | '7d' | '30d' | 'all' | 'custom'

function rangeParams(key: PresetKey, fromDate?: string, toDate?: string) {
  if (key === 'all') return { from: undefined as number | undefined, to: undefined as number | undefined, unit: 'day' }
  let from: number | undefined
  let to: number | undefined = now()
  if (key === '24h') from = now() - DAY
  else if (key === '7d') from = now() - 7 * DAY
  else if (key === '30d') from = now() - 30 * DAY
  if (key === 'custom') {
    if (fromDate) from = Math.floor(new Date(fromDate).getTime() / 1000)
    if (toDate) to = Math.floor(new Date(toDate).getTime() / 1000) + DAY - 1
  }
  const span = (to! - (from ?? to!)) / DAY
  const unit = span <= 2 ? 'hour' : 'day'
  return { from, to, unit }
}

function qs(p: { from?: number, to?: number }, extra?: Record<string, string>) {
  const sp = new URLSearchParams()
  if (p.from !== undefined) sp.set('from', String(p.from))
  if (p.to !== undefined) sp.set('to', String(p.to))
  if (extra) Object.entries(extra).forEach(([k, v]) => sp.set(k, v))
  return sp.toString()
}

export function AnalyticsPage() {
  const [preset, setPreset] = useState<PresetKey>('7d')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const r = preset === 'custom' ? rangeParams('custom', fromDate, toDate) : rangeParams(preset)
  const q = qs(r)
  const days = r.from && r.to ? Math.max(1, Math.round((r.to - r.from) / DAY)) : 30

  const { data: counters } = useQuery({ queryKey: ['analytics', 'counters', q], queryFn: () => api(`/stats/counters?${q}`) })
  const { data: views } = useQuery({ queryKey: ['analytics', 'views', q, r.unit], queryFn: () => api(`/stats/views?unit=${r.unit}&${q}`) })
  const { data: heat } = useQuery({ queryKey: ['analytics', 'heatmap', q], queryFn: () => api(`/stats/heatmap?${q}`) })

  const c = counters as any
  const avg = c?.visits ? Math.round(c.visits / days) : 0

  const downloadCsv = async () => {
    const res = await fetch(`/api/stats/export?${q}`, { headers: { Authorization: `Bearer ${getSession()}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'liteurl-stats.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-[#fafafa]">Analysis</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-[#27272a]">
            {PRESETS.map(p => (
              <button key={p.key} onClick={() => setPreset(p.key)}
                className={`px-3 py-1.5 text-sm ${preset === p.key ? 'bg-[#fafafa] text-[#18181b]' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={() => setPreset('custom')} className={`px-3 py-1.5 text-sm rounded-md border border-[#27272a] ${preset === 'custom' ? 'text-[#fafafa] bg-[#18181b]' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}>Custom</button>
          {preset === 'custom' && (
            <div className="flex items-center gap-1">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-2 py-1.5 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa]" />
              <span className="text-[#a1a1aa] text-sm">→</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-2 py-1.5 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa]" />
            </div>
          )}
          <button onClick={downloadCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#27272a] rounded-md text-[#a1a1aa] hover:text-[#fafafa]">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card label="Total Visits" value={c?.visits || 0} />
        <Card label="Unique Visitors" value={c?.visitors || 0} />
        <Card label="Referrers" value={c?.referers || 0} />
        <Card label={`Avg / Day (${days}d)`} value={avg} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Traffic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={(views as any[]) || []}>
              <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} tickFormatter={v => (r.unit === 'hour' ? (v || '').slice(5) : (v || '').slice(5))} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }} labelStyle={{ color: '#fafafa' }} />
              <Area type="monotone" dataKey="visits" stroke="#fafafa" fill="#fafafa" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-[#fafafa] mb-4">Active Hours</h2>
          <Heatmap data={(heat as any[]) || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Countries" type="country" q={q} kind="country" />
        <MetricCard title="Referrers" type="referrer" q={q} kind="referrer" />
        <MetricCard title="Devices" type="device" q={q} />
        <MetricCard title="Operating Systems" type="os" q={q} />
        <MetricCard title="Browsers" type="agent" q={q} />
        <MetricCard title="Languages" type="lang" q={q} />
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
      <div className="text-sm text-[#a1a1aa] mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#fafafa]">{value.toLocaleString()}</div>
    </div>
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Heatmap({ data }: { data: Array<{ weekday: number, hour: number, visits: number }> }) {
  const max = Math.max(1, ...data.map(d => d.visits))
  const grid: Record<string, number> = {}
  data.forEach(d => { grid[`${d.weekday}-${d.hour}`] = d.visits })
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-[2px] mb-[2px] pl-8">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-3 text-[8px] text-[#52525b] text-center">{h % 6 === 0 ? h : ''}</div>
          ))}
        </div>
        {WEEKDAYS.map((wd, day) => (
          <div key={day} className="flex items-center gap-[2px] mb-[2px]">
            <div className="w-7 text-[8px] text-[#52525b]">{wd}</div>
            {Array.from({ length: 24 }).map((_, h) => {
              const v = grid[`${day}-${h}`] || 0
              const ratio = v / max
              return (
                <div key={h} title={`${wd} ${h}:00 — ${v}`}
                  className="w-3 h-3 rounded-[2px]"
                  style={{ background: v === 0 ? '#18181b' : `rgba(250,250,250,${0.12 + 0.88 * ratio})` }} />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function labelFor(name: string, kind?: string): { icon: string, text: string } {
  const v = (name ?? '').trim()
  if (kind === 'country') return { icon: countryFlag(v), text: countryName(v) }
  if (kind === 'referrer') return { icon: '', text: v || 'Direct' }
  return { icon: '', text: v || 'Unknown' }
}

function MetricCard({ title, type, q, kind }: { title: string, type: string, q: string, kind?: string }) {
  const { data } = useQuery({
    queryKey: ['analytics', 'metric', type, q],
    queryFn: () => api(`/stats/metrics?type=${type}&limit=8&${q}`),
  })
  const rows = (data as any[]) || []
  const max = Math.max(1, ...rows.map(r => r.count))
  const total = rows.reduce((s, r) => s + (r.count || 0), 0)
  return (
    <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-[#fafafa] mb-4">{title}</h2>
      {rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#52525b]">No data</div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r, i) => {
            const { icon, text } = labelFor(r.name, kind)
            const pct = total ? Math.round((r.count / total) * 100) : 0
            return (
              <div key={i} className="relative flex items-center h-8 rounded-md overflow-hidden" title={`${text} — ${r.count}`}>
                <div className="absolute inset-y-0 left-0 bg-[#27272a] rounded-md" style={{ width: `${(r.count / max) * 100}%` }} />
                <div className="relative flex items-center justify-between w-full px-2.5 text-sm">
                  <span className="flex items-center gap-2 truncate text-[#fafafa]">
                    {icon && <span className="text-base leading-none">{icon}</span>}
                    <span className="truncate">{text}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-[#52525b] text-xs tabular-nums">{pct}%</span>
                    <span className="text-[#a1a1aa] tabular-nums font-medium">{r.count}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
