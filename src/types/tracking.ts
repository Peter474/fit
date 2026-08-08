// Core domain types for FitTrack.
// This file grows in later phases as calorie, water, protein, weight and
// workout logging are wired up. Phase 1 only needs the shapes required by
// the dashboard's static preview UI.

export interface DailyTotals {
  date: string // YYYY-MM-DD, local timezone
  caloriesConsumed: number
  waterConsumedMl: number
  proteinConsumedG: number
  weightKg: number | null
  steps: number
  workoutStatus: 'completed' | 'skipped' | 'none'
}

export interface Goals {
  calories: number
  waterMl: number
  proteinG: number
  steps: number
  weightUnit: 'kg' | 'lb'
}

export const DEFAULT_GOALS: Goals = {
  calories: 2200,
  waterMl: 4000,
  proteinG: 170,
  steps: 10000,
  weightUnit: 'kg',
}
