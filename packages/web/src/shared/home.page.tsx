import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { createPublicLink } from './api.client'
import { Button, Field, Input } from '../components/ui'

export function HomePage() {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ alias: string, shortUrl: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const r = await createPublicLink(url, alias.trim() || undefined)
      setResult(r)
    } catch (err: any) {
      setError(err.message || '生成失败')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => { if (result) navigator.clipboard.writeText(result.shortUrl) }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-[#fafafa] px-4">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">LiteURL</h1>
        <p className="text-[#a1a1aa] mb-8 text-center">轻量级短链接服务 · 输入长链接，立即生成短链</p>

        <form onSubmit={submit} className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-6 space-y-4">
          <Field label="目标链接">
            <Input type="url" required value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url" />
          </Field>
          <div>
            <label className="block text-sm text-[#a1a1aa] mb-1.5">自定义后缀（可选）</label>
            <div className="flex items-center rounded-md border border-[#27272a] bg-[#09090b] focus-within:border-[#52525b]">
              <span className="px-3 text-sm text-[#52525b]">uz.bi/</span>
              <input
                value={alias} onChange={e => setAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                placeholder="my-link"
                className="flex-1 px-1 py-2.5 bg-transparent text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {result && (
            <div className="flex items-center gap-2 p-3 bg-[#18181b] border border-[#27272a] rounded-lg">
              <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-[#fafafa] font-mono break-all hover:underline">{result.shortUrl}</a>
              <Button type="button" size="sm" className="text-xs" onClick={copy}>复制</Button>
            </div>
          )}

          <Button type="submit" disabled={loading || !url.trim()} className="w-full">
            {loading ? '生成中...' : '生成短链'}
          </Button>
        </form>

        <div className="flex gap-4 justify-center mt-6 text-sm">
          <Link to="/dashboard/login" className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">后台管理</Link>
          <a href="https://github.com/gentpan/LiteURL" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  )
}
