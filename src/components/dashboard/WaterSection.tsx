import { useState } from 'react'
import { Droplets, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatTime } from '@/lib/date'
import type { WaterEntry } from '@/types/tracking'

const QUICK_AMOUNTS = [250, 500, 750, 1000]

interface WaterSectionProps {
  entries: WaterEntry[]
  onAdd: (amountMl: number) => Promise<void>
  onDelete: (id: string) => Promise<void>
  saving: boolean
}

export function WaterSection({ entries, onAdd, onDelete, saving }: WaterSectionProps) {
  const [custom, setCustom] = useState('')
  const [pending, setPending] = useState<number | null>(null)
  const [error, setError] = useState<string | undefined>()

  async function handleQuickAdd(amount: number) {
    setPending(amount)
    try {
      await onAdd(amount)
    } catch {
      // Error toast already shown by the caller.
    } finally {
      setPending(null)
    }
  }

  async function handleCustomAdd() {
    const n = Number(custom)
    if (custom.trim() === '' || Number.isNaN(n) || n <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    setError(undefined)
    setPending(-1)
    try {
      await onAdd(Math.round(n))
      setCustom('')
    } catch {
      // Error toast already shown by the caller; keep the typed amount.
    } finally {
      setPending(null)
    }
  }

  const sorted = [...entries].sort((a, b) => b.loggedAt - a.loggedAt)

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-hydration-dim text-hydration">
          <Droplets size={15} strokeWidth={2.25} />
        </span>
        Water log
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickAdd(amt)}
            disabled={saving}
            className="rounded-full border border-border-soft bg-surface-2 px-3.5 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-3 disabled:opacity-50"
          >
            {pending === amt ? '…' : `+${amt >= 1000 ? '1 L' : `${amt} ml`}`}
          </button>
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom amount (ml)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-hydration/40"
        />
        <Button variant="secondary" onClick={handleCustomAdd} disabled={saving}>
          <Plus size={16} />
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}

      <div className="mt-4">
        {sorted.length === 0 ? (
          <EmptyState icon={<Droplets size={18} />} title="No water logged yet today." />
        ) : (
          <ul className="space-y-1.5">
            {sorted.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl bg-surface-2/60 px-3 py-2 text-sm"
              >
                <span className="text-text-tertiary">{formatTime(entry.loggedAt)}</span>
                <span className="font-display font-medium text-text-primary">{entry.amountMl} ml</span>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id).catch(() => {})}
                  className="text-text-tertiary transition-colors hover:text-danger"
                  aria-label="Delete water entry"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
