import { useMemo, useState } from 'react'
import { useStore, emptyWarehouseItem } from '../lib/store'
import type { WarehouseItem, WarehouseCategory } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { WarehouseForm } from '../components/warehouse/WarehouseForm'
import { fmtPLN } from '../lib/calc'
import { IconPlus, IconWarehouse } from '../components/layout/icons'

const categoryLabels: Record<WarehouseCategory, string> = {
  sprzet: 'Sprzęt', materialy: 'Materiały', auta: 'Auta', nieruchomosci: 'Nieruchomości / miejsca', inne: 'Inne',
}

export function Warehouse() {
  const items = useStore((s) => s.warehouse)
  const [editing, setEditing] = useState<WarehouseItem | null>(null)
  const [category, setCategory] = useState<WarehouseCategory | 'wszystkie'>('wszystkie')

  const filtered = useMemo(() => items.filter((i) => category === 'wszystkie' || i.category === category), [items, category])
  const totalValue = filtered.reduce((a, i) => a + i.value, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Magazyn"
        subtitle={`Łączna wartość: ${fmtPLN(totalValue)}`}
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyWarehouseItem())}>
            Dodaj pozycję
          </Button>
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
          {filtered.map((i) => (
            <Card key={i.id} sweep className="p-4 cursor-pointer hover:border-gold/40" onClick={() => setEditing(i)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-head font-semibold text-ink-100">{i.name}</h3>
                <span className="text-[10px] px-2 py-1 rounded-full bg-teal/15 text-teal-bright border border-teal/30 shrink-0">{categoryLabels[i.category]}</span>
              </div>
              <div className="text-xs text-ink-500 mb-3">{i.place || 'Brak lokalizacji'}</div>
              <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                <span className="text-sm text-ink-300">{i.quantity} {i.unit}</span>
                <span className="font-head font-bold text-gold-bright text-sm">{fmtPLN(i.value)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name || 'Pozycja magazynowa'}>
        {editing && <WarehouseForm item={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
