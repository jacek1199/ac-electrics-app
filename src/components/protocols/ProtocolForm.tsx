import { useRef, useState } from 'react'
import type { Protocol } from '../../lib/types'
import { useStore } from '../../lib/store'
import { useAutosave } from '../../lib/useAutosave'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash, IconDownload } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'
import { generateProtocolPdf } from '../../lib/pdf'

const canSave = (d: Protocol) => d.client.trim().length > 0 || d.scopeOfWork.trim().length > 0

export function ProtocolForm({ protocol, onClose }: { protocol: Protocol; onClose: () => void }) {
  const [draft, setDraft] = useState<Protocol>(protocol)
  const [downloading, setDownloading] = useState(false)
  const orders = useStore((s) => s.orders)
  const employees = useStore((s) => s.employees)
  const invoices = useStore((s) => s.invoices)
  const company = useStore((s) => s.company)
  const addProtocol = useStore((s) => s.addProtocol)
  const updateProtocol = useStore((s) => s.updateProtocol)
  const removeProtocol = useStore((s) => s.removeProtocol)
  const nextProtocolNumber = useStore((s) => s.nextProtocolNumber)
  const isNew = !useStore.getState().protocols.some((p) => p.id === protocol.id)
  const wasNewRef = useRef(isNew)

  const set = <K extends keyof Protocol>(key: K, value: Protocol[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const fillFromOrder = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId)
    if (!o) return
    const team = employees.filter((e) => o.assignedEmployeeIds.includes(e.id)).map((e) => `${e.firstName} ${e.lastName}`.trim())
    setDraft((d) => ({
      ...d,
      orderId: o.id,
      client: o.client.name,
      location: o.location?.address ?? '',
      scopeOfWork: o.description,
      performedBy: team,
    }))
  }

  const persist = (d: Protocol) => {
    let num = d.number
    if (!num) num = nextProtocolNumber()
    const final = { ...d, number: num }
    if (wasNewRef.current) {
      addProtocol(final)
      wasNewRef.current = false
    } else {
      updateProtocol(final)
    }
    if (num !== d.number) setDraft(final)
  }
  useAutosave(draft, canSave, persist)

  const save = () => {
    persist(draft)
    pushToast(isNew ? 'Protokół utworzony' : 'Protokół zaktualizowany')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć ten protokół?', 'Usuń protokół')
    if (!ok) return
    removeProtocol(draft.id)
    pushToast('Protokół usunięty', 'info')
    onClose()
  }

  const download = async () => {
    setDownloading(true)
    try {
      let num = draft.number
      if (!num) {
        num = nextProtocolNumber()
        setDraft((d) => ({ ...d, number: num }))
      }
      const doc = await generateProtocolPdf({ ...draft, number: num }, company)
      doc.save(`Protokol-${num.replace(/\//g, '-')}.pdf`)
      pushToast('Protokół PDF pobrany')
    } catch {
      pushToast('Nie udało się wygenerować PDF', 'danger')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Select label="Wypełnij ze zlecenia (opcjonalnie)" value={draft.orderId ?? ''} onChange={(e) => e.target.value && fillFromOrder(e.target.value)}>
        <option value="">— wybierz zlecenie —</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>{o.title || 'Bez tytułu'} · {o.client.name}</option>
        ))}
      </Select>
      <Select label="Powiąż z fakturą (opcjonalnie)" value={draft.invoiceId ?? ''} onChange={(e) => set('invoiceId', e.target.value || undefined)}>
        <option value="">Brak</option>
        {invoices.map((i) => (
          <option key={i.id} value={i.id}>{i.number}</option>
        ))}
      </Select>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Numer protokołu" value={draft.number} placeholder="nadany automatycznie przy zapisie" onChange={(e) => set('number', e.target.value)} />
        <Input type="date" label="Data" value={draft.date} onChange={(e) => set('date', e.target.value)} />
      </div>
      <Input label="Klient" value={draft.client} onChange={(e) => set('client', e.target.value)} />
      <Input label="Lokalizacja" value={draft.location} onChange={(e) => set('location', e.target.value)} />
      <Textarea label="Zakres wykonanych prac" value={draft.scopeOfWork} onChange={(e) => set('scopeOfWork', e.target.value)} />
      <Input
        label="Wykonawcy (oddziel przecinkami)"
        value={draft.performedBy.join(', ')}
        onChange={(e) => set('performedBy', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
      />
      <Textarea label="Użyte materiały" value={draft.materialsUsed} onChange={(e) => set('materialsUsed', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Podpis — klient" value={draft.clientSignatureName} onChange={(e) => set('clientSignatureName', e.target.value)} />
        <Input label="Podpis — wykonawca" value={draft.contractorSignatureName} onChange={(e) => set('contractorSignatureName', e.target.value)} />
      </div>
      <Textarea label="Uwagi" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      <p className="text-xs text-ink-500">Zapisuje się automatycznie w trakcie pisania.</p>

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
          <Button variant="subtle" onClick={onClose}>Zamknij</Button>
          <Button variant="primary" onClick={save}>Zapisz protokół</Button>
        </div>
      </div>
    </div>
  )
}
