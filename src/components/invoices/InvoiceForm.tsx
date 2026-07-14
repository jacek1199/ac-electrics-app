import { useState } from 'react'
import type { Invoice, InvoiceItem } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash, IconPlus, IconDownload } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'
import { generateInvoicePdf } from '../../lib/pdf'
import { computeOrderProfit } from '../../lib/calc'

export function InvoiceForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [draft, setDraft] = useState<Invoice>(invoice)
  const [downloading, setDownloading] = useState(false)
  const orders = useStore((s) => s.orders)
  const company = useStore((s) => s.company)
  const addInvoice = useStore((s) => s.addInvoice)
  const updateInvoice = useStore((s) => s.updateInvoice)
  const removeInvoice = useStore((s) => s.removeInvoice)
  const nextInvoiceNumber = useStore((s) => s.nextInvoiceNumber)
  const isNew = !useStore.getState().invoices.some((i) => i.id === invoice.id)

  const set = <K extends keyof Invoice>(key: K, value: Invoice[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setBuyer = <K extends keyof Invoice['buyer']>(key: K, value: Invoice['buyer'][K]) =>
    setDraft((d) => ({ ...d, buyer: { ...d.buyer, [key]: value } }))
  const setItem = (i: number, patch: Partial<InvoiceItem>) =>
    setDraft((d) => ({ ...d, items: d.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }))

  const fillFromOrder = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId)
    if (!o) return
    const finalPrice = computeOrderProfit(o).price
    setDraft((d) => ({
      ...d,
      orderId: o.id,
      buyer: { name: o.client.name, address: o.client.address, nip: '' },
      items: [{ description: o.title || 'Usługa elektryczna', quantity: 1, unit: 'usł.', unitPriceNet: finalPrice, vatRate: 23 }],
    }))
  }

  const save = () => {
    let num = draft.number
    if (!num) num = nextInvoiceNumber()
    const final = { ...draft, number: num }
    if (isNew) addInvoice(final)
    else updateInvoice(final)
    setDraft(final)
    pushToast(isNew ? 'Faktura wystawiona' : 'Faktura zaktualizowana')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć tę fakturę?', 'Usuń fakturę')
    if (!ok) return
    removeInvoice(draft.id)
    pushToast('Faktura usunięta', 'info')
    onClose()
  }

  const download = async () => {
    if (!company.nip) {
      pushToast('Uzupełnij NIP firmy w Danych firmy — jest wymagany na fakturze VAT', 'danger')
    }
    setDownloading(true)
    try {
      let num = draft.number
      if (!num) {
        num = nextInvoiceNumber()
        setDraft((d) => ({ ...d, number: num }))
      }
      const doc = await generateInvoicePdf({ ...draft, number: num }, company)
      doc.save(`Faktura-${num.replace(/\//g, '-')}.pdf`)
      pushToast('Faktura PDF pobrana')
    } catch {
      pushToast('Nie udało się wygenerować PDF', 'danger')
    } finally {
      setDownloading(false)
    }
  }

  const netTotal = draft.items.reduce((a, it) => a + it.quantity * it.unitPriceNet, 0)
  const grossTotal = draft.items.reduce((a, it) => a + it.quantity * it.unitPriceNet * (1 + it.vatRate / 100), 0)

  return (
    <div className="space-y-5">
      <Select label="Wypełnij ze zlecenia (opcjonalnie)" value={draft.orderId ?? ''} onChange={(e) => e.target.value && fillFromOrder(e.target.value)}>
        <option value="">— wybierz zlecenie —</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>{o.title || 'Bez tytułu'} · {o.client.name}</option>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Numer faktury" value={draft.number} placeholder="nadany automatycznie przy zapisie" onChange={(e) => set('number', e.target.value)} />
        <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value as Invoice['status'])}>
          <option value="wystawiona">Wystawiona</option>
          <option value="oplacona">Opłacona</option>
          <option value="anulowana">Anulowana</option>
        </Select>
        <Select label="Sposób płatności" value={draft.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as Invoice['paymentMethod'])}>
          <option value="przelew">Przelew</option>
          <option value="gotowka">Gotówka</option>
          <option value="karta">Karta</option>
          <option value="inne">Inne</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="date" label="Data wystawienia" value={draft.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
        <Input type="date" label="Data sprzedaży" value={draft.saleDate} onChange={(e) => set('saleDate', e.target.value)} />
        <Input type="date" label="Termin płatności" value={draft.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nabywca — nazwa" value={draft.buyer.name} onChange={(e) => setBuyer('name', e.target.value)} />
        <Input label="NIP nabywcy (opcjonalnie)" value={draft.buyer.nip} onChange={(e) => setBuyer('nip', e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Adres nabywcy" value={draft.buyer.address} onChange={(e) => setBuyer('address', e.target.value)} />
        </div>
      </div>

      <div>
        <div className="text-xs font-bold tracking-wide text-ink-500 uppercase mb-2">Pozycje faktury</div>
        <div className="space-y-2">
          {draft.items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end bg-navy-950/60 border border-navy-700 rounded-xl p-3">
              <input
                value={it.description}
                onChange={(e) => setItem(i, { description: e.target.value })}
                placeholder="Opis usługi"
                className="col-span-12 sm:col-span-4 bg-navy-950 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 outline-none focus:border-gold"
              />
              <input type="number" value={it.quantity} onChange={(e) => setItem(i, { quantity: Number(e.target.value) })} onFocus={(e) => e.target.select()} placeholder="Ilość" className="col-span-4 sm:col-span-1 bg-navy-950 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 outline-none focus:border-gold" />
              <input value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })} placeholder="J.m." className="col-span-4 sm:col-span-1 bg-navy-950 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 outline-none focus:border-gold" />
              <input type="number" value={it.unitPriceNet} onChange={(e) => setItem(i, { unitPriceNet: Number(e.target.value) })} onFocus={(e) => e.target.select()} placeholder="Cena netto" className="col-span-4 sm:col-span-2 bg-navy-950 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 outline-none focus:border-gold" />
              <input type="number" value={it.vatRate} onChange={(e) => setItem(i, { vatRate: Number(e.target.value) })} onFocus={(e) => e.target.select()} placeholder="VAT %" className="col-span-6 sm:col-span-1 bg-navy-950 border border-navy-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 outline-none focus:border-gold" />
              <div className="col-span-6 sm:col-span-2 text-sm text-ink-300 text-right pr-1 flex items-center justify-end">
                {(it.quantity * it.unitPriceNet * (1 + it.vatRate / 100)).toFixed(2)} PLN
              </div>
              <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-self-end">
                <button
                  onClick={() => setDraft((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-danger hover:bg-danger/10"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setDraft((d) => ({ ...d, items: [...d.items, { description: '', quantity: 1, unit: 'usł.', unitPriceNet: 0, vatRate: 23 }] }))}
          className="mt-2 text-xs text-teal-bright hover:text-gold flex items-center gap-1"
        >
          <IconPlus className="w-3.5 h-3.5" /> Dodaj pozycję
        </button>
      </div>

      <div className="rounded-xl border border-navy-600 bg-navy-950/60 p-4 flex justify-end gap-8">
        <div className="text-right">
          <div className="text-xs text-ink-500">Razem netto</div>
          <div className="font-head font-bold text-ink-100">{netTotal.toFixed(2)} PLN</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-500">Do zapłaty (brutto)</div>
          <div className="font-head font-bold text-gold-bright text-lg">{grossTotal.toFixed(2)} PLN</div>
        </div>
      </div>

      <Textarea label="Uwagi" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-navy-700">
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>Usuń</Button>
          )}
          <Button variant="ghost" size="sm" icon={<IconDownload className="w-4 h-4" />} onClick={download} disabled={downloading}>
            {downloading ? 'Generuję…' : 'Pobierz PDF'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={onClose}>Anuluj</Button>
          <Button variant="primary" onClick={save}>Zapisz fakturę</Button>
        </div>
      </div>
    </div>
  )
}
