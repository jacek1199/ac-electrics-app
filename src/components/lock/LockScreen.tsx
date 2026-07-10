import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../lib/store'
import { CircuitBackground } from '../layout/CircuitBackground'
import { playBrandChime } from '../../lib/notifications'
import { IconBolt, IconBackspace } from '../layout/icons'
import logo from '../../assets/logo.svg'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const pin = useStore((s) => s.pin)
  const [entered, setEntered] = useState('')
  const [error, setError] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    if (unlocking) return
    if (entered.length < pin.length) return
    if (entered === pin) {
      playBrandChime()
      setUnlocking(true)
      const t = window.setTimeout(onUnlock, 950)
      return () => window.clearTimeout(t)
    } else {
      setError(true)
      const t = window.setTimeout(() => {
        setEntered('')
        setError(false)
      }, 500)
      return () => window.clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered])

  useEffect(() => {
    if (unlocking) return
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      if (e.key === 'Backspace') press('back')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered, unlocking])

  const press = (k: string) => {
    if (unlocking) return
    if (k === 'back') {
      setEntered((v) => v.slice(0, -1))
      return
    }
    if (k === 'clear') {
      setEntered('')
      return
    }
    setEntered((v) => (v.length < pin.length ? v + k : v))
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-navy-950 p-6 overflow-hidden">
      <CircuitBackground />

      <AnimatePresence>
        {unlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(242,183,5,0.25), transparent 65%)',
            }}
          >
            <motion.svg
              viewBox="0 0 100 160"
              initial={{ scale: 0.2, opacity: 0, rotate: -8 }}
              animate={{ scale: [0.2, 1.35, 1.1], opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-28"
              style={{ filter: 'drop-shadow(0 0 40px rgba(242,183,5,0.85))' }}
            >
              <path d="M60 0 L20 90 L45 90 L35 160 L85 65 L58 65 Z" fill="#f2b705" />
            </motion.svg>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute bottom-[30%] font-head text-gold-bright font-bold tracking-wide"
            >
              Zasilanie włączone
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: unlocking ? 0 : 1, scale: unlocking ? 0.96 : 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xs flex flex-col items-center"
      >
        <img src={logo} alt="A.C. Electrics" className="w-20 h-20 mb-2" />
        <div className="font-head text-center mb-1">
          <span className="text-teal-bright font-bold">A.C.</span>{' '}
          <span className="text-gold tracking-[3px] text-sm font-bold">ELECTRICS</span>
        </div>
        <p className="text-ink-500 text-sm mb-8">Panel dostępny tylko dla Adama i Jacka</p>

        <motion.div
          animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-3 mb-8"
        >
          {Array.from({ length: pin.length }).map((_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                i < entered.length
                  ? error
                    ? 'bg-danger border-danger'
                    : 'bg-gold border-gold'
                  : 'border-ink-500'
              }`}
            />
          ))}
        </motion.div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((k, i) => (
            <button
              key={i}
              onClick={() => press(k)}
              title={k === 'clear' ? 'Wyczyść kod' : undefined}
              className={`aspect-square rounded-2xl border border-navy-600 bg-navy-800 text-xl font-semibold flex items-center justify-center hover:bg-navy-700 active:scale-95 transition-all ${
                k === 'clear'
                  ? 'text-gold hover:border-gold/50'
                  : 'text-ink-100 hover:border-gold/50'
              }`}
            >
              {k === 'back' ? <IconBackspace className="w-5 h-5" /> : k === 'clear' ? <IconBolt className="w-5 h-5" /> : k}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
