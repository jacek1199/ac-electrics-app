import { useMemo, useState } from 'react'
import { useStore, emptyTransaction } from '../lib/store'
import type { Transaction } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { MonthNav } from '../components/ui/MonthNav'
import { TransactionForm } from '../components/finance/TransactionForm'
import { summarizePeriod, isInMonth, isInYear, monthKey, fmtPLN, fmtDate } from '../lib/calc'
import { IconPlus, IconWallet, IconTrash } from '../components/layout/icons'
import { confirmAction } from '../components/ui/confirmBus'
import { pushToast } from '../components/ui/toastBus'

export function Finance() {
  const orders = useStore((s) => s.orders)
  const transactions = useStore((s) => s.transactions)
  const employees = useStore((s) => s.employees)
  const removeTransaction = useStore((s) => s.removeTransaction)

  const [mode, setMode] = useState<'miesiac' | 'rok'>('miesiac')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [editing, setEditing] = useState<Transaction | null>(null)

  const predicate = mode === 'miesiac' ? (d: string) => isInMonth(d, year, month) : (d: string) => isInYear(d, year)
  const mKey = monthKey(new Date(year, month, 1))

  const summary = useMemo(
    () => summarizePeriod(orders, transactions, employees, predicate, mKey),
    [orders, transactions, employees, year, month, mode],
  )

  const incomeTx = transactions.filter((t) => t.type === 'income' && predicate(t.date)).sort((a, b) => b.date.localeCompare(a.date))
  const expenseTx = transactions.filter((t) => t.type === 'expense' && predicate(t.date)).sort((a, b) => b.date.localeCompare(a.date))

  const orderIncome = orders.filter((o) => predicate(o.completedAt || o.deadline || o.createdAt))

  const del = async (id: string) => {
    const ok = await confirmAction('Usunąć tę pozycję?', 'Usuń wpis')
    if (!ok) return
    removeTransaction(id)
    pushToast('Usunięto', 'info')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanse"
        subtitle="Budżet, przychody, wydatki i zysk firmy"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-navy-800 border border-navy-600 rounded-lg p-1">
              <button onClick={() => setMode('miesiac')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'miesiac' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Miesiąc</button>
              <button onClick={() => setMode('rok')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${mode === 'rok' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Rok</button>
            </div>
            {mode === 'miesiac' && (
              <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Przychody" value={fmtPLN(summary.income)} accent="teal" />
        <SummaryCard label="Wydatki" value={fmtPLN(summary.expenses)} accent="danger" />
        <SummaryCard label="Jacek" value={fmtPLN(summary.jacekTotal)} accent="gold" />
        <SummaryCard label="Zysk netto" value={fmtPLN(summary.profit)} accent="success" />
      </div>

      <Card className="p-5">
        <CardHeader title="Zysk rozbity na źródła" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SourceStat label="Klasyczne zlecenia" value={summary.profitBySource.klasyczne} className="text-teal-bright" />
          <SourceStat label="Odwrócone zlecenia" value={summary.profitBySource.odwrocone} className="text-gold-bright" />
          <SourceStat label="Inne" value={summary.profitBySource.inne} className="text-ink-300" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <CardHeader
            title="Przychody"
            subtitle="Ze zleceń (automatycznie) + wpisy ręczne"
            action={
              <Button size="sm" variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyTransaction('income'))}>
                Dodaj
              </Button>
            }
          />
          {orderIncome.length === 0 && incomeTx.length === 0 ? (
            <EmptyState icon={<IconWallet className="w-6 h-6" />} title="Brak przychodów w tym okresie" />
          ) : (
            <div className="space-y-2">
              {orderIncome.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700">
                  <div className="min-w-0">
                    <div className="text-sm text-ink-100 truncate">{o.title || 'Zlecenie'}</div>
                    <div className="text-[11px] text-ink-500 capitalize">Zlecenie · {o.incomeSource}</div>
                  </div>
                  <div className="text-sm font-semibold text-teal-bright shrink-0">{fmtPLN(o.price)}</div>
                </div>
              ))}
              {incomeTx.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700 group cursor-pointer" onClick={() => setEditing(t)}>
                  <div className="min-w-0">
                    <div className="text-sm text-ink-100 truncate">{t.label}</div>
                    <div className="text-[11px] text-ink-500">{fmtDate(t.date)} · {t.incomeSource}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-teal-bright">{fmtPLN(t.amount)}</span>
                    <button onClick={(e) => { e.stopPropagation(); del(t.id) }} className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-danger">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <CardHeader
            title="Wydatki"
            subtitle="Stałe i jednorazowe koszty firmy"
            action={
              <Button size="sm" variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyTransaction('expense'))}>
                Dodaj
              </Button>
            }
          />
          {expenseTx.length === 0 ? (
            <EmptyState icon={<IconWallet className="w-6 h-6" />} title="Brak wydatków w tym okresie" />
          ) : (
            <div className="space-y-2">
              {expenseTx.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700 group cursor-pointer" onClick={() => setEditing(t)}>
                  <div className="min-w-0">
                    <div className="text-sm text-ink-100 truncate">{t.label}</div>
                    <div className="text-[11px] text-ink-500">{fmtDate(t.date)} · {t.expenseKind === 'stale' ? 'Stały' : 'Jednorazowy'}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-danger">{fmtPLN(t.amount)}</span>
                    <button onClick={(e) => { e.stopPropagation(); del(t.id) }} className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-danger">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.type === 'income' ? 'Przychód' : 'Wydatek'}>
        {editing && <TransactionForm tx={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: 'teal' | 'danger' | 'gold' | 'success' }) {
  const colors: Record<string, string> = { teal: 'text-teal-bright', danger: 'text-danger', gold: 'text-gold-bright', success: 'text-success' }
  return (
    <Card className="p-4 sm:p-5" sweep>
      <div className="text-xs text-ink-500 mb-1.5">{label}</div>
      <div className={`font-head text-lg sm:text-xl font-bold ${colors[accent]}`}>{value}</div>
    </Card>
  )
}

function SourceStat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-xl border border-navy-600 bg-navy-950/60 p-4">
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div className={`font-head text-lg font-bold ${className}`}>{fmtPLN(value)}</div>
    </div>
  )
}
