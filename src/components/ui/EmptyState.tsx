import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  action?: ReactNode
}

export function EmptyState({ icon, title, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 text-text-tertiary">
        {icon}
      </span>
      <p className="text-sm text-text-secondary">{title}</p>
      {action}
    </div>
  )
}
