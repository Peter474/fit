import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'
import { useAppData } from '@/context/AppDataContext'
import Dashboard from '@/pages/Dashboard'

const History = lazy(() => import('@/pages/History'))
const Workouts = lazy(() => import('@/pages/Workouts'))
const Analytics = lazy(() => import('@/pages/Analytics'))
const Settings = lazy(() => import('@/pages/Settings'))
const Login = lazy(() => import('@/pages/Login'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-text-secondary">
      <Spinner /> Loading…
    </div>
  )
}

function FullScreenFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-2 bg-bg text-sm text-text-secondary">
      <Spinner /> Loading…
    </div>
  )
}

export default function App() {
  const { configured, authReady, isAuthenticated } = useAppData()

  // Still connecting to Firebase — avoid flashing Login or the Dashboard
  // before we actually know which one is correct.
  if (configured && !authReady) {
    return <FullScreenFallback />
  }

  // Gate on a *permanent* account, not just the background anonymous
  // session (every visitor gets one automatically so their data can be
  // linked later — see firebase.ts). If Firebase isn't configured at all,
  // there's no auth to gate on, so fall through to the normal app, which
  // already shows its own "Firebase isn't configured" banner.
  if (configured && !isAuthenticated) {
    return (
      <Suspense fallback={<FullScreenFallback />}>
        <Login />
      </Suspense>
    )
  }

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
