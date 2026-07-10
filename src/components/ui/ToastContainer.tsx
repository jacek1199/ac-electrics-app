import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeToasts, type Toast } from './toastBus'

const kindStyles: Record<Toast['kind'], string> = {
  success: 'border-gold text-ink-100',
  info: 'border-teal-bright text-ink-100',
  danger: 'border-danger text-ink-100',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => subscribeToasts(setToasts), [])

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`bg-navy-800 border ${kindStyles[t.kind]} px-4 py-2.5 rounded-xl text-sm shadow-xl flex items-center gap-2`}
          >
            {t.kind === 'success' && <span className="text-gold">✓</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
