import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { DEFAULT_GOALS, emptyDailyLog, type DailyLog, type Goals } from '@/types/tracking'

function requireDb() {
  if (!db) throw new Error('Firebase is not configured. Add your config to .env.local (see README.md).')
  return db
}

function settingsDocRef(uid: string) {
  return doc(requireDb(), 'users', uid, 'settings', 'app')
}

function dailyLogDocRef(uid: string, date: string) {
  return doc(requireDb(), 'users', uid, 'dailyLogs', date)
}

function dailyLogsCollectionRef(uid: string) {
  return collection(requireDb(), 'users', uid, 'dailyLogs')
}

/** Live-subscribes to the user's goal settings, seeding defaults on first run. */
export function subscribeSettings(
  uid: string,
  onData: (goals: Goals) => void,
  onError: (err: Error) => void,
): () => void {
  const ref = settingsDocRef(uid)
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        setDoc(ref, DEFAULT_GOALS).catch((e) => onError(e as Error))
        onData(DEFAULT_GOALS)
        return
      }
      onData({ ...DEFAULT_GOALS, ...(snap.data() as Partial<Goals>) })
    },
    (err) => onError(err as Error),
  )
}

export async function saveSettings(uid: string, goals: Goals): Promise<void> {
  await setDoc(settingsDocRef(uid), goals, { merge: true })
}

/** Live-subscribes to a single day's log, yielding an empty-shaped log if none exists yet. */
export function subscribeDailyLog(
  uid: string,
  date: string,
  onData: (log: DailyLog) => void,
  onError: (err: Error) => void,
): () => void {
  const ref = dailyLogDocRef(uid, date)
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(emptyDailyLog(date))
        return
      }
      onData({ ...emptyDailyLog(date), ...(snap.data() as Partial<DailyLog>) })
    },
    (err) => onError(err as Error),
  )
}

export async function saveDailyLog(uid: string, log: DailyLog): Promise<void> {
  await setDoc(
    dailyLogDocRef(uid, log.date),
    { ...log, updatedAt: serverTimestamp() },
    { merge: false },
  )
}

/** Live-subscribes to every daily log between two date keys (inclusive), for History/Analytics. */
export function subscribeDailyLogsRange(
  uid: string,
  startDate: string,
  endDate: string,
  onData: (logs: DailyLog[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(
    dailyLogsCollectionRef(uid),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map((d) => ({ ...emptyDailyLog(d.id), ...(d.data() as Partial<DailyLog>) }))
      onData(logs)
    },
    (err) => onError(err as Error),
  )
}
