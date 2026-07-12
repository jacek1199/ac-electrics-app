import { IconSort } from '../layout/icons'

export interface SortOption {
  value: string
  label: string
}

export function SortSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: SortOption[]
}) {
  return (
    <div className="relative">
      <IconSort className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-navy-800 border border-navy-600 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-100 outline-none focus:border-gold appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
