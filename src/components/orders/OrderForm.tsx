import { useState } from 'react'
import type { Order, OrderStatus, ShoppingItem } from '../../lib/types'
import { useStore, emptyShoppingItem } from '../../lib/store'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { LocationPicker } from '../map/LocationPicker'
import { computeOrderProfit } from '../../lib/calc'
import { fmtPLN } from '../../lib/calc'
import { RateSuggestion } from '../ui/RateSuggestion'
import { IconTrash, IconCheck, IconClock, IconX as IconCancel, IconPlus, IconShopping } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function OrderForm({ order, onClose }: { order: Order; onClose: () => void }) {
  const [draft, setDraft] = useState<Order>(order)
  const wasAlreadyCompleted = order.status === 'zakonczone'
  const employees = useStore((s) => s.employees)
  const coupons = useStore((s) => s.coupons)
  const shopping = useStore((s) => s.shopping)
  const addOrder = useStore((s) => s.addOrder)
  const updateOrder = useStore((s) => s.updateOrder)
  const removeOrder = useStore((s) => s.removeOrder)
  const addShoppingItem = useStore((s) => s.addShoppingItem)
  const removeShoppingItem = useStore((s) => s.removeShoppingItem)
  const isNew = !useStore.getState().orders.some((o) => o.id === order.id)

  const [purchaseDraft, setPurchaseDraft] = useState({ name: '', quantity: 1, price: 0 })

  const set = <K extends keyof Order>(key: K, value: Order[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setClient = <K extends keyof Order['client']>(key: K, value: Order['client'][K]) =>
    setDraft((d) => ({ ...d, client: { ...d.client, [key]: value } }))
  const setCosts = <K extends keyof Order['costs']>(key: K, value: Order['costs'][K]) =>
    setDraft((d) => ({ ...d, costs: { ...d.costs, [key]: value } }))

  const profit = computeOrderProfit(draft)
  const orderPurchases = shopping.filter((i) => i.relatedOrderId === draft.id)

  const addPurchase = () => {
    if (!purchaseDraft.name.trim()) {
      pushToast('Podaj nazwę zakupu', 'danger')
      return
    }
    const item: ShoppingItem = {
      ...emptyShoppingItem(),
      name: purchaseDraft.name,
      quantity: purchaseDraft.quantity,
      price: purchaseDraft.price,
      relatedOrderId: draft.id,
      note: `Do zlecenia: ${draft.title || 'bez tytułu'}`,
    }
    addShoppingItem(item)
    setCosts('materials', draft.costs.materials + purchaseDraft.quantity * purchaseDraft.price)
    setPurchaseDraft({ name: '', quantity: 1, price: 0 })
    pushToast('Dodano do listy zakupów i kosztów zlecenia')
  }

  const removePurchase = (item: ShoppingItem) => {
    removeShoppingItem(item.id)
    setCosts('materials', Math.max(0, draft.costs.materials - item.price * item.quantity))
  }

  const applyCoupon = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId)
    setDraft((d) => ({ ...d, couponId: coupon?.id, discountPercent: coupon ? coupon.percent : 0 }))
  }

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
        <div className="sm:col-span-2">
          <RateSuggestion
            text={`${draft.title} ${draft.description}`}
            applyLabel="Wstaw jako kwotę zlecenia"
            onApply={(mid) => {
              set('price', mid)
              pushToast('Wstawiono szacunkową kwotę zlecenia')
            }}
          />
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
        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Potrzebne zakupy</h4>
        <p className="text-xs text-ink-500 mb-3">Dodane pozycje trafiają od razu na listę zakupów i do kosztu materiałów tego zlecenia.</p>
        {orderPurchases.length > 0 && (
          <div className="space-y-2 mb-3">
            {orderPurchases.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 text-sm bg-navy-950/60 border border-navy-700 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <IconShopping className="w-3.5 h-3.5 text-teal-bright shrink-0" />
                  <span className="text-ink-100 truncate">{i.name} {i.quantity > 1 && <span className="text-ink-500">×{i.quantity}</span>}</span>
                  {i.bought && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success border border-success/30 shrink-0">Kupione</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-ink-100">{fmtPLN(i.price * i.quantity)}</span>
                  <button type="button" onClick={() => removePurchase(i)} className="text-ink-500 hover:text-danger p-1">
                    <IconTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
          <Input label="Nazwa (np. miernik)" value={purchaseDraft.name} onChange={(e) => setPurchaseDraft((d) => ({ ...d, name: e.target.value }))} />
          <Input type="number" label="Ilość" className="sm:w-20" value={purchaseDraft.quantity} onChange={(e) => setPurchaseDraft((d) => ({ ...d, quantity: Number(e.target.value) }))} />
          <Input type="number" label="Cena (PLN)" className="sm:w-28" value={purchaseDraft.price} onChange={(e) => setPurchaseDraft((d) => ({ ...d, price: Number(e.target.value) }))} />
          <Button variant="subtle" icon={<IconPlus className="w-4 h-4" />} onClick={addPurchase}>Dodaj</Button>
        </div>
      </section>

      <section>
        <h4 className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Koszty i wyliczenie zysku</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Select label="Kupon / rabat" value={draft.couponId ?? ''} onChange={(e) => applyCoupon(e.target.value)}>
            <option value="">Brak</option>
            {coupons.filter((c) => c.active).map((c) => (
              <option key={c.id} value={c.id}>{c.name} (-{c.percent}%)</option>
            ))}
          </Select>
          <Input
            type="number"
            label="Rabat ręcznie (%)"
            value={draft.discountPercent}
            onChange={(e) => setDraft((d) => ({ ...d, discountPercent: Number(e.target.value), couponId: undefined }))}
            hint={draft.couponId ? 'Zmiana wartości odepnie wybrany kupon' : undefined}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <Input type="number" label="Materiały (PLN)" value={draft.costs.materials} onChange={(e) => setCosts('materials', Number(e.target.value))} />
          <Input type="number" label="Robocizna / pracownicy (PLN)" value={draft.costs.labor} onChange={(e) => setCosts('labor', Number(e.target.value))} />
          <Input type="number" label="Paliwo / dojazd (PLN)" value={draft.costs.fuel} onChange={(e) => setCosts('fuel', Number(e.target.value))} />
          <Input type="number" label="Podatek (%)" value={draft.costs.taxPercent} onChange={(e) => setCosts('taxPercent', Number(e.target.value))} />
          <Input type="number" label="Inne koszty (PLN)" value={draft.costs.other} onChange={(e) => setCosts('other', Number(e.target.value))} />
          <Input type="number" label="Twój udział — Jacek (% zysku)" value={draft.jacekPercent} onChange={(e) => set('jacekPercent', Number(e.target.value))} hint="Liczone od zysku zlecenia, nie od kwoty zlecenia" />
        </div>

        <div className="rounded-xl border border-navy-600 bg-navy-950/60 p-4 space-y-1.5 text-sm">
          <Row label="Kwota zlecenia (przed rabatem)" value={fmtPLN(profit.grossPrice)} />
          {draft.discountPercent > 0 && (
            <Row label={`Rabat (${draft.discountPercent}%)`} value={`− ${fmtPLN(profit.discount)}`} gold />
          )}
          <Row label="Kwota po rabacie" value={fmtPLN(profit.price)} strong />
          <div className="border-t border-navy-700 my-2" />
          <Row label="Materiały" value={`− ${fmtPLN(profit.materials)}`} muted />
          <Row label="Robocizna" value={`− ${fmtPLN(profit.labor)}`} muted />
          <Row label="Paliwo / dojazd" value={`− ${fmtPLN(profit.fuel)}`} muted />
          <Row label={`Podatek (${draft.costs.taxPercent}%)`} value={`− ${fmtPLN(profit.tax)}`} muted />
          <Row label="Inne koszty" value={`− ${fmtPLN(profit.other)}`} muted />
          <div className="border-t border-navy-700 my-2" />
          <Row label="Zysk zlecenia (przed podziałem)" value={fmtPLN(profit.price - profit.totalCosts)} />
          <Row label={`Twój udział — Jacek (${draft.jacekPercent}% zysku)`} value={`− ${fmtPLN(profit.jacekCut)}`} gold />
          <div className="border-t border-navy-700 my-2" />
          <Row label="Zysk netto (firma)" value={fmtPLN(profit.netProfit)} strong />
        </div>
      </section>

      {draft.status === 'zakonczone' && !wasAlreadyCompleted && (
        <section className="rounded-xl border-2 border-gold/40 bg-gold/5 p-4">
          <h4 className="font-head text-sm font-bold text-gold-bright mb-2">Potwierdzenie zakończenia zlecenia</h4>
          <p className="text-xs text-ink-300 mb-3">
            Sprawdź jeszcze raz kwotę i koszty powyżej — po zatwierdzeniu to zlecenie zostanie policzone w przychodach i zysku firmy.
          </p>
          <div className="flex items-center justify-between text-sm bg-navy-950/60 rounded-lg px-3 py-2">
            <span className="text-ink-300">Zysk netto do zaksięgowania</span>
            <span className={`font-head font-bold ${profit.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>{fmtPLN(profit.netProfit)}</span>
          </div>
        </section>
      )}

      <Textarea label="Notatki" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />

      <div className="flex items-center justify-between pt-2 border-t border-navy-700">
        {!isNew ? (
          <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>
            Usuń zlecenie
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="subtle" size="md" onClick={onClose}>Anuluj</Button>
          <Button variant="primary" size="md" onClick={save}>
            {draft.status === 'zakonczone' && !wasAlreadyCompleted ? 'Zatwierdź zakończenie i zapisz' : 'Zapisz zlecenie'}
          </Button>
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
