import { useMemo, useState } from 'react'
import { useStore, emptyOrder } from '../lib/store'
import type { Order, OrderStatus, IncomeSource } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { StatusBadge, SourceBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { SortSelect } from '../components/ui/SortSelect'
import { OrderForm } from '../components/orders/OrderForm'
import { computeOrderProfit, fmtPLN, fmtDate } from '../lib/calc'
import { IconBolt, IconPlus, IconMapPin, IconUsers } from '../components/layout/icons'

type SortMode = 'najnowsze' | 'az' | 'cena_rosnaco' | 'cena_malejaco'

const sortOptions = [
  { value: 'najnowsze', label: 'Najnowsze' },
  { value: 'az', label: 'Nazwa A-Z' },
  { value: 'cena_rosnaco', label: 'Cena rosnąco' },
  { value: 'cena_malejaco', label: 'Cena malejąco' },
]

export function Orders() {
  const orders = useStore((s) => s.orders)
  const employees = useStore((s) => s.employees)
  const [editing, setEditing] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'wszystkie'>('wszystkie')
  const [sourceFilter, setSourceFilter] = useState<IncomeSource | 'wszystkie'>('wszystkie')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('najnowsze')

  const filtered = useMemo(() => {
    return orders
      .filter((o) => statusFilter === 'wszystkie' || o.status === statusFilter)
      .filter((o) => sourceFilter === 'wszystkie' || o.incomeSource === sourceFilter)
      .filter((o) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return o.title.toLowerCase().includes(q) || o.client.name.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        switch (sortMode) {
          case 'az':
            return a.title.localeCompare(b.title, 'pl')
          case 'cena_rosnaco':
            return a.price - b.price
          case 'cena_malejaco':
            return b.price - a.price
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
      })
  }, [orders, statusFilter, sourceFilter, search, sortMode])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zlecenia"
        subtitle={`${orders.length} zleceń łącznie`}
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyOrder())}>
            Nowe zlecenie
          </Button>
        }
      />

      <Card className="p-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po tytule lub kliencie…"
          className="flex-1 min-w-[200px] bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none focus:border-gold"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'wszystkie')}
          className="bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 outline-none focus:border-gold"
        >
          <option value="wszystkie">Wszystkie statusy</option>
          <option value="nowe">Nowe</option>
          <option value="w_trakcie">W trakcie</option>
          <option value="zakonczone">Zakończone</option>
          <option value="anulowane">Anulowane</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as IncomeSource | 'wszystkie')}
          className="bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 outline-none focus:border-gold"
        >
          <option value="wszystkie">Wszystkie źródła</option>
          <option value="klasyczne">Klasyczne zlecenie</option>
          <option value="odwrocone">Odwrócone zlecenie</option>
          <option value="inne">Inne</option>
        </select>
        <SortSelect value={sortMode} onChange={(v) => setSortMode(v as SortMode)} options={sortOptions} />
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-2">
          <EmptyState icon={<IconBolt className="w-6 h-6" />} title="Brak zleceń spełniających kryteria" hint="Dodaj nowe zlecenie lub zmień filtry." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((o) => {
            const p = computeOrderProfit(o)
            const team = employees.filter((e) => o.assignedEmployeeIds.includes(e.id))
            return (
              <Card key={o.id} sweep className="p-4 cursor-pointer hover:border-gold/40 transition-colors" onClick={() => setEditing(o)}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-head font-semibold text-ink-100 leading-snug">{o.title || 'Bez tytułu'}</h3>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <SourceBadge source={o.incomeSource} />
                </div>
                <div className="text-sm text-ink-300 mb-1">{o.client.name || 'Brak danych klienta'}</div>
                {o.location && (
                  <div className="flex items-center gap-1 text-xs text-ink-500 mb-3">
                    <IconMapPin className="w-3.5 h-3.5" /> <span className="truncate">{o.location.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                  <span>Termin: {fmtDate(o.deadline)}</span>
                  {team.length > 0 && (
                    <span className="flex items-center gap-1"><IconUsers className="w-3.5 h-3.5" /> {team.length}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                  <div>
                    <div className="text-[10px] text-ink-500 uppercase tracking-wide">Kwota</div>
                    <div className="font-head font-bold text-ink-100">{fmtPLN(o.price)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-ink-500 uppercase tracking-wide">Zysk netto</div>
                    <div className={`font-head font-bold ${p.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>{fmtPLN(p.netProfit)}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? editing.title : 'Zlecenie'} wide>
        {editing && <OrderForm order={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
