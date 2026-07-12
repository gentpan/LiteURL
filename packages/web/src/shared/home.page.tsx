import { Link } from '@tanstack/react-router'

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-[#fafafa] px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">LiteURL</h1>
        <p className="text-lg text-[#a1a1aa] mb-8">Self-hosted URL shortener with analytics</p>
        <div className="flex gap-4 justify-center">
          <a href="https://github.com/gentpan/LiteURL" className="px-6 py-3 bg-[#fafafa] text-[#18181b] rounded-lg font-medium hover:bg-[#e4e4e7] transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          <Link to="/dashboard/login" className="px-6 py-3 border border-[#27272a] rounded-lg font-medium hover:bg-[#18181b] transition-colors">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
