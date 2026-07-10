import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-gold-bright to-gold text-navy-950 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(242,183,5,0.28)]',
  ghost:
    'bg-transparent border border-teal-bright/40 text-teal-bright hover:bg-teal-bright/10 hover:border-teal-bright',
  subtle:
    'bg-navy-800 border border-navy-600 text-ink-100 hover:border-teal-bright/50 hover:bg-navy-700',
  danger:
    'bg-transparent border border-danger/50 text-danger hover:bg-danger/10 hover:border-danger',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
}

export function Button({
  variant = 'subtle',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
