import { useState } from 'react'
import type { Note } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function NoteForm({ note, onClose }: { note: Note; onClose: () => void }) {
  const [draft, setDraft] = useState<Note>(note)
  const addNote = useStore((s) => s.addNote)
  const updateNote = useStore((s) => s.updateNote)
  const removeNote = useStore((s) => s.removeNote)
  const isNew = !useStore.getState().notes.some((n) => n.id === note.id)

  const set = <K extends keyof Note>(key: K, value: Note[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.title.trim() && !draft.content.trim()) {
      pushToast('Notatka jest pusta', 'danger')
      return
    }
    const patch = { ...draft, updatedAt: new Date().toISOString() }
    if (isNew) addNote(patch)
    else updateNote(patch)
    pushToast('Zapisano')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tę notatkę?', 'Usuń notatkę')
    if (!ok) return
    removeNote(draft.id)
    pushToast('Usunięto', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Input label="Tytuł" value={draft.title} onChange={(e) => set('title', e.target.value)} autoFocus />
      <Textarea label="Treść" value={draft.content} onChange={(e) => set('content', e.target.value)} className="min-h-48" />
      <label className="flex items-center gap-2 text-sm text-ink-300">
        <input type="checkbox" checked={draft.pinned} onChange={(e) => set('pinned', e.target.checked)} className="accent-gold w-4 h-4" />
        Przypnij na górze
      </label>

      <div className="flex items-center justify-between pt-2 border-t border-navy-700">
        {!isNew ? (
          <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>Usuń</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="subtle" onClick={onClose}>Anuluj</Button>
          <Button variant="primary" onClick={save}>Zapisz</Button>
        </div>
      </div>
    </div>
  )
}
