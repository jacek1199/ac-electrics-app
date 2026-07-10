import type { ReactNode } from 'react'

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-navy-800 border border-navy-600 flex items-center justify-center text-2xl mb-4 text-teal-bright">
        {icon ?? '⚡'}
      </div>
      <p className="text-ink-300 font-medium">{title}</p>
      {hint && <p className="text-ink-500 text-sm mt-1 max-w-xs">{hint}</p>}
    </div>
  )
}
