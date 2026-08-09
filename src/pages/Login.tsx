import { useState, type FormEvent } from 'react'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Spinner } from '@/components/ui/Spinner'
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/firebase'
import { getAuthErrorMessage } from '@/lib/authErrors'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.4 36 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  const busy = submitting || googleSubmitting

  function validate(): boolean {
    const next: typeof fieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'

    if (!password) next.password = 'Enter your password.'
    else if (mode === 'signup' && password.length < 6) next.password = 'Use at least 6 characters.'

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password)
      } else {
        await signInWithEmail(email.trim(), password)
      }
      // On success, AppDataContext's auth listener picks up the new user
      // automatically — nothing else to do here.
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    if (busy) return
    setFormError(null)
    setGoogleSubmitting(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setGoogleSubmitting(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setFormError(null)
    setFieldErrors({})
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-8 flex flex-col items-center gap-2.5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-dim text-success">
            <Activity size={22} strokeWidth={2.25} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-text-primary">FitTrack</span>
          <p className="text-sm text-text-secondary">
            {mode === 'login' ? 'Log in to your account' : 'Create your account'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={busy}
            />
            <FormField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={busy}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="text-text-tertiary transition-colors hover:text-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              suffixInteractive
            />

            {formError && (
              <p className="mb-3 rounded-xl border border-danger-dim bg-danger-dim/40 px-3 py-2 text-xs text-danger">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {submitting ? (
                <>
                  <Spinner size={14} /> {mode === 'login' ? 'Logging in…' : 'Creating account…'}
                </>
              ) : mode === 'login' ? (
                'Log in'
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border-soft" />
            <span className="text-xs text-text-tertiary">or</span>
            <span className="h-px flex-1 bg-border-soft" />
          </div>

          <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} disabled={busy}>
            {googleSubmitting ? <Spinner size={14} /> : <GoogleIcon />}
            Continue with Google
          </Button>
        </Card>

        <p className="mt-5 text-center text-sm text-text-secondary">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            disabled={busy}
            className="font-medium text-text-primary underline decoration-border-soft underline-offset-4 hover:decoration-text-primary disabled:opacity-50"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
