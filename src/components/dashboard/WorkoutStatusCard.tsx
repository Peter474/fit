import { Link } from 'react-router-dom'
import { Dumbbell, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Workout } from '@/types/tracking'

interface WorkoutStatusCardProps {
  workout: Workout
  onMark: (status: 'completed' | 'skipped') => Promise<void>
  saving: boolean
}

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-success-dim text-success',
  skipped: 'bg-danger-dim text-danger',
  none: 'bg-surface-3 text-text-tertiary',
}

export function WorkoutStatusCard({ workout, onMark, saving }: WorkoutStatusCardProps) {
  const hasExercises = workout.exercises.length > 0

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-dim text-success">
            <Dumbbell size={15} strokeWidth={2.25} />
          </span>
          Today's workout
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[workout.status]}`}>
          {workout.status === 'none' ? 'Not logged' : workout.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold tracking-tight text-text-primary">
            {workout.name || 'No workout yet'}
          </p>
          <p className="text-xs text-text-tertiary">
            {hasExercises ? `${workout.exercises.length} exercise${workout.exercises.length > 1 ? 's' : ''}` : 'Add exercises on the Workouts page'}
          </p>
        </div>
        <Link
          to="/workouts"
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          {hasExercises ? 'Edit' : 'Add workout'} <ChevronRight size={14} />
        </Link>
      </div>

      {hasExercises && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onMark('completed').catch(() => {})}
            disabled={saving}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
              workout.status === 'completed' ? 'bg-success text-bg' : 'bg-surface-2 text-text-primary hover:bg-surface-3'
            }`}
          >
            Mark completed
          </button>
          <button
            type="button"
            onClick={() => onMark('skipped').catch(() => {})}
            disabled={saving}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
              workout.status === 'skipped' ? 'bg-danger text-bg' : 'bg-surface-2 text-text-primary hover:bg-surface-3'
            }`}
          >
            Mark skipped
          </button>
        </div>
      )}
    </Card>
  )
}
