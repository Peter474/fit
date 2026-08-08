import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Flame, Droplets, Beef, Footprints, Scale, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { RingStatCard } from '@/components/ui/RingStatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { SetupNotice } from '@/components/ui/SetupNotice'
import { MealModal } from '@/components/dashboard/MealModal'
import { NumberEntryModal } from '@/components/dashboard/NumberEntryModal'
import { WaterSection } from '@/components/dashboard/WaterSection'
import { MealsSection } from '@/components/dashboard/MealsSection'
import { WorkoutStatusCard } from '@/components/dashboard/WorkoutStatusCard'
import { NotesCard } from '@/components/dashboard/NotesCard'
import { useAppData } from '@/context/AppDataContext'
import { useDailyLog } from '@/hooks/useDailyLog'
import { todayKey, addDays, formatDateLabel, isToday } from '@/lib/date'
import { totalCalories, totalWater, totalProtein, type MealEntry } from '@/types/tracking'

export default function Dashboard() {
  const { configured, goals, goalsLoading } = useAppData()
  const [searchParams] = useSearchParams()
  const [date, setDate] = useState(() => {
    const fromUrl = searchParams.get('date')
    return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : todayKey()
  })
  const {
    log,
    loading,
    saving,
    addMeal,
    updateMeal,
    deleteMeal,
    addWater,
    deleteWater,
    addManualProtein,
    setWeight,
    setSteps,
    saveWorkout,
    saveNotes,
  } = useDailyLog(date)

  const [mealModalOpen, setMealModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [stepsModalOpen, setStepsModalOpen] = useState(false)
  const [proteinModalOpen, setProteinModalOpen] = useState(false)

  const calories = totalCalories(log)
  const water = totalWater(log)
  const protein = totalProtein(log)
  const summaryPercent = Math.round(
    ((goals.calories > 0 ? Math.min(calories / goals.calories, 1) : 0) * 0.3 +
      (goals.waterMl > 0 ? Math.min(water / goals.waterMl, 1) : 0) * 0.25 +
      (goals.proteinG > 0 ? Math.min(protein / goals.proteinG, 1) : 0) * 0.25 +
      (goals.steps > 0 ? Math.min(log.steps / goals.steps, 1) : 0) * 0.2) *
      100,
  )

  function openAddMeal() {
    setEditingMeal(null)
    setMealModalOpen(true)
  }

  function openEditMeal(meal: MealEntry) {
    setEditingMeal(meal)
    setMealModalOpen(true)
  }

  const isLoading = loading || goalsLoading

  return (
    <div>
      {!configured && <SetupNotice />}

      <PageHeader
        title="Dashboard"
        subtitle={formatDateLabel(date)}
        action={
          <div className="flex items-center gap-1 rounded-full border border-border-soft bg-surface p-1">
            <button
              type="button"
              onClick={() => setDate((d) => addDays(d, -1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-1 text-xs font-medium text-text-secondary">
              {isToday(date) ? 'Today' : formatDateLabel(date).split(' · ')[0]}
            </span>
            <button
              type="button"
              onClick={() => setDate((d) => addDays(d, 1))}
              disabled={isToday(date)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-tertiary/40 disabled:hover:bg-transparent"
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
          <Spinner /> Loading dashboard…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <RingStatCard
              label="Calories"
              icon={<Flame size={15} strokeWidth={2.25} />}
              value={calories}
              target={goals.calories}
              unit="kcal"
              color="var(--color-energy)"
              colorDim="var(--color-energy-dim)"
              onAdd={openAddMeal}
              addLabel="Add calories"
            />
            <RingStatCard
              label="Water"
              icon={<Droplets size={15} strokeWidth={2.25} />}
              value={water}
              target={goals.waterMl}
              unit="ml"
              color="var(--color-hydration)"
              colorDim="var(--color-hydration-dim)"
            />
            <RingStatCard
              label="Protein"
              icon={<Beef size={15} strokeWidth={2.25} />}
              value={protein}
              target={goals.proteinG}
              unit="g"
              color="var(--color-protein)"
              colorDim="var(--color-protein-dim)"
              onAdd={() => setProteinModalOpen(true)}
              addLabel="Add protein"
            />
            <RingStatCard
              label="Steps"
              icon={<Footprints size={15} strokeWidth={2.25} />}
              value={log.steps}
              target={goals.steps}
              unit=""
              color="var(--color-steps)"
              colorDim="var(--color-steps-dim)"
              onAdd={() => setStepsModalOpen(true)}
              addLabel="Log steps"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card className="animate-fade-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 text-text-primary">
                    <Scale size={15} strokeWidth={2.25} />
                  </span>
                  Weight
                </div>
                <button
                  type="button"
                  onClick={() => setWeightModalOpen(true)}
                  className="text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  {log.weightKg != null ? 'Update' : 'Log weight'}
                </button>
              </div>
              {log.weightKg != null ? (
                <>
                  <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-text-primary">
                    {log.weightKg}
                    <span className="ml-1 text-base font-medium text-text-tertiary">{goals.weightUnit}</span>
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Last logged {log.weightLoggedAt ? new Date(log.weightLoggedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}
                  </p>
                </>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-text-secondary">No weight logged for this day.</p>
                  <button
                    type="button"
                    onClick={() => setWeightModalOpen(true)}
                    className="mt-2 text-xs font-medium text-hydration hover:underline"
                  >
                    Add today's weight
                  </button>
                </div>
              )}
            </Card>

            <WorkoutStatusCard
              workout={log.workout}
              saving={saving}
              onMark={(status) => saveWorkout({ ...log.workout, status })}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <MealsSection meals={log.meals} onAdd={openAddMeal} onEdit={openEditMeal} onDelete={deleteMeal} />
            <WaterSection entries={log.water} onAdd={addWater} onDelete={deleteWater} saving={saving} />
          </div>

          <div className="mt-3">
            <NotesCard notes={log.notes} onSave={saveNotes} />
          </div>

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
              <SummaryRow label="Calories" value={calories} target={goals.calories} unit="kcal" color="var(--color-energy)" />
              <SummaryRow label="Water" value={water} target={goals.waterMl} unit="ml" color="var(--color-hydration)" />
              <SummaryRow label="Protein" value={protein} target={goals.proteinG} unit="g" color="var(--color-protein)" />
              <SummaryRow label="Steps" value={log.steps} target={goals.steps} unit="" color="var(--color-steps)" />
            </div>
          </Card>
        </>
      )}

      <MealModal
        open={mealModalOpen}
        onClose={() => setMealModalOpen(false)}
        initial={editingMeal}
        onSave={(meal) => (editingMeal ? updateMeal(editingMeal.id, meal) : addMeal(meal))}
      />
      <NumberEntryModal
        open={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSave={setWeight}
        title="Log weight"
        label="Weight"
        suffix={goals.weightUnit}
        initialValue={log.weightKg}
        allowDecimal
        min={1}
      />
      <NumberEntryModal
        open={stepsModalOpen}
        onClose={() => setStepsModalOpen(false)}
        onSave={setSteps}
        title="Log steps"
        label="Steps"
        suffix="steps"
        initialValue={log.steps || null}
      />
      <NumberEntryModal
        open={proteinModalOpen}
        onClose={() => setProteinModalOpen(false)}
        onSave={(n) => addManualProtein(n)}
        title="Add protein"
        label="Protein"
        suffix="g"
      />
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
  const percent = target > 0 ? (value / target) * 100 : 0
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
