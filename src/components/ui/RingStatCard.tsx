import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Card } from './Card'
import { ProgressRing } from './ProgressRing'

interface RingStatCardProps {
  label: string
  icon: ReactNode
  value: number
  target: number
  unit: string
  color: string
  colorDim: string
  formatValue?: (n: number) => string
  onAdd?: () => void
  addLabel?: string
}

export function RingStatCard({
  label,
  icon,
  value,
  target,
  unit,
  color,
  colorDim,
  formatValue = (n) => n.toLocaleString(),
  onAdd,
  addLabel = 'Add',
}: RingStatCardProps) {
  const percent = target > 0 ? (value / target) * 100 : 0
  const remaining = Math.max(target - value, 0)

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: colorDim, color }}
          >
            {icon}
          </span>
          {label}
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={addLabel}
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-3 hover:text-text-primary"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ProgressRing percent={percent} color={color} size={64} strokeWidth={6}>
          <span className="font-display text-[11px] font-semibold" style={{ color }}>
            {Math.round(Math.min(percent, 100))}%
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight tracking-tight text-text-primary whitespace-nowrap">
            {formatValue(value)}
            <span className="ml-1 text-xs font-medium text-text-tertiary">{unit}</span>
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[11px] text-text-tertiary">
            of {formatValue(target)} {unit}
          </p>
          <p className="mt-1 whitespace-nowrap text-[11px] text-text-tertiary/80">
            {remaining > 0 ? `${formatValue(remaining)} left` : 'Goal reached'}
          </p>
        </div>
      </div>
    </Card>
  )
}
