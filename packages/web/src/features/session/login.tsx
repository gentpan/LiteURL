import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuth } from './auth.store'

export function LoginPage() {
  const [token, setToken] = useState('')
  const { login, logged, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => { if (logged) router.navigate({ to: '/dashboard/links' }) }, [logged])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await login(token)) router.navigate({ to: '/dashboard/links' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-[#0a0a0a] border border-[#27272a] rounded-lg p-8 mx-4">
          <h1 className="text-xl font-semibold text-center mb-6 text-[#fafafa]">LiteURL</h1>
          <form onSubmit={submit}>
            <label className="block text-sm font-medium text-[#fafafa] mb-2">Site Token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Enter your site token" className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-sm text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#52525b] mb-4" required autoFocus />
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2 bg-[#fafafa] text-[#18181b] rounded-md text-sm font-medium hover:bg-[#e4e4e7] disabled:opacity-50">{loading ? 'Verifying...' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
