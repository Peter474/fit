import { AlertTriangle } from 'lucide-react'

interface SetupNoticeProps {
  /** Pass the auth error message when Firebase IS configured but sign-in failed. */
  authError?: string | null
}

export function SetupNotice({ authError }: SetupNoticeProps) {
  if (authError) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-card border border-danger-dim bg-danger-dim/40 p-4 text-sm">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
        <div>
          <p className="font-medium text-text-primary">Signed in to Firebase failed</p>
          <p className="mt-1 text-text-secondary">
            Nothing you add or edit will be saved until this is fixed. The most common causes: the{' '}
            <strong className="text-text-primary">Anonymous</strong> sign-in provider isn't enabled in Firebase
            Console → Authentication → Sign-in method, or the config values don't match your project. Details:{' '}
            <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">{authError}</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-start gap-3 rounded-card border border-energy-dim bg-energy-dim/40 p-4 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-energy" />
      <div>
        <p className="font-medium text-text-primary">Firebase isn't configured yet</p>
        <p className="mt-1 text-text-secondary">
          Add your Firebase project keys as <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">VITE_FIREBASE_*</code>{' '}
          environment variables (locally in <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">.env.local</code>, or in
          your Vercel project's Environment Variables settings) and redeploy/restart. See{' '}
          <code className="rounded bg-surface-3 px-1 py-0.5 text-xs">README.md</code> for the exact steps — nothing you add or
          edit will be saved until then.
        </p>
      </div>
    </div>
  )
}
