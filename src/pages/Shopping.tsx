import { useMemo, useState } from 'react'
import { useStore, emptyShoppingItem } from '../lib/store'
import { newId } from '../lib/id'
import type { ShoppingItem, ShoppingCategory } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { ShoppingForm } from '../components/shopping/ShoppingForm'
import { fmtPLN, fmtDate } from '../lib/calc'
import { IconPlus, IconShopping, IconWallet } from '../components/layout/icons'
import { pushToast } from '../components/ui/toastBus'

const categoryLabels: Record<ShoppingCategory, string> = {
  sprzet: 'Sprzęt', auta: 'Auta', materialy: 'Materiały', inne: 'Inne',
}

export function Shopping() {
  const items = useStore((s) => s.shopping)
  const updateShoppingItem = useStore((s) => s.updateShoppingItem)
  const addTransaction = useStore((s) => s.addTransaction)
  const [editing, setEditing] = useState<ShoppingItem | null>(null)
  const [category, setCategory] = useState<ShoppingCategory | 'wszystkie'>('wszystkie')

  const filtered = useMemo(
    () => items.filter((i) => category === 'wszystkie' || i.category === category),
    [items, category],
  )

  const total = filtered.reduce((a, i) => a + i.price * i.quantity, 0)
  const toBuy = filtered.filter((i) => !i.bought)
  const bought = filtered.filter((i) => i.bought)

  const toggleBought = (item: ShoppingItem) => updateShoppingItem({ ...item, bought: !item.bought })

  const addToExpenses = (item: ShoppingItem) => {
    addTransaction({
      id: newId(),
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      amount: item.price * item.quantity,
      label: item.name,
      expenseKind: 'jednorazowe',
      note: 'Dodano automatycznie z listy zakupów',
    })
    updateShoppingItem({ ...item, addedToExpenses: true })
    pushToast('Dodano do wydatków firmy')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zakupy"
        subtitle={`Łączna wartość listy: ${fmtPLN(total)}`}
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyShoppingItem())}>
            Dodaj produkt
          </Button>
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
              {toBuy.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-navy-700">
                  <input type="checkbox" checked={i.bought} onChange={() => toggleBought(i)} className="accent-gold w-4 h-4 shrink-0" />
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(i)}>
                    <div className="text-sm text-ink-100 truncate">{i.name} {i.quantity > 1 && <span className="text-ink-500">×{i.quantity}</span>}</div>
                    <div className="text-[11px] text-ink-500">{categoryLabels[i.category]} · {fmtDate(i.date)}</div>
                  </div>
                  <div className="text-sm font-semibold text-ink-100 shrink-0">{fmtPLN(i.price * i.quantity)}</div>
                </div>
              ))}
              {toBuy.length === 0 && <p className="text-sm text-ink-500">Wszystko kupione 🎉</p>}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-head font-semibold text-ink-100 mb-3">Kupione ({bought.length})</h3>
            <div className="space-y-2">
              {bought.map((i) => (
                <div key={i.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/40 border border-navy-800">
                  <input type="checkbox" checked={i.bought} onChange={() => toggleBought(i)} className="accent-gold w-4 h-4 shrink-0" />
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setEditing(i)}>
                    <div className="text-sm text-ink-300 truncate line-through">{i.name}</div>
                    <div className="text-[11px] text-ink-500">{categoryLabels[i.category]} · {fmtPLN(i.price * i.quantity)}</div>
                  </div>
                  {!i.addedToExpenses ? (
                    <Button size="sm" variant="ghost" icon={<IconWallet className="w-3.5 h-3.5" />} onClick={() => addToExpenses(i)}>
                      Do wydatków
                    </Button>
                  ) : (
                    <span className="text-[11px] text-success shrink-0">W wydatkach ✓</span>
                  )}
                </div>
              ))}
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
