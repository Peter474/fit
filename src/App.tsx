import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import History from '@/pages/History'
import Workouts from '@/pages/Workouts'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="history" element={<History />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
