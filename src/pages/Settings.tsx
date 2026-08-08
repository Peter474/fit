import { SlidersHorizontal } from 'lucide-react'
import { PlaceholderPage } from './Placeholder'

export default function Settings() {
  return (
    <PlaceholderPage
      title="Settings"
      subtitle="Goals, units and theme"
      icon={<SlidersHorizontal size={22} strokeWidth={1.75} />}
      note="Editable daily goals (calories, water, protein, steps), weight unit and theme land in Phase 10."
    />
  )
}
