import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CircuitBackground } from './CircuitBackground'
import { ToastContainer } from '../ui/ToastContainer'
import { ConfirmDialogContainer } from '../ui/ConfirmDialogContainer'
import { useStore } from '../../lib/store'
import { checkDeadlineNotifications } from '../../lib/notifications'

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const run = () => {
      const { tasks, orders, updateTask, updateOrder } = useStore.getState()
      checkDeadlineNotifications({ tasks, orders, updateTask, updateOrder })
    }
    run()
    const interval = window.setInterval(run, 5 * 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="min-h-svh flex text-ink-100">
      <CircuitBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <TopBar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <ConfirmDialogContainer />
    </div>
  )
}
