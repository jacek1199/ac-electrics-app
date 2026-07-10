import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeConfirm, resolveConfirm, type ConfirmRequest } from './confirmBus'
import { Button } from './Button'

export function ConfirmDialogContainer() {
  const [req, setReq] = useState<ConfirmRequest | null>(null)

  useEffect(() => subscribeConfirm(setReq), [])

  return (
    <AnimatePresence>
      {req && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) resolveConfirm(false)
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="w-full max-w-sm rounded-2xl border border-teal/20 bg-gradient-to-b from-navy-800 to-navy-900 p-5 shadow-2xl"
          >
            <h3 className="font-head text-base font-semibold text-ink-100 mb-2">{req.title}</h3>
            <p className="text-sm text-ink-300 mb-5">{req.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="subtle" size="sm" onClick={() => resolveConfirm(false)}>
                Anuluj
              </Button>
              <Button
                variant={req.danger ? 'danger' : 'primary'}
                size="sm"
                onClick={() => resolveConfirm(true)}
              >
                Potwierdź
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
