import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

const baseControl =
  'w-full bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none transition-colors focus:border-gold'

function Wrap({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-medium text-ink-300 mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block text-[11px] text-ink-500 mt-1">{hint}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}
export function Input({ label, hint, className = '', ...rest }: InputProps) {
  return (
    <Wrap label={label} hint={hint}>
      <input className={`${baseControl} ${className}`} {...rest} />
    </Wrap>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  children: ReactNode
}
export function Select({ label, hint, className = '', children, ...rest }: SelectProps) {
  return (
    <Wrap label={label} hint={hint}>
      <select className={`${baseControl} ${className}`} {...rest}>
        {children}
      </select>
    </Wrap>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}
export function Textarea({ label, hint, className = '', ...rest }: TextareaProps) {
  return (
    <Wrap label={label} hint={hint}>
      <textarea className={`${baseControl} resize-y min-h-20 ${className}`} {...rest} />
    </Wrap>
  )
}
