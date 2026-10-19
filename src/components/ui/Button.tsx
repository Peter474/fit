import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-success text-bg hover:brightness-110 disabled:opacity-50',
  secondary: 'bg-surface-3 text-text-primary hover:bg-surface-3/70 disabled:opacity-50',
  ghost: 'text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-50',
  danger: 'bg-danger-dim text-danger hover:bg-danger/20 disabled:opacity-50',
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
