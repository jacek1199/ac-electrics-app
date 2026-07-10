export interface Toast {
  id: number
  message: string
  kind: 'success' | 'info' | 'danger'
}

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()
let counter = 0

function emit() {
  for (const l of listeners) l([...toasts])
}

export function pushToast(message: string, kind: Toast['kind'] = 'success') {
  const id = ++counter
  toasts = [...toasts, { id, message, kind }]
  emit()
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 2600)
}

export function subscribeToasts(fn: Listener): () => void {
  listeners.add(fn)
  fn([...toasts])
  return () => listeners.delete(fn)
}
