import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  icon: ReactNode
  note: string
}

export function PlaceholderPage({ title, subtitle, icon, note }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="flex flex-col items-center gap-3 py-14 text-center animate-fade-up">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-3 text-text-secondary">
          {icon}
        </span>
        <p className="max-w-xs text-sm text-text-secondary">{note}</p>
      </Card>
    </div>
  )
}
