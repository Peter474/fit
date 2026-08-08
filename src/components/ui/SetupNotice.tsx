import { AlertTriangle } from 'lucide-react'

export function SetupNotice() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-card border border-energy-dim bg-energy-dim/40 p-4 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-energy" />
      <div>
        <p className="font-medium text-text-primary">Firebase isn't configured yet</p>
        <p className="mt-1 text-text-secondary">
          Add your Firebase project keys to <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">.env.local</code> and
          restart the dev server. See <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">README.md</code> for the
          exact steps — nothing you add or edit will be saved until then.
        </p>
      </div>
    </div>
  )
}
