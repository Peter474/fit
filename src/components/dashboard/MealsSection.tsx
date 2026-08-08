import { useState } from 'react'
import { Flame, Pencil, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import type { MealEntry } from '@/types/tracking'

interface MealsSectionProps {
  meals: MealEntry[]
  onAdd: () => void
  onEdit: (meal: MealEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function MealsSection({ meals, onAdd, onEdit, onDelete }: MealsSectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const sorted = [...meals].sort((a, b) => b.loggedAt - a.loggedAt)
  const total = meals.reduce((sum, m) => sum + m.calories, 0)

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-energy-dim text-energy">
            <Flame size={15} strokeWidth={2.25} />
          </span>
          Today's meals
        </div>
        <Button variant="secondary" onClick={onAdd} className="!px-3 !py-1.5 text-xs">
          <Plus size={14} /> Add
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Flame size={18} />}
          title="No meals logged yet."
          action={
            <Button variant="secondary" onClick={onAdd} className="!px-3 !py-1.5 text-xs">
              Add your first meal
            </Button>
          }
        />
      ) : (
        <ul className="mt-3 space-y-1.5">
          {sorted.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{meal.name}</p>
                <p className="text-xs text-text-tertiary">
                  {meal.calories} kcal
                  {meal.proteinG ? ` · ${meal.proteinG}g protein` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(meal)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-3 hover:text-text-primary"
                  aria-label="Edit meal"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(meal.id)}
                  disabled={deletingId === meal.id}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-danger-dim hover:text-danger disabled:opacity-50"
                  aria-label="Delete meal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {sorted.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3 text-sm">
          <span className="text-text-secondary">Total</span>
          <span className="font-display font-semibold text-text-primary">{total.toLocaleString()} kcal</span>
        </div>
      )}
    </Card>
  )
}
