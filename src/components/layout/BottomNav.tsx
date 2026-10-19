import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-between px-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-text-primary' : 'text-text-tertiary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-11 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-surface-3' : ''
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
