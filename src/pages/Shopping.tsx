import { useMemo, useState } from 'react'
import { useStore, emptyShoppingItem } from '../lib/store'
import { newId } from '../lib/id'
import type { ShoppingItem, ShoppingCategory } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { SortSelect } from '../components/ui/SortSelect'
import { DragList } from '../components/ui/DragList'
import { PriorityBadge, priorityOrder } from '../components/ui/Badge'
import { ShoppingForm } from '../components/shopping/ShoppingForm'
import { fmtPLN, fmtDate } from '../lib/calc'
import { IconPlus, IconShopping, IconWallet } from '../components/layout/icons'
import { pushToast } from '../components/ui/toastBus'

const categoryLabels: Record<ShoppingCategory, string> = {
  sprzet: 'Sprzęt', auta: 'Auta', materialy: 'Materiały', inne: 'Inne',
}

type SortMode = 'inteligentne' | 'custom' | 'priorytet' | 'az' | 'najnowsze' | 'cena_rosnaco' | 'cena_malejaco'

const sortOptions = [
  { value: 'inteligentne', label: 'Automatycznie (priorytet, termin, cena)' },
  { value: 'custom', label: 'Kolejność własna' },
  { value: 'priorytet', label: 'Priorytet' },
  { value: 'az', label: 'Nazwa A-Z' },
  { value: 'najnowsze', label: 'Najnowsze' },
  { value: 'cena_rosnaco', label: 'Cena rosnąco' },
  { value: 'cena_malejaco', label: 'Cena malejąco' },
]

function sortItems(items: ShoppingItem[], mode: SortMode): ShoppingItem[] {
  const arr = [...items]
  arr.sort((a, b) => {
    switch (mode) {
      case 'priorytet':
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.name.localeCompare(b.name, 'pl')
      case 'az':
        return a.name.localeCompare(b.name, 'pl')
      case 'najnowsze':
        return b.date.localeCompare(a.date)
      case 'cena_rosnaco':
        return a.price * a.quantity - b.price * b.quantity
      case 'cena_malejaco':
        return b.price * b.quantity - a.price * a.quantity
      case 'custom':
        return a.sortOrder - b.sortOrder
      default:
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.date.localeCompare(b.date) || a.price * a.quantity - b.price * b.quantity
    }
  })
  return arr
}

export function Shopping() {
  const items = useStore((s) => s.shopping)
  const updateShoppingItem = useStore((s) => s.updateShoppingItem)
  const addTransaction = useStore((s) => s.addTransaction)
  const removeTransaction = useStore((s) => s.removeTransaction)
  const reorderShopping = useStore((s) => s.reorderShopping)
  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const [category, setCategory] = useState<ShoppingCategory | 'wszystkie'>('wszystkie')
  const [sortMode, setSortMode] = useState<SortMode>('inteligentne')

  const filtered = useMemo(
    () => items.filter((i) => category === 'wszystkie' || i.category === category),
    [items, category],
  )

  const total = filtered.reduce((a, i) => a + i.price * i.quantity, 0)
  const toBuy = sortItems(filtered.filter((i) => !i.bought), sortMode)
  const bought = sortItems(filtered.filter((i) => i.bought), sortMode)

  // Marking something as bought is what confirms the expense — no extra
  // step needed. Un-checking it removes the expense again.
  const toggleBought = (item: ShoppingItem) => {
    const nextBought = !item.bought
    if (nextBought) {
      const txId = newId()
      addTransaction({
        id: txId,
        type: 'expense',
        date: new Date().toISOString().slice(0, 10),
        amount: item.price * item.quantity,
        label: item.name,
        expenseKind: 'jednorazowe',
        note: 'Dodano automatycznie z listy zakupów',
      })
      updateShoppingItem({ ...item, bought: true, addedToExpenses: true, expenseTransactionId: txId })
      pushToast('Oznaczono jako kupione — dodano do wydatków')
    } else {
      if (item.expenseTransactionId) removeTransaction(item.expenseTransactionId)
      updateShoppingItem({ ...item, bought: false, addedToExpenses: false, expenseTransactionId: undefined })
      pushToast('Cofnięto zakup i wydatek', 'info')
    }
  }

  const handleReorder = (newOrder: ShoppingItem[]) => {
    const updated = newOrder.map((i, idx) => ({ ...i, sortOrder: idx }))
    const updatedIds = new Set(updated.map((i) => i.id))
    const rest = items.filter((i) => !updatedIds.has(i.id))
    reorderShopping([...updated, ...rest])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zakupy"
        subtitle={`Łączna wartość listy: ${fmtPLN(total)}`}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <SortSelect value={sortMode} onChange={(v) => setSortMode(v as SortMode)} options={sortOptions} />
            <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyShoppingItem())}>
              Dodaj produkt
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(['wszystkie', 'sprzet', 'auta', 'materialy', 'inne'] as const).map((c) => (
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
        <Card className="p-2"><EmptyState icon={<IconShopping className="w-6 h-6" />} title="Lista zakupów jest pusta" /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-head font-semibold text-ink-100 mb-3">Do kupienia ({toBuy.length})</h3>
            <div className="space-y-2">
              <DragList
                items={toBuy}
                onReorder={handleReorder}
                disabled={sortMode !== 'custom'}
                renderItem={(i, dragHandle) => (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950/60 border border-navy-700">
                    {dragHandle}
                    <input type="checkbox" checked={i.bought} onChange={() => toggleBought(i)} className="accent-gold w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(i)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm text-ink-100 truncate">{i.name} {i.quantity > 1 && <span className="text-ink-500">×{i.quantity}</span>}</div>
                        <PriorityBadge priority={i.priority} />
                      </div>
                      <div className="text-[11px] text-ink-500">{categoryLabels[i.category]} · {fmtDate(i.date)}</div>
                    </div>
                    <div className="text-sm font-semibold text-ink-100 shrink-0">{fmtPLN(i.price * i.quantity)}</div>
                  </div>
                )}
              />
              {toBuy.length === 0 && <p className="text-sm text-ink-500">Wszystko kupione 🎉</p>}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-head font-semibold text-ink-100 mb-3">Kupione ({bought.length})</h3>
            <div className="space-y-2">
              <DragList
                items={bought}
                onReorder={handleReorder}
                disabled={sortMode !== 'custom'}
                renderItem={(i, dragHandle) => (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-950/40 border border-navy-800">
                    {dragHandle}
                    <input type="checkbox" checked={i.bought} onChange={() => toggleBought(i)} className="accent-gold w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(i)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm text-ink-300 truncate line-through">{i.name}</div>
                        <PriorityBadge priority={i.priority} />
                      </div>
                      <div className="text-[11px] text-ink-500">{categoryLabels[i.category]} · {fmtPLN(i.price * i.quantity)}</div>
                    </div>
                    <span className="text-[11px] text-success shrink-0 flex items-center gap-1">
                      <IconWallet className="w-3 h-3" /> W wydatkach
                    </span>
                  </div>
                )}
              />
              {bought.length === 0 && <p className="text-sm text-ink-500">Brak kupionych pozycji</p>}
            </div>
          </Card>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name || 'Produkt'}>
        {editing && <ShoppingForm item={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
