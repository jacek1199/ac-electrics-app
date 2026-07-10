type Listener = () => void

const listeners = new Set<Listener>()

export function requestLock() {
  for (const l of listeners) l()
}

export function subscribeLock(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
