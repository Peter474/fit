import { Dumbbell } from 'lucide-react'
import { PlaceholderPage } from './Placeholder'

export default function Workouts() {
  return (
    <PlaceholderPage
      title="Workouts"
      subtitle="Log sets, reps and weight"
      icon={<Dumbbell size={22} strokeWidth={1.75} />}
      note="Workout logging and history land in Phase 7."
    />
  )
}
