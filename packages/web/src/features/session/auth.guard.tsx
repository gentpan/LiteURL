import { useEffect } from 'react'
import { useRouter, useLocation } from '@tanstack/react-router'
import { useAuth } from '../features/session/auth.store'

export function Guard({ children }: { children: React.ReactNode }) {
  const { logged, loading, check } = useAuth()
  const router = useRouter()
  const loc = useLocation()

  useEffect(() => { check() }, [])
  useEffect(() => {
    if (!loading && !logged && loc.pathname !== '/dashboard/login') router.navigate({ to: '/dashboard/login' })
  }, [logged, loading, loc.pathname])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#a1a1aa]">Loading...</div>
  if (!logged && loc.pathname !== '/dashboard/login') return null
  return <>{children}</>
}
