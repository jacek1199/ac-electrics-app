import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribePwaUpdate, applyPwaUpdate } from '../../lib/pwaUpdate'
import { IconRefresh } from './icons'

const AUTO_APPLY_MS = 15000

export function UpdateBanner() {
  const [visible, setVisible] = useState(false)
  const appliedRef = useRef(false)

  useEffect(() => subscribePwaUpdate(setVisible), [])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => {
      if (!appliedRef.current) {
        appliedRef.current = true
        applyPwaUpdate()
      }
    }, AUTO_APPLY_MS)
    return () => window.clearTimeout(timer)
  }, [visible])

  const applyNow = () => {
    appliedRef.current = true
    applyPwaUpdate()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[350] flex items-center gap-3 bg-navy-800 border border-gold/40 rounded-2xl shadow-2xl px-4 py-3 max-w-[92vw]"
        >
          <IconRefresh className="w-5 h-5 text-gold shrink-0 animate-spin" />
          <div className="text-sm text-ink-100 leading-tight">
            Dostępna nowa wersja panelu
            <div className="text-xs text-ink-500">Odświeżę automatycznie za chwilę…</div>
          </div>
          <button
            onClick={applyNow}
            className="ml-1 shrink-0 text-xs font-semibold bg-gradient-to-br from-gold-bright to-gold text-navy-950 px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-transform"
          >
            Odśwież teraz
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
