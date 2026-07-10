import { useState } from 'react'
import type { Order, OrderStatus } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { LocationPicker } from '../map/LocationPicker'
import { computeOrderProfit } from '../../lib/calc'
import { fmtPLN } from '../../lib/calc'
import { IconTrash, IconCheck, IconClock, IconX as IconCancel } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function OrderForm({ order, onClose }: { order: Order; onClose: () => void }) {
  const [draft, setDraft] = useState<Order>(order)
  const employees = useStore((s) => s.employees)
  const addOrder = useStore((s) => s.addOrder)
  const updateOrder = useStore((s) => s.updateOrder)
  const removeOrder = useStore((s) => s.removeOrder)
  const isNew = !useStore.getState().orders.some((o) => o.id === order.id)

  const set = <K extends keyof Order>(key: K, value: Order[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setClient = <K extends keyof Order['client']>(key: K, value: Order['client'][K]) =>
    setDraft((d) => ({ ...d, client: { ...d.client, [key]: value } }))
  const setCosts = <K extends keyof Order['costs']>(key: K, value: Order['costs'][K]) =>
    setDraft((d) => ({ ...d, costs: { ...d.costs, [key]: value } }))

  const profit = computeOrderProfit(draft)

  const save = () => {
    if (!draft.title.trim()) {
      pushToast('Podaj tytuł zlecenia', 'danger')
      return
    }
    if (isNew) addOrder(draft)
    else updateOrder(draft)
    pushToast(isNew ? 'Zlecenie dodane' : 'Zlecenie zaktualizowane')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Czy na pewno usunąć to zlecenie? Tej operacji nie można cofnąć.', 'Usuń zlecenie')
    if (!ok) return
    removeOrder(draft.id)
    pushToast('Zlecenie usunięte', 'info')
    onClose()
  }

  const transition = (status: OrderStatus) => {
    const now = new Date().toISOString()
    const patch: Partial<Order> = { status }
    if (status === 'w_trakcie' && !draft.startedAt) patch.startedAt = now
    if (status === 'zakonczone') patch.completedAt = now
    setDraft((d) => ({ ...d, ...patch }))
  }

  const toggleEmployee = (id: string) => {
    setDraft((d) => ({
      ...d,
      assignedEmployeeIds: d.assignedEmployeeIds.includes(id)
        ? d.assignedEmployeeIds.filter((x) => x !== id)
        : [...d.assignedEmployeeIds, id],
    }))
  }

  return (
    <div className="space-y-6">
      {/* status actions */}
      <div className="flex flex-wrap items-center gap-2">
        {draft.status === 'nowe' && (
          <Button variant="primary" size="sm" icon={<IconClock className="w-4 h-4" />} onClick={() => transition('w_trakcie')}>
            Rozpocznij realizację
          </Button>
        )}
        {draft.status === 'w_trakcie' && (
          <Button variant="primary" size="sm" icon={<IconCheck className="w-4 h-4" />} onClick={() => transition('zakonczone')}>
            Zakończ zlecenie
          </Button>
        )}
        {draft.status !== 'anulowane' && draft.status !== 'zakonczone' && (
          <Button variant="danger" size="sm" icon={<IconCancel className="w-4 h-4" />} onClick={() => transition('anulowane')}>
            Anuluj zlecenie
          </Button>
        )}
        <Select
          value={draft.status}
          onChange={(e) => transition(e.target.value as OrderStatus)}
          className="w-auto ml-auto"
        >
          <option value="nowe">Status: Nowe</option>
          <option value="w_trakcie">Status: W trakcie</option>
          <option value="zakonczone">Status: Zakończone</option>
          <option value="anulowane">Status: Anulowane</option>
        </Select>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Tytuł zlecenia" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="np. Wymiana rozdzielnicy — ul. Krótka 4" />
        <Select label="Źródło przychodu" value={draft.incomeSource} onChange={(e) => set('incomeSource', e.target.value as Order['incomeSource'])}>
          <option value="klasyczne">Klasyczne zlecenie</option>
          <option value="odwrocone">Odwrócone zlecenie</option>
          <option value="inne">Inne</option>
        </Select>
        <div className="sm:col-span-2">
          <Textarea label="Opis zlecenia" value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Zakres prac, szczegóły…" />
        </div>
      </section>

      <section>
        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Lokalizacja</h4>
        <LocationPicker value={draft.location} onChange={(loc) => set('location', loc)} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <h4 className="sm:col-span-2 text-xs font-bold tracking-wide text-ink-500 uppercase -mb-2">Dane klienta</h4>
        <Input label="Imię i nazwisko / firma" value={draft.client.name} onChange={(e) => setClient('name', e.target.value)} />
        <Input label="Telefon" value={draft.client.phone} onChange={(e) => setClient('phone', e.target.value)} />
        <Input label="E-mail" value={draft.client.email} onChange={(e) => setClient('email', e.target.value)} />
        <Input label="Adres" value={draft.client.address} onChange={(e) => setClient('address', e.target.value)} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="date" label="Termin realizacji" value={draft.deadline ?? ''} onChange={(e) => set('deadline', e.target.value)} />
        <Select label="Sposób płatności" value={draft.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as Order['paymentMethod'])}>
          <option value="gotowka">Gotówka</option>
          <option value="przelew">Przelew</option>
          <option value="karta">Karta</option>
          <option value="inne">Inne</option>
        </Select>
        <Input type="number" label="Kwota zlecenia (PLN)" value={draft.price} onChange={(e) => set('price', Number(e.target.value))} />
      </section>

      <section>
        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Zespół przypisany do zlecenia</h4>
        {employees.length === 0 ? (
          <p className="text-sm text-ink-500">Brak pracowników — dodaj ich w module Pracownicy.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {employees.map((e) => (
              <button
                type="button"
                key={e.id}
                onClick={() => toggleEmployee(e.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  draft.assignedEmployeeIds.includes(e.id)
                    ? 'bg-gold/15 border-gold/40 text-gold-bright'
                    : 'bg-navy-800 border-navy-600 text-ink-300 hover:border-teal-bright/40'
                }`}
              >
                {e.firstName} {e.lastName}
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Koszty i wyliczenie zysku</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <Input type="number" label="Materiały (PLN)" value={draft.costs.materials} onChange={(e) => setCosts('materials', Number(e.target.value))} />
          <Input type="number" label="Robocizna / pracownicy (PLN)" value={draft.costs.labor} onChange={(e) => setCosts('labor', Number(e.target.value))} />
          <Input type="number" label="Paliwo / dojazd (PLN)" value={draft.costs.fuel} onChange={(e) => setCosts('fuel', Number(e.target.value))} />
          <Input type="number" label="Podatek (%)" value={draft.costs.taxPercent} onChange={(e) => setCosts('taxPercent', Number(e.target.value))} />
          <Input type="number" label="Inne koszty (PLN)" value={draft.costs.other} onChange={(e) => setCosts('other', Number(e.target.value))} />
          <Input type="number" label="Twój udział — Jacek (%)" value={draft.jacekPercent} onChange={(e) => set('jacekPercent', Number(e.target.value))} />
        </div>

        <div className="rounded-xl border border-navy-600 bg-navy-950/60 p-4 space-y-1.5 text-sm">
          <Row label="Kwota zlecenia" value={fmtPLN(profit.price)} />
          <Row label="Materiały" value={`− ${fmtPLN(profit.materials)}`} muted />
          <Row label="Robocizna" value={`− ${fmtPLN(profit.labor)}`} muted />
          <Row label="Paliwo / dojazd" value={`− ${fmtPLN(profit.fuel)}`} muted />
          <Row label={`Podatek (${draft.costs.taxPercent}%)`} value={`− ${fmtPLN(profit.tax)}`} muted />
          <Row label="Inne koszty" value={`− ${fmtPLN(profit.other)}`} muted />
          <Row label={`Twój udział — Jacek (${draft.jacekPercent}%)`} value={`− ${fmtPLN(profit.jacekCut)}`} gold />
          <div className="border-t border-navy-700 my-2" />
          <Row label="Zysk netto (firma)" value={fmtPLN(profit.netProfit)} strong />
        </div>
      </section>

      <Textarea label="Notatki" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />

      <div className="flex items-center justify-between pt-2 border-t border-navy-700">
        {!isNew ? (
          <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>
            Usuń zlecenie
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="subtle" size="md" onClick={onClose}>Anuluj</Button>
          <Button variant="primary" size="md" onClick={save}>Zapisz zlecenie</Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, muted, gold, strong }: { label: string; value: string; muted?: boolean; gold?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-ink-500' : gold ? 'text-gold' : strong ? 'text-ink-100 font-bold font-head' : 'text-ink-300'}>{label}</span>
      <span className={muted ? 'text-ink-400' : gold ? 'text-gold-bright font-semibold' : strong ? 'text-success font-bold font-head text-base' : 'text-ink-100 font-medium'}>{value}</span>
    </div>
  )
}
