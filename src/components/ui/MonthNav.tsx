import { monthNames } from '../../lib/calc'

export function MonthNav({
  year,
  month,
  onChange,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}) {
  const prev = () => {
    if (month === 0) onChange(year - 1, 11)
    else onChange(year, month - 1)
  }
  const next = () => {
    if (month === 11) onChange(year + 1, 0)
    else onChange(year, month + 1)
  }
  return (
    <div className="inline-flex items-center gap-0.5 bg-navy-800 border border-navy-600 rounded-lg p-0.5 shrink-0 mr-1">
      <button onClick={prev} className="w-6 h-6 rounded-md flex items-center justify-center text-ink-300 hover:text-gold hover:bg-navy-700 shrink-0">‹</button>
      <span className="text-[11px] font-medium text-ink-100 w-[62px] shrink-0 whitespace-nowrap text-center">
        {monthNames[month].slice(0, 3)} {year}
      </span>
      <button onClick={next} className="w-6 h-6 rounded-md flex items-center justify-center text-ink-300 hover:text-gold hover:bg-navy-700 shrink-0">›</button>
    </div>
  )
}
