import { ChartSpline } from 'lucide-react'
import { PlaceholderPage } from './Placeholder'

export default function Analytics() {
  return (
    <PlaceholderPage
      title="Analytics"
      subtitle="Trends across time"
      icon={<ChartSpline size={22} strokeWidth={1.75} />}
      note="Charts for weight, calories, water, protein, workouts and steps land in Phase 9."
    />
  )
}
