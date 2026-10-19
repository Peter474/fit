import { useEffect, useState } from 'react'
import { useAppData } from '@/context/AppDataContext'
import { useToast } from '@/context/ToastContext'
import { subscribeDailyLogsRange } from '@/lib/firestoreService'
import type { DailyLog } from '@/types/tracking'

export function useDailyLogsRange(startDate: string, endDate: string) {
  const { uid, configured } = useAppData()
  const { pushToast } = useToast()
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLogs([])
      setLoading(!configured ? false : true)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeDailyLogsRange(
      uid,
      startDate,
      endDate,
      (next) => {
        setLogs(next)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        pushToast({ type: 'error', message: 'Could not load history. Please try again.' })
        setLoading(false)
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, startDate, endDate, configured])

  return { logs, loading }
}
