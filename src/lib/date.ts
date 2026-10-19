// Local-timezone date helpers. FitTrack always keys data by the user's
// local calendar date (YYYY-MM-DD), never UTC, so a day boundary matches
// what the user actually experiences as "today".

export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, delta: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + delta)
  return toDateKey(d)
}

export function isToday(key: string): boolean {
  return key === todayKey()
}

export function formatDateLabel(key: string): string {
  const d = fromDateKey(key)
  if (isToday(key)) {
    return `Today · ${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
  }
  if (key === addDays(todayKey(), -1)) {
    return `Yesterday · ${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
  }
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatShortDate(key: string): string {
  const d = fromDateKey(key)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** Returns an array of date keys, oldest first, covering the last n days including today. */
export function lastNDays(n: number, endKey: string = todayKey()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(endKey, -i))
  }
  return out
}
