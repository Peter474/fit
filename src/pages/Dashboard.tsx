import { Flame, Droplets, Beef, Footprints, Dumbbell, Scale, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { RingStatCard } from '@/components/ui/RingStatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'

// Static preview data for Phase 1 (UI shell only).
// Real logging + IndexedDB persistence lands in Phases 3–11.
const PREVIEW = {
  calories: { value: 1650, target: 2200 },
  water: { value: 2400, target: 4000 },
  protein: { value: 150, target: 170 },
  steps: { value: 7420, target: 10000 },
  weight: 92.5,
  workout: { name: 'PUSH', status: 'completed' as const },
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const summaryPercent = Math.round(
    ((PREVIEW.calories.value / PREVIEW.calories.target) * 0.3 +
      (PREVIEW.water.value / PREVIEW.water.target) * 0.25 +
      (PREVIEW.protein.value / PREVIEW.protein.target) * 0.25 +
      (PREVIEW.steps.value / PREVIEW.steps.target) * 0.2) *
      100,
  )

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={todayLabel()}
        action={
          <div className="flex items-center gap-1 rounded-full border border-border-soft bg-surface p-1">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 text-xs font-medium text-text-secondary">Today</span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="Next day"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      {/* Primary ring stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <RingStatCard
          label="Calories"
          icon={<Flame size={15} strokeWidth={2.25} />}
          value={PREVIEW.calories.value}
          target={PREVIEW.calories.target}
          unit="kcal"
          color="var(--color-energy)"
          colorDim="var(--color-energy-dim)"
        />
        <RingStatCard
          label="Water"
          icon={<Droplets size={15} strokeWidth={2.25} />}
          value={PREVIEW.water.value}
          target={PREVIEW.water.target}
          unit="ml"
          color="var(--color-hydration)"
          colorDim="var(--color-hydration-dim)"
        />
        <RingStatCard
          label="Protein"
          icon={<Beef size={15} strokeWidth={2.25} />}
          value={PREVIEW.protein.value}
          target={PREVIEW.protein.target}
          unit="g"
          color="var(--color-protein)"
          colorDim="var(--color-protein-dim)"
        />
        <RingStatCard
          label="Steps"
          icon={<Footprints size={15} strokeWidth={2.25} />}
          value={PREVIEW.steps.value}
          target={PREVIEW.steps.target}
          unit=""
          color="var(--color-steps)"
          colorDim="var(--color-steps-dim)"
        />
      </div>

      {/* Weight + workout */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="animate-fade-up">
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 text-text-primary">
              <Scale size={15} strokeWidth={2.25} />
            </span>
            Weight
          </div>
          <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
            {PREVIEW.weight}
            <span className="ml-1 text-base font-medium text-text-tertiary">kg</span>
          </p>
          <p className="mt-1 text-xs text-text-tertiary">Last logged today</p>
        </Card>

        <Card className="animate-fade-up">
          <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-dim text-success">
              <Dumbbell size={15} strokeWidth={2.25} />
            </span>
            Today's workout
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-display text-xl font-semibold tracking-tight text-text-primary">
              {PREVIEW.workout.name}
            </p>
            <span className="rounded-full bg-success-dim px-2.5 py-1 text-xs font-medium capitalize text-success">
              {PREVIEW.workout.status}
            </span>
          </div>
        </Card>
      </div>

      {/* Daily summary */}
      <Card className="mt-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">Today's progress</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-text-primary">
              {summaryPercent}%
            </p>
          </div>
          <p className="max-w-[9rem] text-right text-xs leading-relaxed text-text-tertiary">
            A personal progress indicator, not a health score.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <SummaryRow label="Calories" value={PREVIEW.calories.value} target={PREVIEW.calories.target} unit="kcal" color="var(--color-energy)" />
          <SummaryRow label="Water" value={PREVIEW.water.value} target={PREVIEW.water.target} unit="ml" color="var(--color-hydration)" />
          <SummaryRow label="Protein" value={PREVIEW.protein.value} target={PREVIEW.protein.target} unit="g" color="var(--color-protein)" />
          <SummaryRow label="Steps" value={PREVIEW.steps.value} target={PREVIEW.steps.target} unit="" color="var(--color-steps)" />
        </div>
      </Card>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string
  value: number
  target: number
  unit: string
  color: string
}) {
  const percent = (value / target) * 100
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-display text-text-tertiary">
          {value.toLocaleString()} / {target.toLocaleString()} {unit}
        </span>
      </div>
      <ProgressBar percent={percent} color={color} height={6} />
    </div>
  )
}
