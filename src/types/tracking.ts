// Core domain types for FitTrack, backed by Firestore.
// Collection layout: users/{uid}/settings/app, users/{uid}/dailyLogs/{YYYY-MM-DD}

export interface Goals {
  calories: number
  waterMl: number
  proteinG: number
  steps: number
  weightUnit: 'kg' | 'lb'
  theme: 'dark'
}

export const DEFAULT_GOALS: Goals = {
  calories: 2200,
  waterMl: 4000,
  proteinG: 170,
  steps: 10000,
  weightUnit: 'kg',
  theme: 'dark',
}

export interface MealEntry {
  id: string
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  notes?: string
  loggedAt: number // epoch ms
}

export interface WaterEntry {
  id: string
  amountMl: number
  loggedAt: number
}

export interface ProteinEntry {
  id: string
  amountG: number
  note?: string
  loggedAt: number
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weightKg: number
  notes?: string
}

export type WorkoutStatus = 'completed' | 'skipped' | 'none'

export interface Workout {
  name: string
  exercises: Exercise[]
  status: WorkoutStatus
}

export const EMPTY_WORKOUT: Workout = { name: '', exercises: [], status: 'none' }

export interface DailyLog {
  date: string // YYYY-MM-DD
  meals: MealEntry[]
  water: WaterEntry[]
  manualProtein: ProteinEntry[]
  weightKg: number | null
  weightLoggedAt: number | null
  steps: number
  workout: Workout
  notes: string
  updatedAt: number
}

export function emptyDailyLog(date: string): DailyLog {
  return {
    date,
    meals: [],
    water: [],
    manualProtein: [],
    weightKg: null,
    weightLoggedAt: null,
    steps: 0,
    workout: EMPTY_WORKOUT,
    notes: '',
    updatedAt: Date.now(),
  }
}

export function totalCalories(log: DailyLog): number {
  return log.meals.reduce((sum, m) => sum + m.calories, 0)
}

export function totalWater(log: DailyLog): number {
  return log.water.reduce((sum, w) => sum + w.amountMl, 0)
}

export function totalProtein(log: DailyLog): number {
  const fromMeals = log.meals.reduce((sum, m) => sum + m.proteinG, 0)
  const manual = log.manualProtein.reduce((sum, p) => sum + p.amountG, 0)
  return fromMeals + manual
}
