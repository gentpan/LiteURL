import { useState, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuth } from './auth.store'
import { Button, Field, Input } from '../../components/ui'

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
          <form onSubmit={submit} className="space-y-4">
            <Field label="Site Token">
              <Input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Enter your site token" required autoFocus />
            </Field>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Verifying...' : 'Sign In'}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
