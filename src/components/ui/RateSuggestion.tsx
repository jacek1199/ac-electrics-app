import { matchServiceRates, type ServiceRate } from '../../lib/rates'
import { fmtPLN } from '../../lib/calc'
import { IconBulb } from '../layout/icons'
import { Button } from './Button'

export function RateSuggestion({
  text,
  onApply,
  applyLabel = 'Wstaw szacunkową kwotę',
}: {
  text: string
  onApply?: (mid: number, rate: ServiceRate) => void
  applyLabel?: string
}) {
  const matches = matchServiceRates(text).slice(0, 3)
  if (matches.length === 0) return null

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-gold-bright uppercase tracking-wide">
        <IconBulb className="w-3.5 h-3.5" /> Szacunkowa stawka rynkowa
      </div>
      {matches.map((r) => {
        const mid = Math.round((r.priceMin + r.priceMax) / 2)
        return (
          <div key={r.id} className="text-xs text-ink-200">
            <div className="font-semibold text-ink-100">{r.label}</div>
            <div className="text-gold-bright font-bold mt-0.5">
              {fmtPLN(r.priceMin)} – {fmtPLN(r.priceMax)} <span className="text-ink-500 font-normal">({r.unit})</span>
            </div>
            <div className="text-ink-500 mt-0.5">{r.note}</div>
            {onApply && (
              <Button variant="subtle" size="sm" className="mt-1.5" onClick={() => onApply(mid, r)}>
                {applyLabel} ({fmtPLN(mid)})
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
