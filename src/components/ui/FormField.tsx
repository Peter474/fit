import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  suffix?: ReactNode
}

export function FormField({ label, error, suffix, id, className = '', ...rest }: FormFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="mb-3">
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-success/40 ${
            error ? 'border-danger' : 'border-border-soft'
          } ${suffix ? 'pr-12' : ''} ${className}`}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
