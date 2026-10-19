import { useMemo, useState } from 'react'
import { Scale, Flame, Droplets, Beef, Footprints, Dumbbell } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard'
import { TrendBarChart } from '@/components/analytics/TrendBarChart'
import { WeightLineChart } from '@/components/analytics/WeightLineChart'
import { WorkoutFrequencyChart } from '@/components/analytics/WorkoutFrequencyChart'
import { useAppData } from '@/context/AppDataContext'
import { useDailyLogsRange } from '@/hooks/useDailyLogsRange'
import { todayKey, lastNDays } from '@/lib/date'
import { totalCalories, totalWater, totalProtein } from '@/types/tracking'

const RANGES = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '3 months', days: 90 },
  { key: 'all', label: 'All time', days: null },
] as const

type RangeKey = (typeof RANGES)[number]['key']

const EARLIEST_KEY = '2000-01-01'

function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export default function Analytics() {
  const { goals } = useAppData()
  const [range, setRange] = useState<RangeKey>('30d')

  const rangeConfig = RANGES.find((r) => r.key === range)!
  const startDate = rangeConfig.days ? lastNDays(rangeConfig.days)[0] : EARLIEST_KEY
  const { logs, loading } = useDailyLogsRange(startDate, todayKey())

  const { caloriesData, waterData, proteinData, stepsData, weightData, workoutCounts } = useMemo(() => {
    const calories = logs.filter((l) => l.meals.length > 0).map((l) => ({ date: l.date, value: totalCalories(l) }))
    const water = logs.filter((l) => l.water.length > 0).map((l) => ({ date: l.date, value: totalWater(l) }))
    const protein = logs.filter((l) => totalProtein(l) > 0).map((l) => ({ date: l.date, value: totalProtein(l) }))
    const steps = logs.filter((l) => l.steps > 0).map((l) => ({ date: l.date, value: l.steps }))
    const weight = logs
      .filter((l) => l.weightKg != null)
      .map((l) => ({ date: l.date, weightKg: l.weightKg as number }))

    let completed = 0
    let skipped = 0
    for (const l of logs) {
      if (l.workout.status === 'completed') completed++
      else if (l.workout.status === 'skipped') skipped++
    }

    return {
      caloriesData: calories,
      waterData: water,
      proteinData: protein,
      stepsData: steps,
      weightData: weight,
      workoutCounts: { completed, skipped, notLogged: Math.max(logs.length - completed - skipped, 0) },
    }
  }, [logs])

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Trends across time"
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
          <Spinner /> Loading analytics…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <AnalyticsCard
              title="Weight"
              icon={<Scale size={15} strokeWidth={2.25} />}
              hasData={weightData.length >= 2}
              stat={weightData.length >= 2 ? `${weightData[weightData.length - 1].weightKg} ${goals.weightUnit}` : undefined}
              emptyMessage="Log your weight on a couple more days to see a trend line here."
            >
              <WeightLineChart data={weightData} unit={goals.weightUnit} />
            </AnalyticsCard>
          </div>

          <AnalyticsCard
            title="Calories"
            icon={<Flame size={15} strokeWidth={2.25} />}
            hasData={caloriesData.length > 0}
            stat={caloriesData.length > 0 ? `${average(caloriesData.map((d) => d.value)).toLocaleString()} kcal avg` : undefined}
          >
            <TrendBarChart data={caloriesData} color="var(--color-energy)" unit="kcal" goal={goals.calories} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Water"
            icon={<Droplets size={15} strokeWidth={2.25} />}
            hasData={waterData.length > 0}
            stat={waterData.length > 0 ? `${average(waterData.map((d) => d.value)).toLocaleString()} ml avg` : undefined}
          >
            <TrendBarChart data={waterData} color="var(--color-hydration)" unit="ml" goal={goals.waterMl} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Protein"
            icon={<Beef size={15} strokeWidth={2.25} />}
            hasData={proteinData.length > 0}
            stat={proteinData.length > 0 ? `${average(proteinData.map((d) => d.value))} g avg` : undefined}
          >
            <TrendBarChart data={proteinData} color="var(--color-protein)" unit="g" goal={goals.proteinG} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Steps"
            icon={<Footprints size={15} strokeWidth={2.25} />}
            hasData={stepsData.length > 0}
            stat={stepsData.length > 0 ? `${average(stepsData.map((d) => d.value)).toLocaleString()} avg` : undefined}
          >
            <TrendBarChart data={stepsData} color="var(--color-steps)" unit="steps" goal={goals.steps} />
          </AnalyticsCard>

          <div className="md:col-span-2">
            <AnalyticsCard
              title="Workout frequency"
              icon={<Dumbbell size={15} strokeWidth={2.25} />}
              hasData={logs.length > 0}
              stat={logs.length > 0 ? `${workoutCounts.completed}/${logs.length} completed` : undefined}
            >
              <WorkoutFrequencyChart {...workoutCounts} />
            </AnalyticsCard>
          </div>
        </div>
      )}
    </div>
  )
}
