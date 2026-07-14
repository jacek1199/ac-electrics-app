import { useState } from 'react'
import type { ShoppingItem } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function ShoppingForm({ item, onClose }: { item: ShoppingItem; onClose: () => void }) {
  const [draft, setDraft] = useState<ShoppingItem>(item)
  const addShoppingItem = useStore((s) => s.addShoppingItem)
  const updateShoppingItem = useStore((s) => s.updateShoppingItem)
  const removeShoppingItem = useStore((s) => s.removeShoppingItem)
  const isNew = !useStore.getState().shopping.some((s) => s.id === item.id)

  const set = <K extends keyof ShoppingItem>(key: K, value: ShoppingItem[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.name.trim()) {
      pushToast('Podaj nazwę produktu', 'danger')
      return
    }
    if (isNew) addShoppingItem(draft)
    else updateShoppingItem(draft)
    pushToast('Zapisano')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tę pozycję z listy zakupów?', 'Usuń pozycję')
    if (!ok) return
    removeShoppingItem(draft.id)
    pushToast('Usunięto', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Input label="Nazwa produktu" value={draft.name} onChange={(e) => set('name', e.target.value)} autoFocus />
      <Select label="Kategoria" value={draft.category} onChange={(e) => set('category', e.target.value as ShoppingItem['category'])}>
        <option value="sprzet">Sprzęt</option>
        <option value="auta">Auta</option>
        <option value="materialy">Materiały</option>
        <option value="inne">Inne</option>
      </Select>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="number" label="Cena (PLN)" value={draft.price} onChange={(e) => set('price', Number(e.target.value))} />
        <Input type="number" label="Ilość" value={draft.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
        <Input type="date" label="Data" value={draft.date} onChange={(e) => set('date', e.target.value)} />
      </div>
      <Select label="Priorytet" value={draft.priority} onChange={(e) => set('priority', e.target.value as ShoppingItem['priority'])}>
        <option value="wysoki">Wysoki</option>
        <option value="sredni">Średni</option>
        <option value="niski">Niski</option>
      </Select>
      <Input label="Notatka" value={draft.note} onChange={(e) => set('note', e.target.value)} />
      <p className="text-xs text-ink-500">
        Status "kupione" zaznaczasz na liście zakupów (odhaczenie automatycznie dodaje wydatek).
      </p>

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
