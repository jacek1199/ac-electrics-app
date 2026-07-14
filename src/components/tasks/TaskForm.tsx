import { useState } from 'react'
import type { TaskItem } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function TaskForm({ task, onClose }: { task: TaskItem; onClose: () => void }) {
  const [draft, setDraft] = useState<TaskItem>(task)
  const orders = useStore((s) => s.orders)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const isNew = !useStore.getState().tasks.some((t) => t.id === task.id)

  const set = <K extends keyof TaskItem>(key: K, value: TaskItem[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.title.trim()) {
      pushToast('Podaj tytuł zadania', 'danger')
      return
    }
    const patch = { ...draft, notifiedDayBefore: false, notifiedDayOf: false, notifiedHourBefore: false, notifiedAtTime: false }
    if (isNew) addTask(patch)
    else updateTask(patch)
    pushToast(isNew ? 'Zadanie dodane' : 'Zadanie zaktualizowane')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć to zadanie?', 'Usuń zadanie')
    if (!ok) return
    removeTask(draft.id)
    pushToast('Zadanie usunięte', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Select label="Dla kogo" value={draft.assignee} onChange={(e) => set('assignee', e.target.value as TaskItem['assignee'])}>
        <option value="adam">Adam (Szef / Właściciel)</option>
        <option value="jacek">Jacek (Partner Zarządzający / Wspólnik)</option>
      </Select>
      <Input label="Tytuł zadania" value={draft.title} onChange={(e) => set('title', e.target.value)} autoFocus />
      <Textarea label="Treść" value={draft.content} onChange={(e) => set('content', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="date" label="Termin" value={draft.deadline} onChange={(e) => set('deadline', e.target.value)} />
        <Input type="time" label="Godzina (opcjonalnie)" value={draft.time} onChange={(e) => set('time', e.target.value)} hint={draft.time ? 'Powiadomienie godzinę przed i o tej godzinie' : undefined} />
        <Select label="Priorytet" value={draft.priority} onChange={(e) => set('priority', e.target.value as TaskItem['priority'])}>
          <option value="wysoki">Wysoki</option>
          <option value="sredni">Średni</option>
          <option value="niski">Niski</option>
        </Select>
      </div>
      <Select label="Powiąż ze zleceniem (opcjonalnie)" value={draft.relatedOrderId ?? ''} onChange={(e) => set('relatedOrderId', e.target.value || undefined)}>
        <option value="">Brak</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>{o.title || 'Bez tytułu'}</option>
        ))}
      </Select>
      <label className="flex items-center gap-2 text-sm text-ink-300">
        <input type="checkbox" checked={draft.done} onChange={(e) => set('done', e.target.checked)} className="accent-gold w-4 h-4" />
        Zadanie ukończone
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
