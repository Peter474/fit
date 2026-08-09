import {
  LayoutDashboard,
  CalendarClock,
  Dumbbell,
  ChartSpline,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: CalendarClock },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/analytics', label: 'Analytics', icon: ChartSpline },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal },
]
