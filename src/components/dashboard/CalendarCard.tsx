import { useMemo, useState } from 'react'
import { useStore } from '../../lib/store'
import { Card, CardHeader } from '../ui/Card'
import { MonthNav } from '../ui/MonthNav'
import { fmtDate } from '../../lib/calc'
import { Link } from 'react-router-dom'

const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CalendarCard() {
  const orders = useStore((s) => s.orders)
  const tasks = useStore((s) => s.tasks)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(dateKey(now))

  const eventsByDay = useMemo(() => {
    const map = new Map<string, { orders: typeof orders; tasks: typeof tasks }>()
    const ensure = (k: string) => {
      if (!map.has(k)) map.set(k, { orders: [], tasks: [] })
      return map.get(k)!
    }
    for (const o of orders) {
      if (!o.deadline) continue
      ensure(o.deadline.slice(0, 10)).orders.push(o)
    }
    for (const t of tasks) {
      if (!t.deadline) continue
      ensure(t.deadline.slice(0, 10)).tasks.push(t)
    }
    return map
  }, [orders, tasks])

  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const selectedEvents = selected ? eventsByDay.get(selected) : undefined
  const todayKey = dateKey(now)

  return (
    <Card className="p-5">
      <CardHeader title="Kalendarz" subtitle="Terminy zleceń i zadań" action={<MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />} />
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-ink-500 mb-1.5">
        {weekDays.map((w) => <div key={w}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const k = dateKey(d)
          const ev = eventsByDay.get(k)
          const isToday = k === todayKey
          const isSelected = k === selected
          return (
            <button
              key={i}
              onClick={() => setSelected(k)}
              className={`relative aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${
                isSelected ? 'bg-gold text-navy-950 font-bold' : isToday ? 'bg-navy-700 text-gold-bright font-semibold' : 'text-ink-300 hover:bg-navy-800'
              }`}
            >
              {d.getDate()}
              {ev && (ev.orders.length > 0 || ev.tasks.length > 0) && (
                <span className="absolute bottom-0.5 flex gap-0.5">
                  {ev.orders.length > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-navy-950' : 'bg-teal-bright'}`} />}
                  {ev.tasks.length > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-navy-950' : 'bg-gold'}`} />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-4 pt-4 border-t border-navy-700 space-y-2">
          <div className="text-xs font-semibold text-ink-300">{fmtDate(selected)}</div>
          {(!selectedEvents || (selectedEvents.orders.length === 0 && selectedEvents.tasks.length === 0)) ? (
            <p className="text-xs text-ink-500">Brak terminów tego dnia.</p>
          ) : (
            <>
              {selectedEvents.orders.map((o) => (
                <Link key={o.id} to="/zlecenia" className="flex items-center gap-2 text-xs text-ink-200 hover:text-gold-bright">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-bright shrink-0" /> {o.title || 'Zlecenie'}
                </Link>
              ))}
              {selectedEvents.tasks.map((t) => (
                <Link key={t.id} to="/zadania" className="flex items-center gap-2 text-xs text-ink-200 hover:text-gold-bright">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" /> {t.title || 'Zadanie'} <span className="text-ink-500">· {t.assignee === 'adam' ? 'Adam' : 'Jacek'}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </Card>
  )
}
