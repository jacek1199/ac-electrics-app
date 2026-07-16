import { useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useStore } from '../lib/store'
import { Card, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import {
  summarizePeriod, isInMonth, isInYear, monthKey, monthNames, fmtPLN, fmtDate,
} from '../lib/calc'
import { IconBolt, IconChecklist, IconClock } from '../components/layout/icons'
import { Link } from 'react-router-dom'
import { CalendarCard } from '../components/dashboard/CalendarCard'

const GOAL_KEY = 'ac-electrics-monthly-goal'

function usePersistentGoal(): [number, (n: number) => void] {
  const [goal, setGoalState] = useState<number>(() => {
    const raw = localStorage.getItem(GOAL_KEY)
    return raw ? Number(raw) : 15000
  })
  const setGoal = (n: number) => {
    setGoalState(n)
    localStorage.setItem(GOAL_KEY, String(n))
  }
  return [goal, setGoal]
}

function PowerGauge({ value, goal }: { value: number; goal: number }) {
  const pct = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0))
  const r = 72
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)
  const reached = pct >= 1
  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
          <circle cx="90" cy="90" r={r} fill="none" stroke="#142842" strokeWidth="14" />
          <circle
            cx="90" cy="90" r={r} fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,1.4,.4,1)' }}
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#45b8cf" />
              <stop offset="100%" stopColor="#f2b705" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <IconBolt className={`w-8 h-8 mb-1 ${reached ? 'text-gold-bright animate-flicker' : 'text-teal-bright'}`} />
          <div className="font-head text-xl font-bold text-ink-100">{Math.round(pct * 100)}%</div>
          <div className="text-[11px] text-ink-500">celu miesiąca</div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm text-ink-300">{fmtPLN(value)} <span className="text-ink-500">/ cel {fmtPLN(goal)}</span></div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const orders = useStore((s) => s.orders)
  const transactions = useStore((s) => s.transactions)
  const employees = useStore((s) => s.employees)
  const tasks = useStore((s) => s.tasks)
  const [goal, setGoal] = usePersistentGoal()
  const [editingGoal, setEditingGoal] = useState(false)

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const mKey = monthKey(now)

  const monthSummary = useMemo(
    () => summarizePeriod(orders, transactions, employees, (d) => isInMonth(d, y, m), mKey),
    [orders, transactions, employees, y, m, mKey],
  )
  const yearSummary = useMemo(
    () => summarizePeriod(orders, transactions, employees, (d) => isInYear(d, y)),
    [orders, transactions, employees, y],
  )

  const last12 = useMemo(() => {
    const arr: { label: string; przychody: number; wydatki: number; zysk: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(y, m - i, 1)
      const s = summarizePeriod(orders, transactions, employees, (ds) => isInMonth(ds, d.getFullYear(), d.getMonth()))
      arr.push({
        label: `${monthNames[d.getMonth()].slice(0, 3)} '${String(d.getFullYear()).slice(2)}`,
        przychody: Math.round(s.income),
        wydatki: Math.round(s.expenses + s.jacekTotal),
        zysk: Math.round(s.profit),
      })
    }
    return arr
  }, [orders, transactions, employees, y, m])

  const pieData = [
    { name: 'Klasyczne', value: Math.max(0, monthSummary.profitBySource.klasyczne), color: '#2f93a8' },
    { name: 'Odwrócone', value: Math.max(0, monthSummary.profitBySource.odwrocone), color: '#f2b705' },
    { name: 'Inne', value: Math.max(0, monthSummary.profitBySource.inne), color: '#7e91a6' },
  ]
  const pieTotal = pieData.reduce((a, b) => a + b.value, 0)

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const upcoming = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => `${a.deadline}T${a.time || '00:00'}`.localeCompare(`${b.deadline}T${b.time || '00:00'}`))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cześć!"
        subtitle="Podsumowanie działalności A.C. Electrics w czasie rzeczywistym"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Przychody (miesiąc)" value={fmtPLN(monthSummary.income)} accent="teal" />
        <StatCard label="Wydatki (miesiąc)" value={fmtPLN(monthSummary.expenses)} accent="danger" />
        <StatCard label="Jacek (15%)" value={fmtPLN(monthSummary.jacekTotal)} accent="gold" />
        <StatCard label="Zysk netto (miesiąc)" value={fmtPLN(monthSummary.profit)} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-1" glow>
          <CardHeader
            title="Cel miesięczny"
            subtitle="Zysk netto vs Twój cel"
            action={
              <button
                className="text-xs text-teal-bright hover:text-gold"
                onClick={() => setEditingGoal((v) => !v)}
              >
                {editingGoal ? 'Zapisz' : 'Edytuj cel'}
              </button>
            }
          />
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-full bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 outline-none focus:border-gold"
              />
              <span className="text-ink-500 text-sm">PLN</span>
            </div>
          ) : (
            <PowerGauge value={monthSummary.profit} goal={goal} />
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Przychody i wydatki — ostatnie 12 miesięcy" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last12} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#45b8cf" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#45b8cf" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e15252" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#e15252" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#142842" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#7e91a6', fontSize: 11 }} axisLine={{ stroke: '#142842' }} tickLine={false} />
                <YAxis tick={{ fill: '#7e91a6', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#0f1e33', border: '1px solid #2f93a8', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#eef4f8' }}
                  formatter={(v) => fmtPLN(Number(v))}
                />
                <Area type="monotone" dataKey="przychody" stroke="#45b8cf" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="wydatki" stroke="#e15252" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        <CalendarCard />
        <Card className="p-5">
          <CardHeader title="Zysk wg źródła" subtitle="Bieżący miesiąc" />
          {pieTotal <= 0 ? (
            <EmptyState icon="🥧" title="Brak zysku do pokazania" hint="Dodaj zlecenia, aby zobaczyć podział." />
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f1e33', border: '1px solid #2f93a8', borderRadius: 10, fontSize: 12 }}
                      formatter={(v) => fmtPLN(Number(v))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-ink-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                    {p.name}: {fmtPLN(p.value)}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="p-5">
          <CardHeader title="Ostatnie zlecenia" action={<Link to="/zlecenia" className="text-xs text-teal-bright hover:text-gold">Wszystkie →</Link>} />
          {recentOrders.length === 0 ? (
            <EmptyState icon={<IconBolt className="w-6 h-6" />} title="Brak zleceń" hint="Dodaj pierwsze zlecenie w module Zlecenia." />
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-100 truncate">{o.title || 'Bez tytułu'}</div>
                    <div className="text-xs text-ink-500 truncate">{o.client.name || '—'}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <CardHeader title="Nadchodzące zadania" action={<Link to="/zadania" className="text-xs text-teal-bright hover:text-gold">Wszystkie →</Link>} />
          {upcoming.length === 0 ? (
            <EmptyState icon={<IconChecklist className="w-6 h-6" />} title="Brak zaległych zadań" hint="Wszystko ogarnięte!" />
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-navy-950/60 border border-navy-700">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-100 truncate">{t.title || 'Zadanie'}</div>
                    <div className="text-xs text-ink-500 capitalize">{t.assignee === 'adam' ? 'Adam' : 'Jacek'}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gold shrink-0">
                    <IconClock className="w-3.5 h-3.5" /> {fmtDate(t.deadline)}{t.time && ` ${t.time}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader title={`Podsumowanie roku ${y}`} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Stat label="Przychody" value={fmtPLN(yearSummary.income)} />
          <Stat label="Wydatki" value={fmtPLN(yearSummary.expenses)} />
          <Stat label="Zysk netto" value={fmtPLN(yearSummary.profit)} />
          <Stat label="Zleceń" value={String(yearSummary.orderCount)} />
          <Stat label="Jacek — łącznie" value={fmtPLN(yearSummary.jacekTotal)} />
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: 'teal' | 'danger' | 'gold' | 'success' }) {
  const colors: Record<string, string> = {
    teal: 'text-teal-bright',
    danger: 'text-danger',
    gold: 'text-gold-bright',
    success: 'text-success',
  }
  return (
    <Card className="p-4 sm:p-5" sweep>
      <div className="text-xs text-ink-500 mb-1.5">{label}</div>
      <div className={`font-head text-lg sm:text-xl font-bold ${colors[accent]}`}>{value}</div>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div className="font-head text-base font-bold text-ink-100">{value}</div>
    </div>
  )
}
