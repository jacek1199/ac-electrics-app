import type { OrderStatus, IncomeSource, InvoiceStatus } from '../../lib/types'

const statusStyles: Record<OrderStatus, string> = {
  nowe: 'bg-teal/15 text-teal-bright border-teal/30',
  w_trakcie: 'bg-gold/15 text-gold-bright border-gold/30',
  zakonczone: 'bg-success/15 text-success border-success/30',
  anulowane: 'bg-danger/15 text-danger border-danger/30',
}
const statusLabels: Record<OrderStatus, string> = {
  nowe: 'Nowe',
  w_trakcie: 'W trakcie',
  zakonczone: 'Zakończone',
  anulowane: 'Anulowane',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  )
}

const sourceLabels: Record<IncomeSource, string> = {
  klasyczne: 'Klasyczne zlecenie',
  odwrocone: 'Odwrócone zlecenie',
  inne: 'Inne',
}
const sourceStyles: Record<IncomeSource, string> = {
  klasyczne: 'bg-teal/15 text-teal-bright border-teal/30',
  odwrocone: 'bg-gold/15 text-gold-bright border-gold/30',
  inne: 'bg-ink-500/15 text-ink-300 border-ink-500/30',
}

export function SourceBadge({ source }: { source: IncomeSource }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${sourceStyles[source]}`}>
      {sourceLabels[source]}
    </span>
  )
}

const invoiceStyles: Record<InvoiceStatus, string> = {
  wystawiona: 'bg-teal/15 text-teal-bright border-teal/30',
  oplacona: 'bg-success/15 text-success border-success/30',
  anulowana: 'bg-danger/15 text-danger border-danger/30',
}
const invoiceLabels: Record<InvoiceStatus, string> = {
  wystawiona: 'Wystawiona',
  oplacona: 'Opłacona',
  anulowana: 'Anulowana',
}
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${invoiceStyles[status]}`}>
      {invoiceLabels[status]}
    </span>
  )
}
