import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { isFirebaseConfigured, watchAuth, signOutUser } from '@/lib/firebase'
import { subscribeSettings, saveSettings as saveSettingsRemote } from '@/lib/firestoreService'
import { DEFAULT_GOALS, type Goals } from '@/types/tracking'
import { useToast } from './ToastContext'

interface AppDataValue {
  configured: boolean
  authReady: boolean
  authError: string | null
  uid: string | null
  /** The current Firebase user — anonymous or permanent. Null until authReady. */
  user: User | null
  /** True once the user has a permanent account (email/password or Google), not just an anonymous session. */
  isAuthenticated: boolean
  email: string | null
  logout: () => Promise<void>
  goals: Goals
  goalsLoading: boolean
  saveGoals: (goals: Goals) => Promise<void>
}

const AppDataContext = createContext<AppDataValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const { pushToast } = useToast()

  const uid = user?.uid ?? null
  const isAuthenticated = !!user && !user.isAnonymous

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true)
      setGoalsLoading(false)
      return
    }
    const unsubscribe = watchAuth((nextUser, error) => {
      setAuthReady(true)
      if (!nextUser) {
        setAuthError(error ?? 'Could not sign in.')
        setUser(null)
        return
      }
      setAuthError(null)
      setUser(nextUser)
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
    if (!uid) {
      pushToast({
        type: 'error',
        message: "Can't save — not signed in to Firebase yet. Check the setup notice above.",
      })
      throw new Error('No authenticated uid — Firebase not configured or sign-in failed.')
    }
    try {
      await saveSettingsRemote(uid, next)
      pushToast({ type: 'success', message: 'Settings saved.' })
    } catch (err) {
      console.error(err)
      pushToast({ type: 'error', message: 'Something went wrong while saving your settings. Please try again.' })
      throw err
    }
  }

  async function logout() {
    try {
      await signOutUser()
      pushToast({ type: 'success', message: 'Logged out.' })
    } catch (err) {
      console.error(err)
      pushToast({ type: 'error', message: 'Could not log out. Please try again.' })
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
        user,
        isAuthenticated,
        email: user?.email ?? null,
        logout,
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
