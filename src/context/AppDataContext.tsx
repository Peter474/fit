import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isFirebaseConfigured, watchAuth } from '@/lib/firebase'
import { subscribeSettings, saveSettings as saveSettingsRemote } from '@/lib/firestoreService'
import { DEFAULT_GOALS, type Goals } from '@/types/tracking'
import { useToast } from './ToastContext'

interface AppDataValue {
  configured: boolean
  authReady: boolean
  authError: string | null
  uid: string | null
  goals: Goals
  goalsLoading: boolean
  saveGoals: (goals: Goals) => Promise<void>
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const { pushToast } = useToast()

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true)
      setGoalsLoading(false)
      return
    }
    const unsubscribe = watchAuth((user) => {
      setAuthReady(true)
      if (!user) {
        setAuthError('Could not sign in. Check your Firebase config in .env.local.')
        setUid(null)
        return
      }
      setAuthError(null)
      setUid(user.uid)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!uid) return
    setGoalsLoading(true)
    const unsubscribe = subscribeSettings(
      uid,
      (g) => {
        setGoals(g)
        setGoalsLoading(false)
      },
      (err) => {
        console.error(err)
        pushToast({ type: 'error', message: 'Could not load your settings. Please try again.' })
        setGoalsLoading(false)
      },
    )
    return unsubscribe
  }, [uid, pushToast])

  async function saveGoals(next: Goals) {
    if (!uid) return
    try {
      await saveSettingsRemote(uid, next)
      pushToast({ type: 'success', message: 'Settings saved.' })
    } catch (err) {
      console.error(err)
      pushToast({ type: 'error', message: 'Something went wrong while saving your settings. Please try again.' })
      throw err
    }
  }

  return (
    <AppDataContext.Provider
      value={{
        configured: isFirebaseConfigured,
        authReady,
        authError,
        uid,
        goals,
        goalsLoading,
        saveGoals,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
