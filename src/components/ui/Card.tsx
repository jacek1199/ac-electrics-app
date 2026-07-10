import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  sweep?: boolean
  glow?: boolean
}

export function Card({ children, sweep = false, glow = false, className = '', ...rest }: Props) {
  return (
    <div
      className={`relative rounded-2xl border border-teal/15 bg-gradient-to-br from-navy-800 to-navy-900 ${sweep ? 'sweep-card' : ''} ${glow ? 'glow-pulse' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="font-head text-base font-semibold text-ink-100">{title}</h3>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
