import { CalendarClock } from 'lucide-react'
import { PlaceholderPage } from './Placeholder'

export default function History() {
  return (
    <PlaceholderPage
      title="History"
      subtitle="Every logged day, at a glance"
      icon={<CalendarClock size={22} strokeWidth={1.75} />}
      note="Your daily log table arrives in Phase 8, once calorie, water, protein and weight tracking are wired up."
    />
  )
}
