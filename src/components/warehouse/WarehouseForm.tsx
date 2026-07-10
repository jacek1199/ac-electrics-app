import { useState } from 'react'
import type { WarehouseItem } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function WarehouseForm({ item, onClose }: { item: WarehouseItem; onClose: () => void }) {
  const [draft, setDraft] = useState<WarehouseItem>(item)
  const addWarehouseItem = useStore((s) => s.addWarehouseItem)
  const updateWarehouseItem = useStore((s) => s.updateWarehouseItem)
  const removeWarehouseItem = useStore((s) => s.removeWarehouseItem)
  const isNew = !useStore.getState().warehouse.some((w) => w.id === item.id)

  const set = <K extends keyof WarehouseItem>(key: K, value: WarehouseItem[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.name.trim()) {
      pushToast('Podaj nazwę pozycji', 'danger')
      return
    }
    if (isNew) addWarehouseItem(draft)
    else updateWarehouseItem(draft)
    pushToast('Zapisano')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tę pozycję z magazynu?', 'Usuń pozycję')
    if (!ok) return
    removeWarehouseItem(draft.id)
    pushToast('Usunięto', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Input label="Nazwa" value={draft.name} onChange={(e) => set('name', e.target.value)} autoFocus />
      <Select label="Kategoria" value={draft.category} onChange={(e) => set('category', e.target.value as WarehouseItem['category'])}>
        <option value="sprzet">Sprzęt</option>
        <option value="materialy">Materiały</option>
        <option value="auta">Auta</option>
        <option value="nieruchomosci">Nieruchomości / miejsca</option>
        <option value="inne">Inne</option>
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input type="number" label="Ilość" value={draft.quantity} onChange={(e) => set('quantity', Number(e.target.value))} />
        <Input label="Jednostka" value={draft.unit} onChange={(e) => set('unit', e.target.value)} placeholder="szt. / m / l" />
      </div>
      <Input label="Miejsce przechowywania" value={draft.place} onChange={(e) => set('place', e.target.value)} placeholder="np. Magazyn główny, Bus 1" />
      <Input type="number" label="Wartość łączna (PLN)" value={draft.value} onChange={(e) => set('value', Number(e.target.value))} />
      <Input label="Notatka" value={draft.note} onChange={(e) => set('note', e.target.value)} />

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
