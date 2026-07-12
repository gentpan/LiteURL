import { useEffect } from 'react'
import { Outlet, useRouter, useLocation, Link } from '@tanstack/react-router'
import { useAuth } from './auth.store'
import { Link2, BarChart3, ShieldCheck, Database, LogOut } from 'lucide-react'

const NAV = [
  { to: '/dashboard/links', label: 'Links', icon: Link2 },
  { to: '/dashboard/analysis', label: 'Analysis', icon: BarChart3 },
  { to: '/dashboard/check', label: 'Check', icon: ShieldCheck },
  { to: '/dashboard/migrate', label: 'Migrate', icon: Database },
]

export function DashboardShell() {
  const { logged, loading, check } = useAuth()
  const router = useRouter()
  const loc = useLocation()

  useEffect(() => { check() }, [])

  useEffect(() => {
    if (!loading && !logged && loc.pathname !== '/dashboard/login') {
      router.navigate({ to: '/dashboard/login' })
    }
  }, [logged, loading, loc.pathname])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#a1a1aa]">Loading...</div>
  if (!logged && loc.pathname !== '/dashboard/login') return null

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {logged && <NavSidebar />}
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  )
}

function NavSidebar() {
  const loc = useLocation()
  const { logout } = useAuth()
  return (
    <aside className="w-64 border-r border-[#27272a] min-h-screen p-4 flex flex-col">
      <div className="text-lg font-semibold text-[#fafafa] mb-8 px-3">LiteURL</div>
      <nav className="flex-1 space-y-1">
        {NAV.map(n => (
          <Link key={n.to} to={n.to as any} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${loc.pathname === n.to ? 'bg-[#18181b] text-[#fafafa]' : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'}`}>
            <n.icon className="w-4 h-4" />{n.label}
          </Link>
        ))}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]">
        <LogOut className="w-4 h-4" />Logout
      </button>
    </aside>
  )
}
