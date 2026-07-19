export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline'

type Listener = (status: SyncStatus) => void

let current: SyncStatus = 'idle'
const listeners = new Set<Listener>()
let revertTimer: number | null = null

function emit() {
  for (const l of listeners) l(current)
}

export function setSyncStatus(status: SyncStatus) {
  if (revertTimer) {
    window.clearTimeout(revertTimer)
    revertTimer = null
  }
  current = status
  emit()
  if (status === 'saved') {
    revertTimer = window.setTimeout(() => {
      current = 'idle'
      emit()
    }, 2000)
  }
}

export function subscribeSyncStatus(fn: Listener): () => void {
  listeners.add(fn)
  fn(current)
  return () => listeners.delete(fn)
}
