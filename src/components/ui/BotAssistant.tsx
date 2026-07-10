function BotAvatar() {
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0 animate-flicker" style={{ animationDuration: '7s' }}>
      <line x1="32" y1="4" x2="32" y2="14" stroke="#45b8cf" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 2 26 12h6l-3 8 9-11h-6l3-7Z" fill="#f2b705" />
      <rect x="12" y="14" width="40" height="34" rx="14" fill="#0f1e33" stroke="#2f93a8" strokeWidth="2.5" />
      <circle cx="24" cy="31" r="4.5" fill="#45b8cf" />
      <circle cx="40" cy="31" r="4.5" fill="#45b8cf" />
      <path d="M23 40q9 6 18 0" stroke="#f2b705" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="6" y="26" width="6" height="12" rx="3" fill="#142842" stroke="#2f93a8" strokeWidth="2" />
      <rect x="52" y="26" width="6" height="12" rx="3" fill="#142842" stroke="#2f93a8" strokeWidth="2" />
      <rect x="20" y="50" width="24" height="10" rx="5" fill="#142842" stroke="#2f93a8" strokeWidth="2" />
    </svg>
  )
}

export function BotAssistant({ name, message }: { name: string; message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-teal/20 bg-gradient-to-br from-navy-800 to-navy-900 p-4 sm:p-5">
      <BotAvatar />
      <div className="relative flex-1 min-w-0">
        <div className="absolute -left-2 top-3 w-3 h-3 bg-navy-950 border-l border-b border-teal/30 rotate-45" />
        <div className="rounded-xl rounded-tl-none border border-teal/30 bg-navy-950/80 px-4 py-3">
          <div className="text-xs font-bold text-gold-bright mb-1">{name}</div>
          <p className="text-sm text-ink-200 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  )
}
