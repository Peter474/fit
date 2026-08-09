import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { subscribeDailyLog, saveDailyLog } from '@/lib/firestoreService'
import {
  emptyDailyLog,
  type DailyLog,
  type MealEntry,
  type WaterEntry,
  type ProteinEntry,
  type Workout,
} from '@/types/tracking'

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useDailyLog(date: string) {
  const { uid, configured } = useAppData()
  const { pushToast } = useToast()
  const [log, setLog] = useState<DailyLog>(emptyDailyLog(date))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const logRef = useRef(log)
  logRef.current = log

  useEffect(() => {
    if (!uid) {
      setLog(emptyDailyLog(date))
      setLoading(!configured ? false : true)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeDailyLog(
      uid,
      date,
      (next) => {
        setLog(next)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        pushToast({ type: 'error', message: 'Could not load this day. Please try again.' })
        setLoading(false)
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, date, configured])

  const persist = useCallback(
    async (next: DailyLog, successMessage?: string) => {
      if (!uid) {
        pushToast({
          type: 'error',
          message: "Can't save — not signed in to Firebase yet. Check the setup notice above.",
        })
        throw new Error('No authenticated uid — Firebase not configured or sign-in failed.')
      }
      setSaving(true)
      try {
        await saveDailyLog(uid, next)
        if (successMessage) pushToast({ type: 'success', message: successMessage })
      } catch (err) {
        console.error(err)
        pushToast({ type: 'error', message: 'Something went wrong while saving your data. Please try again.' })
        throw err
      } finally {
        setSaving(false)
      }
    },
    [uid, pushToast],
  )

  const addMeal = useCallback(
    (meal: Omit<MealEntry, 'id' | 'loggedAt'>) => {
      const entry: MealEntry = { ...meal, id: newId(), loggedAt: Date.now() }
      const next = { ...logRef.current, meals: [...logRef.current.meals, entry] }
      return persist(next, `${meal.calories} kcal added successfully.`)
    },
    [persist],
  )

  const updateMeal = useCallback(
    (id: string, meal: Omit<MealEntry, 'id' | 'loggedAt'>) => {
      const next = {
        ...logRef.current,
        meals: logRef.current.meals.map((m) => (m.id === id ? { ...m, ...meal } : m)),
      }
      return persist(next, 'Meal updated.')
    },
    [persist],
  )

  const deleteMeal = useCallback(
    (id: string) => {
      const next = { ...logRef.current, meals: logRef.current.meals.filter((m) => m.id !== id) }
      return persist(next, 'Meal deleted.')
    },
    [persist],
  )

  const addWater = useCallback(
    (amountMl: number) => {
      const entry: WaterEntry = { id: newId(), amountMl, loggedAt: Date.now() }
      const next = { ...logRef.current, water: [...logRef.current.water, entry] }
      return persist(next, `${amountMl} ml water added.`)
    },
    [persist],
  )

  const deleteWater = useCallback(
    (id: string) => {
      const next = { ...logRef.current, water: logRef.current.water.filter((w) => w.id !== id) }
      return persist(next, 'Water entry deleted.')
    },
    [persist],
  )

  const addManualProtein = useCallback(
    (amountG: number, note?: string) => {
      const entry: ProteinEntry = { id: newId(), amountG, note, loggedAt: Date.now() }
      const next = { ...logRef.current, manualProtein: [...logRef.current.manualProtein, entry] }
      return persist(next, `${amountG} g protein added.`)
    },
    [persist],
  )

  const deleteManualProtein = useCallback(
    (id: string) => {
      const next = {
        ...logRef.current,
        manualProtein: logRef.current.manualProtein.filter((p) => p.id !== id),
      }
      return persist(next, 'Protein entry deleted.')
    },
    [persist],
  )

  const setWeight = useCallback(
    (weightKg: number) => {
      const next = { ...logRef.current, weightKg, weightLoggedAt: Date.now() }
      return persist(next, 'Weight saved.')
    },
    [persist],
  )

  const setSteps = useCallback(
    (steps: number) => {
      const next = { ...logRef.current, steps }
      return persist(next, 'Steps saved.')
    },
    [persist],
  )

  const saveWorkout = useCallback(
    (workout: Workout) => {
      const next = { ...logRef.current, workout }
      const message =
        workout.status === 'completed'
          ? 'Workout marked as completed.'
          : workout.status === 'skipped'
            ? 'Workout marked as skipped.'
            : 'Workout saved.'
      return persist(next, message)
    },
    [persist],
  )

  const saveNotes = useCallback(
    (notes: string) => {
      const next = { ...logRef.current, notes }
      return persist(next)
    },
    [persist],
  )

  return {
    log,
    loading,
    saving,
    addMeal,
    updateMeal,
    deleteMeal,
    addWater,
    deleteWater,
    addManualProtein,
    deleteManualProtein,
    setWeight,
    setSteps,
    saveWorkout,
    saveNotes,
  }
}
