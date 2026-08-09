import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import type { Exercise } from '@/types/tracking'

interface ExerciseModalProps {
  open: boolean
  onClose: () => void
  onSave: (exercise: Omit<Exercise, 'id'>) => void
  initial?: Exercise | null
}

interface FormState {
  name: string
  sets: string
  reps: string
  weight: string
  notes: string
}

const EMPTY: FormState = { name: '', sets: '', reps: '', weight: '', notes: '' }

export function ExerciseModal({ open, onClose, onSave, initial }: ExerciseModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? {
            name: initial.name,
            sets: String(initial.sets),
            reps: String(initial.reps),
            weight: String(initial.weightKg),
            notes: initial.notes ?? '',
          }
        : EMPTY,
    )
    setErrors({})
  }, [open, initial])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Name this exercise.'
    for (const key of ['sets', 'reps'] as const) {
      const n = Number(form[key])
      if (form[key].trim() === '' || Number.isNaN(n) || n <= 0 || !Number.isInteger(n)) {
        next[key] = 'Whole number greater than 0.'
      }
    }
    const w = Number(form.weight)
    if (form.weight.trim() === '' || Number.isNaN(w) || w < 0) next.weight = "Can't be negative."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave({
      name: form.name.trim(),
      sets: Number(form.sets),
      reps: Number(form.reps),
      weightKg: Number(form.weight),
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal
      title={initial ? 'Edit exercise' : 'Add exercise'}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {initial ? 'Save changes' : 'Add exercise'}
          </Button>
        </>
      }
    >
      <FormField
        label="Exercise name"
        placeholder="Bench Press"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <div className="grid grid-cols-3 gap-2">
        <FormField
          label="Sets"
          type="number"
          inputMode="numeric"
          placeholder="4"
          value={form.sets}
          onChange={(e) => setForm({ ...form, sets: e.target.value })}
          error={errors.sets}
        />
        <FormField
          label="Reps"
          type="number"
          inputMode="numeric"
          placeholder="8"
          value={form.reps}
          onChange={(e) => setForm({ ...form, reps: e.target.value })}
          error={errors.reps}
        />
        <FormField
          label="Weight"
          type="number"
          inputMode="decimal"
          placeholder="25"
          suffix="kg"
          value={form.weight}
          onChange={(e) => setForm({ ...form, weight: e.target.value })}
          error={errors.weight}
        />
      </div>
      <div className="mb-1">
        <label htmlFor="exercise-notes" className="mb-1.5 block text-xs font-medium text-text-secondary">
          Notes (optional)
        </label>
        <textarea
          id="exercise-notes"
          rows={2}
          className="w-full resize-none rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-success/40"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </Modal>
  )
}
