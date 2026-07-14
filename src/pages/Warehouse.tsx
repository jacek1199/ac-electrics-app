import { useMemo, useState } from 'react'
import { useStore, emptyWarehouseItem } from '../lib/store'
import type { WarehouseItem, WarehouseCategory } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { SortSelect } from '../components/ui/SortSelect'
import { DragList } from '../components/ui/DragList'
import { WarehouseForm } from '../components/warehouse/WarehouseForm'
import { PriorityBadge, priorityOrder } from '../components/ui/Badge'
import { fmtPLN } from '../lib/calc'
import { IconPlus, IconWarehouse } from '../components/layout/icons'

const categoryLabels: Record<WarehouseCategory, string> = {
  sprzet: 'Sprzęt', materialy: 'Materiały', auta: 'Auta', nieruchomosci: 'Nieruchomości / miejsca', inne: 'Inne',
}

type SortMode = 'inteligentne' | 'custom' | 'priorytet' | 'az' | 'wartosc_rosnaco' | 'wartosc_malejaco'

const sortOptions = [
  { value: 'inteligentne', label: 'Automatycznie (priorytet, cena)' },
  { value: 'custom', label: 'Kolejność własna' },
  { value: 'priorytet', label: 'Priorytet' },
  { value: 'az', label: 'Nazwa A-Z' },
  { value: 'wartosc_rosnaco', label: 'Wartość rosnąco' },
  { value: 'wartosc_malejaco', label: 'Wartość malejąco' },
]

function sortItems(items: WarehouseItem[], mode: SortMode): WarehouseItem[] {
  const arr = [...items]
  arr.sort((a, b) => {
    switch (mode) {
      case 'priorytet':
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.name.localeCompare(b.name, 'pl')
      case 'az':
        return a.name.localeCompare(b.name, 'pl')
      case 'wartosc_rosnaco':
        return a.value - b.value
      case 'wartosc_malejaco':
        return b.value - a.value
      case 'custom':
        return a.sortOrder - b.sortOrder
      default:
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.value - b.value
    }
  })
  return arr
}

export function Warehouse() {
  const items = useStore((s) => s.warehouse)
  const reorderWarehouse = useStore((s) => s.reorderWarehouse)
  const [editing, setEditing] = useState<WarehouseItem | null>(null)
  const [category, setCategory] = useState<WarehouseCategory | 'wszystkie'>('wszystkie')
  const [sortMode, setSortMode] = useState<SortMode>('inteligentne')

  const filtered = useMemo(() => items.filter((i) => category === 'wszystkie' || i.category === category), [items, category])
  const sorted = sortItems(filtered, sortMode)
  const totalValue = filtered.reduce((a, i) => a + i.value, 0)

  const handleReorder = (newOrder: WarehouseItem[]) => {
    const updated = newOrder.map((i, idx) => ({ ...i, sortOrder: idx }))
    const updatedIds = new Set(updated.map((i) => i.id))
    const rest = items.filter((i) => !updatedIds.has(i.id))
    reorderWarehouse([...updated, ...rest])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Magazyn"
        subtitle={`Łączna wartość: ${fmtPLN(totalValue)}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <SortSelect value={sortMode} onChange={(v) => setSortMode(v as SortMode)} options={sortOptions} />
            <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyWarehouseItem())}>
              Dodaj pozycję
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(['wszystkie', 'sprzet', 'materialy', 'auta', 'nieruchomosci', 'inne'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${category === c ? 'bg-gold/15 border-gold/40 text-gold-bright' : 'bg-navy-800 border-navy-600 text-ink-300'}`}
          >
            {c === 'wszystkie' ? 'Wszystkie' : categoryLabels[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconWarehouse className="w-6 h-6" />} title="Magazyn jest pusty" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DragList
            items={sorted}
            onReorder={handleReorder}
            disabled={sortMode !== 'custom'}
            renderItem={(i, dragHandle) => (
              <Card sweep className="p-4 cursor-pointer hover:border-gold/40 relative" onClick={() => setEditing(i)}>
                {dragHandle && <div className="absolute top-2 left-2 bg-navy-900/80 rounded-md">{dragHandle}</div>}
                <div className={`flex items-start justify-between gap-2 mb-2 ${dragHandle ? 'pl-6' : ''}`}>
                  <h3 className="font-head font-semibold text-ink-100">{i.name}</h3>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-teal/15 text-teal-bright border border-teal/30 shrink-0">{categoryLabels[i.category]}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge priority={i.priority} />
                  <span className="text-xs text-ink-500">{i.place || 'Brak lokalizacji'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                  <span className="text-sm text-ink-300">{i.quantity} {i.unit}</span>
                  <span className="font-head font-bold text-gold-bright text-sm">{fmtPLN(i.value)}</span>
                </div>
              </Card>
            )}
          />
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name || 'Pozycja magazynowa'}>
        {editing && <WarehouseForm item={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
