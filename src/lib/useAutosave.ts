import { useEffect, useRef } from 'react'

/**
 * Debounced autosave for form drafts. Fires `persist(value)` `delay` ms after
 * the last change (skipping the very first render, so just opening a form
 * doesn't "save" immediately). `canSave` gates persistence so incomplete
 * drafts (e.g. no title yet) never get written to the shared store.
 *
 * Crucially, any still-pending change is flushed immediately when the form
 * unmounts (modal closed, navigated away, etc.) — closing a form before the
 * debounce fires must never silently drop what was typed.
 */
export function useAutosave<T>(value: T, canSave: (v: T) => boolean, persist: (v: T) => void, delay = 900) {
  const firstRun = useRef(true)
  const latest = useRef(value)
  const dirty = useRef(false)
  const canSaveRef = useRef(canSave)
  const persistRef = useRef(persist)
  latest.current = value
  canSaveRef.current = canSave
  persistRef.current = persist

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    dirty.current = true
    const timer = window.setTimeout(() => {
      if (canSaveRef.current(latest.current)) {
        persistRef.current(latest.current)
        dirty.current = false
      }
    }, delay)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    return () => {
      if (dirty.current && canSaveRef.current(latest.current)) {
        persistRef.current(latest.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
