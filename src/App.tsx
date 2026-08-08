import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'
import Dashboard from '@/pages/Dashboard'

const History = lazy(() => import('@/pages/History'))
const Workouts = lazy(() => import('@/pages/Workouts'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Settings = lazy(() => import('@/pages/Settings'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
      <Spinner /> Loading…
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route
          path="history"
          element={
            <Suspense fallback={<RouteFallback />}>
              <History />
            </Suspense>
          }
        />
        <Route
          path="workouts"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Workouts />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Settings />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
