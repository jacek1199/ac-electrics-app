import { registerSW } from 'virtual:pwa-register'

type Listener = (updateAvailable: boolean) => void

let updateAvailable = false
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l(updateAvailable)
}

export function subscribePwaUpdate(fn: Listener): () => void {
  listeners.add(fn)
  fn(updateAvailable)
  return () => listeners.delete(fn)
}

export function applyPwaUpdate() {
  applyUpdate?.(true)
}

export function initPwaUpdate() {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateAvailable = true
      emit()
    },
  })
}
