import type { Order, TaskItem } from './types'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

/** Synthesized electrical "spark" chime — two quick rising tones. */
function playSparkTone() {
  try {
    const ctx = getAudioCtx()
    const now = ctx.currentTime
    const notes: [number, number, number][] = [
      [880, now, 0.09],
      [1318.5, now + 0.1, 0.12],
    ]
    for (const [freq, start, dur] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.02)
    }
  } catch {
    /* audio unavailable — ignore */
  }
}

/** Speaks the brand name so the notification is instantly recognizable. */
function speakBrand() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const utter = new SpeechSynthesisUtterance('A. C. Electrics')
  utter.lang = 'en-US'
  utter.rate = 1.05
  utter.pitch = 1
  utter.volume = 0.85
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find((v) => v.lang.startsWith('en'))
  if (preferred) utter.voice = preferred
  window.speechSynthesis.speak(utter)
}

export function playBrandChime() {
  playSparkTone()
  window.setTimeout(() => speakBrand(), 260)
}

export function notify(title: string, body: string) {
  playBrandChime()
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png`, tag: title + body })
    } catch {
      /* some browsers restrict direct construction — ignore */
    }
  }
}

function daysBetween(from: Date, to: Date): number {
  const ms = new Date(to.toDateString()).getTime() - new Date(from.toDateString()).getTime()
  return Math.round(ms / 86400000)
}

interface NotifyDeps {
  tasks: TaskItem[]
  orders: Order[]
  updateTask: (t: TaskItem) => void
  updateOrder: (o: Order) => void
}

/** Checks tasks & order deadlines and fires day-before / day-of alerts once each. */
export function checkDeadlineNotifications({ tasks, orders, updateTask, updateOrder }: NotifyDeps) {
  const today = new Date()

  for (const t of tasks) {
    if (t.done || !t.deadline) continue
    const d = new Date(t.deadline)
    const diff = daysBetween(today, d)
    if (diff === 1 && !t.notifiedDayBefore) {
      notify('Zadanie jutro', `${t.title || 'Zadanie'} — termin: jutro`)
      updateTask({ ...t, notifiedDayBefore: true })
    } else if (diff === 0 && !t.notifiedDayOf) {
      notify('Zadanie dzisiaj', `${t.title || 'Zadanie'} — termin dzisiaj`)
      updateTask({ ...t, notifiedDayOf: true })
    }
  }

  for (const o of orders) {
    if (o.status === 'zakonczone' || o.status === 'anulowane' || !o.deadline) continue
    const d = new Date(o.deadline)
    const diff = daysBetween(today, d)
    if (diff === 1 && !o.notifiedDayBefore) {
      notify('Zlecenie jutro', `${o.title || 'Zlecenie'} — termin: jutro`)
      updateOrder({ ...o, notifiedDayBefore: true })
    } else if (diff === 0 && !o.notifiedDayOf) {
      notify('Zlecenie dzisiaj', `${o.title || 'Zlecenie'} — termin dzisiaj`)
      updateOrder({ ...o, notifiedDayOf: true })
    }
  }
}
