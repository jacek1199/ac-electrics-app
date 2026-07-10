import { useState } from 'react'
import type { Transaction } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function TransactionForm({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const [draft, setDraft] = useState<Transaction>(tx)
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const removeTransaction = useStore((s) => s.removeTransaction)
  const isNew = !useStore.getState().transactions.some((t) => t.id === tx.id)

  const set = <K extends keyof Transaction>(key: K, value: Transaction[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.label.trim()) {
      pushToast('Podaj nazwę pozycji', 'danger')
      return
    }
    if (isNew) addTransaction(draft)
    else updateTransaction(draft)
    pushToast('Zapisano')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tę pozycję?', 'Usuń wpis')
    if (!ok) return
    removeTransaction(draft.id)
    pushToast('Usunięto', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Input
        label={draft.type === 'income' ? 'Nazwa przychodu' : 'Nazwa wydatku (wpisz co to jest)'}
        value={draft.label}
        onChange={(e) => set('label', e.target.value)}
        placeholder={draft.type === 'income' ? 'np. Sprzedaż złomu, zwrot VAT…' : 'np. Czynsz, paliwo, leasing auta…'}
        autoFocus
      />
      {draft.type === 'income' ? (
        <Select label="Źródło" value={draft.incomeSource ?? 'inne'} onChange={(e) => set('incomeSource', e.target.value as Transaction['incomeSource'])}>
          <option value="klasyczne">Klasyczne zlecenie</option>
          <option value="odwrocone">Odwrócone zlecenie</option>
          <option value="inne">Inne</option>
        </Select>
      ) : (
        <Select label="Rodzaj wydatku" value={draft.expenseKind ?? 'jednorazowe'} onChange={(e) => set('expenseKind', e.target.value as Transaction['expenseKind'])}>
          <option value="stale">Stały (cykliczny)</option>
          <option value="jednorazowe">Jednorazowy</option>
        </Select>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input type="number" label="Kwota (PLN)" value={draft.amount} onChange={(e) => set('amount', Number(e.target.value))} />
        <Input type="date" label="Data" value={draft.date} onChange={(e) => set('date', e.target.value)} />
      </div>
      <Input label="Notatka (opcjonalnie)" value={draft.note ?? ''} onChange={(e) => set('note', e.target.value)} />

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
