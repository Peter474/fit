import { NavLink } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'

export function Sidebar() {
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

      <div className="rounded-xl border border-border-soft bg-surface-2/60 px-3 py-3 text-xs text-text-tertiary">
        Local-only build. Your data stays on this device.
      </div>
    </aside>
  )
}
