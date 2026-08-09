import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SetupNotice } from '@/components/ui/SetupNotice'
import { useAppData } from '@/context/AppDataContext'

export function AppShell() {
  const { configured, authReady, authError } = useAppData()
  // Only worth surfacing once we know for sure sign-in isn't going to
  // resolve on its own — avoids a flash of the banner while Firebase is
  // still connecting on a normal page load.
  const showNotice = !configured || (authReady && !!authError)

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-5xl">
            {showNotice && <SetupNotice authError={configured ? authError : null} />}
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
