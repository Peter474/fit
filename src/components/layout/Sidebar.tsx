import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, LogOut, User } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'
import { useAppData } from '@/context/AppDataContext'
import { Spinner } from '@/components/ui/Spinner'

export function Sidebar() {
  const { isAuthenticated, email, logout } = useAppData()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/60 px-4 py-6 md:flex">
      <div className="flex items-center gap-2.5 px-2 pb-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-dim text-success">
          <Activity size={18} strokeWidth={2.25} />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">FitTrack</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-surface-2 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-2/60 hover:text-text-primary'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {isAuthenticated ? (
        <div className="flex items-center gap-2 rounded-xl border border-border-soft bg-surface-2/60 px-3 py-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-secondary">
            <User size={14} />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-text-secondary" title={email ?? undefined}>
            {email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-3 hover:text-danger disabled:opacity-50"
          >
            {loggingOut ? <Spinner size={14} /> : <LogOut size={14} />}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border-soft bg-surface-2/60 px-3 py-3 text-xs text-text-tertiary">
          Local-only build. Your data stays on this device.
        </div>
      )}
    </aside>
  )
}
