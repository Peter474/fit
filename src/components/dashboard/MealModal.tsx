import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import type { MealEntry } from '@/types/tracking'

interface MealModalProps {
  open: boolean
  onClose: () => void
  onSave: (meal: Omit<MealEntry, 'id' | 'loggedAt'>) => Promise<void>
  initial?: MealEntry | null
}

interface FormState {
  name: string
  calories: string
  protein: string
  carbs: string
  fat: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', calories: '', protein: '', carbs: '', fat: '', notes: '' }

export function MealModal({ open, onClose, onSave, initial }: MealModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        name: initial.name,
        calories: String(initial.calories),
        protein: String(initial.proteinG),
        carbs: String(initial.carbsG),
        fat: String(initial.fatG),
        notes: initial.notes ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [open, initial])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Give this meal a name.'
    const calories = Number(form.calories)
    if (form.calories === '' || Number.isNaN(calories) || calories < 0) {
      next.calories = 'Enter a calorie amount of 0 or more.'
    }
    for (const [key, label] of [
      ['protein', 'Protein'],
      ['carbs', 'Carbs'],
      ['fat', 'Fat'],
    ] as const) {
      const raw = form[key]
      if (raw !== '') {
        const n = Number(raw)
        if (Number.isNaN(n) || n < 0) next[key] = `${label} can't be negative.`
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        calories: Number(form.calories),
        proteinG: form.protein ? Number(form.protein) : 0,
        carbsG: form.carbs ? Number(form.carbs) : 0,
        fatG: form.fat ? Number(form.fat) : 0,
        notes: form.notes.trim(),
      })
      onClose()
    } catch {
      // Error toast is already shown by the caller; keep the modal open
      // with the entered values so nothing the user typed is lost.
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={initial ? 'Edit meal' : 'Add calories'}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add meal'}
          </Button>
        </>
      }
    >
      <FormField
        label="Meal name"
        placeholder="Lunch"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
      <FormField
        label="Calories"
        type="number"
        inputMode="numeric"
        placeholder="700"
        suffix="kcal"
        value={form.calories}
        onChange={(e) => setForm({ ...form, calories: e.target.value })}
        error={errors.calories}
      />
      <div className="grid grid-cols-3 gap-2">
        <FormField
          label="Protein"
          type="number"
          inputMode="numeric"
          placeholder="45"
          suffix="g"
          value={form.protein}
          onChange={(e) => setForm({ ...form, protein: e.target.value })}
          error={errors.protein}
        />
        <FormField
          label="Carbs"
          type="number"
          inputMode="numeric"
          placeholder="80"
          suffix="g"
          value={form.carbs}
          onChange={(e) => setForm({ ...form, carbs: e.target.value })}
          error={errors.carbs}
        />
        <FormField
          label="Fat"
          type="number"
          inputMode="numeric"
          placeholder="20"
          suffix="g"
          value={form.fat}
          onChange={(e) => setForm({ ...form, fat: e.target.value })}
          error={errors.fat}
        />
      </div>
      <div className="mb-1">
        <label htmlFor="meal-notes" className="mb-1.5 block text-xs font-medium text-text-secondary">
          Notes (optional)
        </label>
        <textarea
          id="meal-notes"
          rows={2}
          className="w-full resize-none rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-success/40"
          placeholder="Anything worth remembering"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </Modal>
  )
}
