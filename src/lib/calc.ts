import type { Order, OrderStatus, Transaction, Employee, IncomeSource } from './types'

// W trakcie wypływają na górę jako najpilniejsze, potem nowe, a zakończone
// i anulowane spływają na dół jako już nieaktywne. Używane wszędzie tam,
// gdzie lista zleceń ma wyglądać tak samo jak w module Zlecenia.
export const orderStatusPriority: Record<OrderStatus, number> = {
  w_trakcie: 0,
  nowe: 1,
  zakonczone: 2,
  anulowane: 3,
}

export function sortOrdersLikeOrdersPage(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) =>
      orderStatusPriority[a.status] - orderStatusPriority[b.status] ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export interface OrderProfit {
  grossPrice: number
  discount: number
  price: number
  materials: number
  labor: number
  fuel: number
  tax: number
  other: number
  totalCosts: number
  jacekCut: number
  netProfit: number
}

export function computeOrderProfit(o: Order): OrderProfit {
  const grossPrice = o.price || 0
  const discount = (grossPrice * (o.discountPercent || 0)) / 100
  const price = grossPrice - discount
  const materials = o.costs.materials || 0
  const labor = o.costs.labor || 0
  const fuel = o.costs.fuel || 0
  const tax = (price * (o.costs.taxPercent || 0)) / 100
  const other = o.costs.other || 0
  const totalCosts = materials + labor + fuel + tax + other
  const profitBeforeShare = price - totalCosts
  // Jacek's cut comes out of the order's profit, not its full revenue.
  const jacekCut = (profitBeforeShare * (o.jacekPercent || 0)) / 100
  const netProfit = profitBeforeShare - jacekCut
  return { grossPrice, discount, price, materials, labor, fuel, tax, other, totalCosts, jacekCut, netProfit }
}

export function monthKey(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

export function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() === month
}

export function isInYear(dateStr: string, year: number): boolean {
  return new Date(dateStr).getFullYear() === year
}

export interface PeriodSummary {
  income: number
  incomeBySource: Record<IncomeSource, number>
  expenses: number
  orderCosts: number
  manualExpenses: number
  profit: number
  profitBySource: Record<IncomeSource, number>
  jacekTotal: number
  orderCount: number
  hoursWorked: number
}

const emptySourceMap = (): Record<IncomeSource, number> => ({ klasyczne: 0, odwrocone: 0, inne: 0 })

export function summarizePeriod(
  orders: Order[],
  transactions: Transaction[],
  employees: Employee[],
  predicate: (dateStr: string) => boolean,
  monthKeyFilter?: string,
): PeriodSummary {
  const incomeBySource = emptySourceMap()
  const profitBySource = emptySourceMap()
  let income = 0
  let orderCosts = 0
  let jacekTotal = 0
  let orderCount = 0

  for (const o of orders) {
    // Only completed orders count towards income/profit — a quote or an
    // in-progress job isn't confirmed revenue yet.
    if (o.status !== 'zakonczone') continue
    const relevantDate = o.completedAt || o.deadline || o.createdAt
    if (!predicate(relevantDate)) continue
    const p = computeOrderProfit(o)
    income += p.price
    incomeBySource[o.incomeSource] += p.price
    orderCosts += p.totalCosts
    jacekTotal += p.jacekCut
    profitBySource[o.incomeSource] += p.netProfit
    orderCount += 1
  }

  let manualExpenses = 0
  for (const t of transactions) {
    if (!predicate(t.date)) continue
    if (t.type === 'expense') manualExpenses += t.amount
    if (t.type === 'income') {
      const src = t.incomeSource || 'inne'
      incomeBySource[src] += t.amount
      profitBySource[src] += t.amount
      income += t.amount
    }
  }

  let hoursWorked = 0
  if (monthKeyFilter) {
    for (const e of employees) {
      hoursWorked += e.monthlyHours[monthKeyFilter] || 0
    }
  }

  const expenses = orderCosts + manualExpenses
  const profit = income - expenses - jacekTotal
  return {
    income,
    incomeBySource,
    expenses,
    orderCosts,
    manualExpenses,
    profit,
    profitBySource,
    jacekTotal,
    orderCount,
    hoursWorked,
  }
}

export function fmtPLN(n: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n || 0)
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dt)
}

export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '—'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return '—'
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt)
}

export const monthNames = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
]

export function employeePayroll(e: Employee, mKey: string): number {
  return (e.monthlyHours[mKey] || 0) * e.hourlyRate
}
