import { useEffect, useState } from 'react'
import { Save, LogOut, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAppData } from '@/context/AppDataContext'
import type { Goals } from '@/types/tracking'

type FormState = Record<keyof Omit<Goals, 'weightUnit' | 'theme'>, string>

export default function Settings() {
  const { goals, goalsLoading, saveGoals, isAuthenticated, email, logout } = useAppData()
  const [form, setForm] = useState<FormState>({
    calories: String(goals.calories),
    waterMl: String(goals.waterMl),
    proteinG: String(goals.proteinG),
    steps: String(goals.steps),
  })
  const [weightUnit, setWeightUnit] = useState(goals.weightUnit)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    setForm({
      calories: String(goals.calories),
      waterMl: String(goals.waterMl),
      proteinG: String(goals.proteinG),
      steps: String(goals.steps),
    })
    setWeightUnit(goals.weightUnit)
  }, [goals])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    for (const key of Object.keys(form) as (keyof FormState)[]) {
      const n = Number(form[key])
      if (form[key].trim() === '' || Number.isNaN(n) || n <= 0) {
        next[key] = 'Enter a number greater than 0.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      await saveGoals({
        calories: Number(form.calories),
        waterMl: Number(form.waterMl),
        proteinG: Number(form.proteinG),
        steps: Number(form.steps),
        weightUnit,
        theme: 'dark',
      })
    } catch {
      // Error toast already shown by saveGoals.
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Goals, units and theme" />

      {goalsLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
          <Spinner /> Loading settings…
        </div>
      ) : (
        <div className="space-y-3">
          {isAuthenticated && (
            <Card className="animate-fade-up">
              <h2 className="mb-4 text-sm font-medium text-text-secondary">Account</h2>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-text-secondary">
                  <User size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{email}</span>
                <Button variant="secondary" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? <Spinner size={14} /> : <LogOut size={14} />}
                  Log out
                </Button>
              </div>
            </Card>
          )}

          <Card className="animate-fade-up">
            <h2 className="mb-4 text-sm font-medium text-text-secondary">Daily goals</h2>
            <FormField
              label="Calories"
              type="number"
              inputMode="numeric"
              suffix="kcal"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              error={errors.calories}
            />
            <FormField
              label="Water"
              type="number"
              inputMode="numeric"
              suffix="ml"
              value={form.waterMl}
              onChange={(e) => setForm({ ...form, waterMl: e.target.value })}
              error={errors.waterMl}
            />
            <FormField
              label="Protein"
              type="number"
              inputMode="numeric"
              suffix="g"
              value={form.proteinG}
              onChange={(e) => setForm({ ...form, proteinG: e.target.value })}
              error={errors.proteinG}
            />
            <FormField
              label="Steps"
              type="number"
              inputMode="numeric"
              suffix="steps"
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
              error={errors.steps}
            />
          </Card>

          <Card className="animate-fade-up">
            <h2 className="mb-4 text-sm font-medium text-text-secondary">Units &amp; appearance</h2>
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium text-text-secondary">Weight unit</p>
              <div className="flex gap-2">
                {(['kg', 'lb'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setWeightUnit(unit)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      weightUnit === unit ? 'bg-success text-bg' : 'bg-surface-2 text-text-primary hover:bg-surface-3'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-secondary">Theme</p>
              <div className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
                <span className="text-sm text-text-primary">Dark</span>
                <span className="text-xs text-text-tertiary">Light theme coming soon</span>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : (
              <>
                <Save size={16} /> Save settings
              </>
            )}
          </Button>
          <p className="text-center text-xs text-text-tertiary">
            Changing a goal only affects targets going forward — your logged food, water and weight history stays exactly as recorded.
          </p>
        </div>
      )}
    </div>
  )
}
