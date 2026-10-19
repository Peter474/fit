import { useState } from 'react'
import { Dumbbell, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ExerciseModal } from '@/components/workouts/ExerciseModal'
import { useDailyLog } from '@/hooks/useDailyLog'
import { useDailyLogsRange } from '@/hooks/useDailyLogsRange'
import { todayKey, addDays, formatDateLabel, isToday, lastNDays, formatShortDate } from '@/lib/date'
import type { Exercise, WorkoutStatus } from '@/types/tracking'

const STATUS_STYLES: Record<WorkoutStatus, string> = {
  completed: 'bg-success-dim text-success',
  skipped: 'bg-danger-dim text-danger',
  none: 'bg-surface-3 text-text-tertiary',
}

export default function Workouts() {
  const [date, setDate] = useState(todayKey())
  const { log, loading, saving, saveWorkout } = useDailyLog(date)
  const [nameDraft, setNameDraft] = useState('')
  const [nameEditing, setNameEditing] = useState(false)
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

  const rangeStart = lastNDays(30)[0]
  const { logs: recentLogs, loading: historyLoading } = useDailyLogsRange(rangeStart, todayKey())
  const workoutDays = recentLogs.filter((l) => l.workout.exercises.length > 0 || l.workout.status !== 'none').reverse()

  function newId() {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  function handleSaveName() {
    saveWorkout({ ...log.workout, name: nameDraft.trim() }).catch(() => {})
    setNameEditing(false)
  }

  function handleAddExercise(exercise: Omit<Exercise, 'id'>) {
    const entry: Exercise = { ...exercise, id: newId() }
    saveWorkout({ ...log.workout, exercises: [...log.workout.exercises, entry] }).catch(() => {})
  }

  function handleUpdateExercise(id: string, exercise: Omit<Exercise, 'id'>) {
    saveWorkout({
      ...log.workout,
      exercises: log.workout.exercises.map((ex) => (ex.id === id ? { ...ex, ...exercise } : ex)),
    }).catch(() => {})
  }

  function handleDeleteExercise(id: string) {
    saveWorkout({ ...log.workout, exercises: log.workout.exercises.filter((ex) => ex.id !== id) }).catch(() => {})
  }

  function handleMarkStatus(status: WorkoutStatus) {
    saveWorkout({ ...log.workout, status: log.workout.status === status ? 'none' : status }).catch(() => {})
  }

  return (
    <div>
      <PageHeader
        title="Workouts"
        subtitle="Log sets, reps and weight"
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
              {isToday(date) ? 'Today' : formatShortDate(date)}
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

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
          <Spinner /> Loading workout…
        </div>
      ) : (
        <Card className="animate-fade-up">
          <p className="mb-1 text-xs text-text-tertiary">{formatDateLabel(date)}</p>
          {nameEditing ? (
            <div className="flex items-end gap-2">
              <FormField
                label="Workout name"
                placeholder="Push"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="mb-0"
                autoFocus
              />
              <Button onClick={handleSaveName} className="mb-3 shrink-0 !px-3 !py-2.5">
                Save
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNameDraft(log.workout.name)
                setNameEditing(true)
              }}
              className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-text-primary hover:text-success"
            >
              {log.workout.name || 'Untitled workout'} <Pencil size={15} className="text-text-tertiary" />
            </button>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleMarkStatus('completed')}
              disabled={saving}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                log.workout.status === 'completed' ? 'bg-success text-bg' : 'bg-surface-2 text-text-primary hover:bg-surface-3'
              }`}
            >
              Mark completed
            </button>
            <button
              type="button"
              onClick={() => handleMarkStatus('skipped')}
              disabled={saving}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                log.workout.status === 'skipped' ? 'bg-danger text-bg' : 'bg-surface-2 text-text-primary hover:bg-surface-3'
              }`}
            >
              Mark skipped
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Exercises</h3>
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 text-xs"
              onClick={() => {
                setEditingExercise(null)
                setExerciseModalOpen(true)
              }}
            >
              <Plus size={14} /> Add exercise
            </Button>
          </div>

          {log.workout.exercises.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={18} />}
              title="No exercises added yet."
              action={
                <Button
                  variant="secondary"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => {
                    setEditingExercise(null)
                    setExerciseModalOpen(true)
                  }}
                >
                  Add your first exercise
                </Button>
              }
            />
          ) : (
            <ul className="mt-3 space-y-1.5">
              {log.workout.exercises.map((ex) => (
                <li key={ex.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/60 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{ex.name}</p>
                    <p className="text-xs text-text-tertiary">
                      {ex.sets} × {ex.reps} · {ex.weightKg} kg
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExercise(ex)
                        setExerciseModalOpen(true)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-3 hover:text-text-primary"
                      aria-label="Edit exercise"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-danger-dim hover:text-danger"
                      aria-label="Delete exercise"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-text-secondary">Recent workouts</h2>
        {historyLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
            <Spinner /> Loading history…
          </div>
        ) : workoutDays.length === 0 ? (
          <Card>
            <EmptyState icon={<Dumbbell size={18} />} title="No workouts recorded yet." />
          </Card>
        ) : (
          <ul className="space-y-2">
            {workoutDays.map((l) => (
              <li key={l.date}>
                <button
                  type="button"
                  onClick={() => setDate(l.date)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    l.date === date ? 'border-success/40 bg-success-dim/30' : 'border-border-soft bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{l.workout.name || 'Untitled workout'}</p>
                    <p className="text-xs text-text-tertiary">
                      {formatShortDate(l.date)} · {l.workout.exercises.length} exercise
                      {l.workout.exercises.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[l.workout.status]}`}>
                    {l.workout.status === 'none' ? 'Not logged' : l.workout.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ExerciseModal
        open={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        initial={editingExercise}
        onSave={(ex) => (editingExercise ? handleUpdateExercise(editingExercise.id, ex) : handleAddExercise(ex))}
      />
    </div>
  )
}
