import { useRef, useState } from 'react'
import type { Statement } from '../../lib/types'
import { useStore } from '../../lib/store'
import { useAutosave } from '../../lib/useAutosave'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash, IconDownload } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'
import { generateStatementPdf } from '../../lib/pdf'

const canSave = (d: Statement) => d.clientName.trim().length > 0 || d.scopeDescription.trim().length > 0

export function StatementForm({ statement, onClose }: { statement: Statement; onClose: () => void }) {
  const [draft, setDraft] = useState<Statement>(statement)
  const [downloading, setDownloading] = useState(false)
  const orders = useStore((s) => s.orders)
  const company = useStore((s) => s.company)
  const addStatement = useStore((s) => s.addStatement)
  const updateStatement = useStore((s) => s.updateStatement)
  const removeStatement = useStore((s) => s.removeStatement)
  const nextStatementNumber = useStore((s) => s.nextStatementNumber)
  const isNew = !useStore.getState().statements.some((s) => s.id === statement.id)
  const wasNewRef = useRef(isNew)

  const set = <K extends keyof Statement>(key: K, value: Statement[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const fillFromOrder = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId)
    if (!o) return
    setDraft((d) => ({
      ...d,
      orderId: o.id,
      clientName: o.client.name,
      clientAddress: o.client.address,
      location: o.location?.address ?? '',
      scopeDescription: o.description,
    }))
  }

  const persist = (d: Statement) => {
    let num = d.number
    if (!num) num = nextStatementNumber()
    const final = { ...d, number: num }
    if (wasNewRef.current) {
      addStatement(final)
      wasNewRef.current = false
    } else {
      updateStatement(final)
    }
    if (num !== d.number) setDraft(final)
  }
  useAutosave(draft, canSave, persist)

  const save = () => {
    persist(draft)
    pushToast(isNew ? 'Oświadczenie utworzone' : 'Oświadczenie zaktualizowane')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć to oświadczenie?', 'Usuń oświadczenie')
    if (!ok) return
    removeStatement(draft.id)
    pushToast('Oświadczenie usunięte', 'info')
    onClose()
  }

  const download = async () => {
    setDownloading(true)
    try {
      let num = draft.number
      if (!num) {
        num = nextStatementNumber()
        setDraft((d) => ({ ...d, number: num }))
      }
      const doc = await generateStatementPdf({ ...draft, number: num }, company)
      doc.save(`Oswiadczenie-${num.replace(/\//g, '-')}.pdf`)
      pushToast('Oświadczenie PDF pobrane')
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Numer oświadczenia" value={draft.number} placeholder="nadany automatycznie przy zapisie" onChange={(e) => set('number', e.target.value)} />
        <Input type="date" label="Data" value={draft.date} onChange={(e) => set('date', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Zleceniodawca (klient)" value={draft.clientName} onChange={(e) => set('clientName', e.target.value)} />
        <Input label="Adres zleceniodawcy" value={draft.clientAddress} onChange={(e) => set('clientAddress', e.target.value)} />
      </div>
      <Input label="Lokalizacja prac" value={draft.location} onChange={(e) => set('location', e.target.value)} />
      <Textarea
        label="Zakres prac / ingerencji"
        value={draft.scopeDescription}
        onChange={(e) => set('scopeDescription', e.target.value)}
        hint="Krótki opis prac, których dotyczy oświadczenie — trafi do treści dokumentu."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Podpis — zleceniodawca" value={draft.clientSignatureName} onChange={(e) => set('clientSignatureName', e.target.value)} />
        <Input label="Podpis — zleceniobiorca" value={draft.contractorSignatureName} onChange={(e) => set('contractorSignatureName', e.target.value)} />
      </div>
      <Textarea label="Uwagi (opcjonalnie)" value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      <p className="text-xs text-ink-500">
        Oświadczenie zapisuje się automatycznie w trakcie pisania. To ogólny wzór — przed masowym użyciem z klientami warto dać go do przejrzenia prawnikowi.
      </p>

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
          <Button variant="primary" onClick={save}>Zapisz oświadczenie</Button>
        </div>
      </div>
    </div>
  )
}
