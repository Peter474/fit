import { useEffect, useState } from 'react'
import { NotebookPen } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface NotesCardProps {
  notes: string
  onSave: (notes: string) => Promise<void>
}

export function NotesCard({ notes, onSave }: NotesCardProps) {
  const [value, setValue] = useState(notes)

  useEffect(() => setValue(notes), [notes])

  function handleBlur() {
    if (value !== notes) onSave(value).catch(() => {})
  }

  return (
    <Card className="animate-fade-up">
      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-3 text-text-primary">
          <NotebookPen size={15} strokeWidth={2.25} />
        </span>
        Daily notes
      </div>
      <textarea
        rows={3}
        placeholder="Felt good today. Workout was strong…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="mt-3 w-full resize-none rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-success/40"
      />
    </Card>
  )
}
