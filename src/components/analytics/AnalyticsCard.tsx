import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LineChart } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  icon: ReactNode
  stat?: string
  hasData: boolean
  emptyMessage?: string
  children: ReactNode
}

export function AnalyticsCard({
  title,
  icon,
  stat,
  hasData,
  emptyMessage = 'Not enough data yet. Keep tracking for a few more days.',
  children,
}: AnalyticsCardProps) {
  return (
    <Card className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 text-text-primary">
            {icon}
          </span>
          {title}
        </div>
        {hasData && stat && <span className="font-display text-sm font-semibold text-text-primary">{stat}</span>}
      </div>
      <div className="mt-3">
        {hasData ? children : <EmptyState icon={<LineChart size={18} />} title={emptyMessage} />}
      </div>
    </Card>
  )
}
