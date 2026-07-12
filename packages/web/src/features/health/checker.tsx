import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import { Button, Textarea } from '../../components/ui'
import type { CheckOutcome } from 'models'

export function HealthChecker() {
  const [input, setInput] = useState('')
  const check = useMutation({
    mutationFn: (targets: Array<{ alias: string, url: string }>) => api('/link/check', { method: 'POST', body: { targets, timeout: 6 } }),
  })
  const outcomes = (check.data as any)?.outcomes as CheckOutcome[] | undefined

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#fafafa] mb-6">Health Check</h1>
      <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-6 max-w-2xl">
        <p className="text-sm text-[#a1a1aa] mb-4">Enter aliases (one per line):</p>
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder={"alias1\nalias2\nalias3"} className="h-32 mb-4" />
        <Button onClick={() => { const aliases = input.split('\n').map(s => s.trim()).filter(Boolean); check.mutate(aliases.map(a => ({ alias: a, url: '' }))) }} disabled={check.isPending || !input.trim()}>
          {check.isPending ? 'Checking...' : 'Check'}
        </Button>
        {outcomes && (
          <div className="mt-6 space-y-2">
            {outcomes.map((o, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${o.ok ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                <span className="font-mono">{o.alias}</span>
                <span className="text-[#a1a1aa]">&rarr;</span>
                <span>{o.ok ? `${o.status} (${o.latency}ms)` : o.failure || `${o.status}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
