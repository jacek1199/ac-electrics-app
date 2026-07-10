export interface ConfirmRequest {
  id: number
  title: string
  message: string
  danger: boolean
  resolve: (ok: boolean) => void
}

type Listener = (req: ConfirmRequest | null) => void

let current: ConfirmRequest | null = null
const listeners = new Set<Listener>()
let counter = 0

function emit() {
  for (const l of listeners) l(current)
}

export function confirmAction(message: string, title = 'Potwierdź', danger = true): Promise<boolean> {
  return new Promise((resolve) => {
    current = { id: ++counter, title, message, danger, resolve }
    emit()
  })
}

export function resolveConfirm(ok: boolean) {
  if (current) current.resolve(ok)
  current = null
  emit()
}

export function subscribeConfirm(fn: Listener): () => void {
  listeners.add(fn)
  fn(current)
  return () => listeners.delete(fn)
}
