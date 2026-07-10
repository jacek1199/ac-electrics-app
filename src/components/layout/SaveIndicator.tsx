import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { IconCheck } from './icons'

export function SaveIndicator() {
  const [visible, setVisible] = useState(false)
  const timer = useRef<number | null>(null)
  const mounted = useRef(false)

  useEffect(() => {
    const unsub = useStore.subscribe(() => {
      if (!mounted.current) return
      setVisible(true)
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setVisible(false), 1500)
    })
    mounted.current = true
    return () => {
      unsub()
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 border border-success/25 px-2.5 py-1 rounded-full"
        >
          <IconCheck className="w-3 h-3" /> Zapisano automatycznie
        </motion.div>
      )}
    </AnimatePresence>
  )
}
