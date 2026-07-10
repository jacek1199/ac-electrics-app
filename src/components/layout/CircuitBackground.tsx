export function CircuitBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute -top-10 -right-16 w-64 opacity-[0.10] animate-flicker"
          viewBox="0 0 100 160"
          fill="none"
        >
          <path d="M60 0 L20 90 L45 90 L35 160 L85 65 L58 65 Z" fill="#f2b705" />
        </svg>
        <svg
          className="absolute bottom-[-10%] left-[-6%] w-80 opacity-[0.06] animate-flicker"
          style={{ animationDelay: '1.2s', transform: 'rotate(12deg)' }}
          viewBox="0 0 100 160"
          fill="none"
        >
          <path d="M60 0 L20 90 L45 90 L35 160 L85 65 L58 65 Z" fill="#2f93a8" />
        </svg>
      </div>
    </>
  )
}
