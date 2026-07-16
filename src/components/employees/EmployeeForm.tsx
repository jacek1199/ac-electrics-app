import { useRef, useState } from 'react'
import type { Employee } from '../../lib/types'
import { useStore } from '../../lib/store'
import { useAutosave } from '../../lib/useAutosave'
import { Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'
import { monthKey, employeePayroll, fmtPLN } from '../../lib/calc'

const canSave = (d: Employee) => d.firstName.trim().length > 0

export function EmployeeForm({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [draft, setDraft] = useState<Employee>(employee)
  const addEmployee = useStore((s) => s.addEmployee)
  const updateEmployee = useStore((s) => s.updateEmployee)
  const removeEmployee = useStore((s) => s.removeEmployee)
  const isNew = !useStore.getState().employees.some((e) => e.id === employee.id)
  const wasNewRef = useRef(isNew)

  const set = <K extends keyof Employee>(key: K, value: Employee[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const mKey = monthKey(new Date())

  const setHours = (value: number) => {
    setDraft((d) => ({ ...d, monthlyHours: { ...d.monthlyHours, [mKey]: value } }))
  }

  const persist = (d: Employee) => {
    if (wasNewRef.current) {
      addEmployee(d)
      wasNewRef.current = false
    } else {
      updateEmployee(d)
    }
  }
  useAutosave(draft, canSave, persist)

  const save = () => {
    if (!canSave(draft)) {
      pushToast('Podaj imię pracownika', 'danger')
      return
    }
    persist(draft)
    pushToast(isNew ? 'Pracownik dodany' : 'Dane zaktualizowane')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tego pracownika?', 'Usuń pracownika')
    if (!ok) return
    removeEmployee(draft.id)
    pushToast('Pracownik usunięty', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Imię" value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} autoFocus />
        <Input label="Nazwisko" value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
        <Input label="Telefon" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input label="E-mail" value={draft.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Zawód" value={draft.profession} onChange={(e) => set('profession', e.target.value)} placeholder="np. Elektryk" />
        <Input label="Ranga" value={draft.rank} onChange={(e) => set('rank', e.target.value)} placeholder="np. Starszy elektryk" />
        <Input type="number" label="Stawka godzinowa (PLN)" value={draft.hourlyRate} onChange={(e) => set('hourlyRate', Number(e.target.value))} />
        <label className="flex items-center gap-2 mt-6 text-sm text-ink-300">
          <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} className="accent-gold w-4 h-4" />
          Aktywny
        </label>
      </div>

      <div className="rounded-xl border border-navy-600 bg-navy-950/60 p-4">
        <div className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-3">Godziny i wypłata — bieżący miesiąc</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
          <Input
            type="number"
            label="Przepracowane godziny"
            value={draft.monthlyHours[mKey] ?? 0}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <div>
            <div className="text-xs text-ink-500 mb-1.5">Wyliczona wypłata</div>
            <div className="font-head text-xl font-bold text-gold-bright">{fmtPLN(employeePayroll(draft, mKey))}</div>
          </div>
        </div>
      </div>

      <Input label="Notatka" value={draft.note} onChange={(e) => set('note', e.target.value)} />
      <p className="text-xs text-ink-500">Zapisuje się automatycznie w trakcie pisania.</p>

      <div className="flex items-center justify-between pt-2 border-t border-navy-700">
        {!isNew ? (
          <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>Usuń</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="subtle" onClick={onClose}>Zamknij</Button>
          <Button variant="primary" onClick={save}>Zapisz</Button>
        </div>
      </div>
    </div>
  )
}
