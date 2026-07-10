import { useState } from 'react'
import { useStore, emptyInvoice } from '../lib/store'
import type { Invoice } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { InvoiceStatusBadge } from '../components/ui/Badge'
import { InvoiceForm } from '../components/invoices/InvoiceForm'
import { BotAssistant } from '../components/ui/BotAssistant'
import { fmtDate } from '../lib/calc'
import { IconPlus, IconInvoice } from '../components/layout/icons'

export function Invoices() {
  const invoices = useStore((s) => s.invoices)
  const [editing, setEditing] = useState<Invoice | null>(null)

  const sorted = [...invoices].sort((a, b) => b.issueDate.localeCompare(a.issueDate))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faktury"
        subtitle="Generator faktur A.C. Electrics — wypełnij dane i pobierz PDF"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyInvoice())}>
            Nowa faktura
          </Button>
        }
      />

      <BotAssistant
        name="Elektryk-Bot · Asystent faktur"
        message="Cześć! Wybierz zlecenie albo wpisz dane nabywcy i pozycje faktury, a ja policzę netto, VAT i brutto oraz przygotuję gotowy PDF do pobrania i wydruku."
      />

      {sorted.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconInvoice className="w-6 h-6" />} title="Brak wystawionych faktur" /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-navy-800">
            {sorted.map((inv) => {
              const gross = inv.items.reduce((a, it) => a + it.quantity * it.unitPriceNet * (1 + it.vatRate / 100), 0)
              return (
                <div key={inv.id} onClick={() => setEditing(inv)} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-navy-800/60 cursor-pointer transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-100">{inv.number || 'Bez numeru'}</div>
                    <div className="text-xs text-ink-500 truncate">{inv.buyer.name || 'Brak nabywcy'} · {fmtDate(inv.issueDate)}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <InvoiceStatusBadge status={inv.status} />
                    <span className="font-head font-bold text-ink-100 text-sm">{gross.toFixed(2)} PLN</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.number || 'Nowa faktura'} wide>
        {editing && <InvoiceForm invoice={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
