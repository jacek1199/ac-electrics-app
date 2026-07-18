import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MonthNav } from '../components/ui/MonthNav'
import { StatusBadge, SourceBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { summarizePeriod, isInMonth, isInYear, monthKey, monthNames, computeOrderProfit, fmtPLN, fmtDate, sortOrdersLikeOrdersPage } from '../lib/calc'
import { generateReportPdf } from '../lib/pdf'
import { IconDownload, IconReport } from '../components/layout/icons'
import { pushToast } from '../components/ui/toastBus'

export function Reports() {
  const orders = useStore((s) => s.orders)
  const transactions = useStore((s) => s.transactions)
  const employees = useStore((s) => s.employees)
  const company = useStore((s) => s.company)

  const [mode, setMode] = useState<'miesiac' | 'rok'>('miesiac')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [generating, setGenerating] = useState(false)

  const predicate = mode === 'miesiac' ? (d: string) => isInMonth(d, year, month) : (d: string) => isInYear(d, year)
  const mKey = monthKey(new Date(year, month, 1))
  const periodLabel = mode === 'miesiac' ? `${monthNames[month]} ${year}` : `Rok ${year}`

  const periodOrders = useMemo(
    () => sortOrdersLikeOrdersPage(orders.filter((o) => predicate(o.completedAt || o.deadline || o.createdAt))),
    [orders, year, month, mode],
  )

  const summary = useMemo(
    () => summarizePeriod(orders, transactions, employees, predicate, mKey),
    [orders, transactions, employees, year, month, mode],
  )

  const downloadPdf = async () => {
    setGenerating(true)
    try {
      const doc = await generateReportPdf(periodOrders, summary, company, periodLabel)
      doc.save(`Raport-AC-Electrics-${periodLabel.replace(/\s+/g, '_')}.pdf`)
      pushToast('Raport PDF pobrany')
    } catch {
      pushToast('Nie udało się wygenerować PDF', 'danger')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporty"
        subtitle="Profesjonalny raport działalności — do podglądu i wydruku"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-navy-800 border border-navy-600 rounded-lg p-1">
              <button onClick={() => setMode('miesiac')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'miesiac' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Miesiąc</button>
              <button onClick={() => setMode('rok')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'rok' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Rok</button>
            </div>
            {mode === 'miesiac' && <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />}
            <Button variant="primary" icon={<IconDownload className="w-4 h-4" />} onClick={downloadPdf} disabled={generating}>
              {generating ? 'Generuję…' : 'Pobierz PDF'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat label="Przychody" value={fmtPLN(summary.income)} />
        <Stat label="Wydatki" value={fmtPLN(summary.expenses)} />
        <Stat label="Jacek" value={fmtPLN(summary.jacekTotal)} />
        <Stat label="Zysk netto" value={fmtPLN(summary.profit)} />
        <Stat label="Liczba zleceń" value={String(summary.orderCount)} />
        <Stat label="Godziny pracy" value={`${summary.hoursWorked} h`} />
      </div>

      <Card className="p-5">
        <CardHeader title={`Zlecenia — ${periodLabel}`} subtitle={`${periodOrders.length} pozycji`} />
        {periodOrders.length === 0 ? (
          <EmptyState icon={<IconReport className="w-6 h-6" />} title="Brak zleceń w tym okresie" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-ink-500 uppercase tracking-wide border-b border-navy-700">
                  <th className="py-2 pr-3 font-medium">Zlecenie</th>
                  <th className="py-2 pr-3 font-medium">Termin</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Kategoria</th>
                  <th className="py-2 pr-3 font-medium text-right">Przychód</th>
                  <th className="py-2 pr-3 font-medium text-right">Koszty</th>
                  <th className="py-2 pr-3 font-medium text-right">Zysk netto</th>
                </tr>
              </thead>
              <tbody>
                {periodOrders.map((o) => {
                  const p = computeOrderProfit(o)
                  return (
                    <tr key={o.id} className="border-b border-navy-800/60">
                      <td className="py-2.5 pr-3 text-ink-100">{o.title || '—'}</td>
                      <td className="py-2.5 pr-3 text-ink-400">{fmtDate(o.deadline)}</td>
                      <td className="py-2.5 pr-3"><StatusBadge status={o.status} /></td>
                      <td className="py-2.5 pr-3"><SourceBadge source={o.incomeSource} /></td>
                      <td className="py-2.5 pr-3 text-right text-ink-100">{fmtPLN(p.price)}</td>
                      <td className="py-2.5 pr-3 text-right text-ink-400">{fmtPLN(p.totalCosts)}</td>
                      <td className={`py-2.5 pr-3 text-right font-semibold ${p.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>{fmtPLN(p.netProfit)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-ink-500 mb-1.5">{label}</div>
      <div className="font-head text-lg font-bold text-ink-100">{value}</div>
    </Card>
  )
}
