import { Component, type ErrorInfo, type ReactNode } from 'react'
import { repairApp } from '../../lib/repair'
import { IconBolt, IconWrench } from './icons'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('A.C. Electrics — nieobsłużony błąd:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-navy-950 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-danger/30 bg-navy-900 p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger mb-4">
            <IconBolt className="w-7 h-7" />
          </div>
          <h1 className="font-head text-lg font-bold text-ink-100 mb-1.5">Coś poszło nie tak</h1>
          <p className="text-sm text-ink-500 mb-5">
            Panel napotkał nieoczekiwany błąd. Twoje dane w bazie są bezpieczne — spróbuj naprawić wyświetlanie.
          </p>
          <button
            onClick={repairApp}
            className="w-full inline-flex items-center justify-center gap-2 font-semibold bg-gradient-to-br from-gold-bright to-gold text-navy-950 px-4 py-2.5 rounded-xl hover:-translate-y-0.5 transition-transform"
          >
            <IconWrench className="w-4 h-4" /> Napraw wyświetlanie
          </button>
        </div>
      </div>
    )
  }
}
