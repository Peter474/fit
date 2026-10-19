import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useAppData } from '@/context/AppDataContext'
import { useDailyLogsRange } from '@/hooks/useDailyLogsRange'
import { todayKey, lastNDays, formatShortDate, isToday } from '@/lib/date'
import { totalCalories, totalWater, totalProtein, type DailyLog } from '@/types/tracking'

const RANGES = [
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '3 months', days: 90 },
  { key: 'all', label: 'All time', days: null },
] as const

type RangeKey = (typeof RANGES)[number]['key']
const EARLIEST_KEY = '2000-01-01'

function hasAnyData(log: DailyLog): boolean {
  return (
    log.meals.length > 0 ||
    log.water.length > 0 ||
    log.manualProtein.length > 0 ||
    log.weightKg != null ||
    log.steps > 0 ||
    log.workout.status !== 'none' ||
    log.workout.exercises.length > 0 ||
    log.notes.trim() !== ''
  )
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-success-dim text-success',
  skipped: 'bg-danger-dim text-danger',
  none: 'bg-surface-3 text-text-tertiary',
}

export default function History() {
  const { goals } = useAppData()
  const [range, setRange] = useState<RangeKey>('30d')

  const rangeConfig = RANGES.find((r) => r.key === range)!
  const startDate = rangeConfig.days ? lastNDays(rangeConfig.days)[0] : EARLIEST_KEY
  const { logs, loading } = useDailyLogsRange(startDate, todayKey())

  const days = useMemo(() => logs.filter(hasAnyData).slice().reverse(), [logs])

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Every logged day, at a glance"
        action={
          <div className="flex items-center gap-1 rounded-full border border-border-soft bg-surface p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  range === r.key ? 'bg-surface-3 text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
          <Spinner /> Loading history…
        </div>
      ) : days.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock size={18} />}
            title="No history yet. Start logging today's data."
            action={
              <Link
                to="/"
                className="rounded-xl bg-surface-3 px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-3/70"
              >
                Go to Dashboard
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden !p-0 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-soft text-left text-xs text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Calories</th>
                  <th className="px-4 py-3 font-medium">Water</th>
                  <th className="px-4 py-3 font-medium">Protein</th>
                  <th className="px-4 py-3 font-medium">Weight</th>
                  <th className="px-4 py-3 font-medium">Workout</th>
                  <th className="px-4 py-3 font-medium">Steps</th>
                  <th className="w-8 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {days.map((log) => (
                  <tr key={log.date} className="border-b border-border-soft last:border-0 hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <Link to={`/?date=${log.date}`} className="font-medium text-text-primary hover:underline">
                        {isToday(log.date) ? 'Today' : formatShortDate(log.date)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-display text-text-secondary">
                      {totalCalories(log).toLocaleString()} / {goals.calories.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-display text-text-secondary">
                      {(totalWater(log) / 1000).toFixed(1)} / {(goals.waterMl / 1000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 font-display text-text-secondary">
                      {totalProtein(log)} / {goals.proteinG}
                    </td>
                    <td className="px-4 py-3 font-display text-text-secondary">
                      {log.weightKg != null ? `${log.weightKg} ${goals.weightUnit}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[log.workout.status]}`}>
                        {log.workout.status === 'none' ? 'Not logged' : log.workout.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-display text-text-secondary">
                      {log.steps > 0 ? log.steps.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/?date=${log.date}`} aria-label={`Open ${log.date}`}>
                        <ChevronRight size={16} className="text-text-tertiary" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile stacked cards */}
          <ul className="space-y-2 md:hidden">
            {days.map((log) => (
              <li key={log.date}>
                <Link
                  to={`/?date=${log.date}`}
                  className="block animate-fade-up rounded-card border border-border-soft bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-text-primary">
                      {isToday(log.date) ? 'Today' : formatShortDate(log.date)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[log.workout.status]}`}>
                      {log.workout.status === 'none' ? 'Not logged' : log.workout.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-text-secondary">
                    <div>
                      <p className="text-text-tertiary">Calories</p>
                      <p className="font-display text-text-primary">{totalCalories(log).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Water</p>
                      <p className="font-display text-text-primary">{(totalWater(log) / 1000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Protein</p>
                      <p className="font-display text-text-primary">{totalProtein(log)}g</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Weight</p>
                      <p className="font-display text-text-primary">{log.weightKg != null ? `${log.weightKg}${goals.weightUnit}` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-text-tertiary">Steps</p>
                      <p className="font-display text-text-primary">{log.steps > 0 ? log.steps.toLocaleString() : '—'}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
