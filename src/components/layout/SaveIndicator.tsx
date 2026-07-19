import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeSyncStatus, type SyncStatus } from '../../lib/syncStatusBus'
import { IconCheck, IconCloudOff } from './icons'

const styles: Record<Exclude<SyncStatus, 'idle'>, { icon: ReactNode; label: string; className: string }> = {
  saving: {
    icon: <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />,
    label: 'Zapisywanie…',
    className: 'text-gold bg-gold/10 border-gold/25',
  },
  saved: {
    icon: <IconCheck className="w-3 h-3" />,
    label: 'Zapisano',
    className: 'text-success bg-success/10 border-success/25',
  },
  offline: {
    icon: <IconCloudOff className="w-3.5 h-3.5" />,
    label: 'Brak połączenia — zapiszę po powrocie',
    className: 'text-danger bg-danger/10 border-danger/25',
  },
}

export function SaveIndicator() {
  const [status, setStatus] = useState<SyncStatus>('idle')

  useEffect(() => subscribeSyncStatus(setStatus), [])

  if (status === 'idle') return null
  const s = styles[status]

  return (
    <AnimatePresence>
      <motion.div
        key={status}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border max-w-[240px] ${s.className}`}
      >
        {s.icon}
        <span className="truncate">{s.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
