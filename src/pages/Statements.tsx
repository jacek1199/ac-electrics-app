import { useState } from 'react'
import { useStore, emptyStatement } from '../lib/store'
import type { Statement } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { StatementForm } from '../components/statements/StatementForm'
import { BotAssistant } from '../components/ui/BotAssistant'
import { fmtDate } from '../lib/calc'
import { IconPlus, IconProtocol } from '../components/layout/icons'

export function Statements() {
  const statements = useStore((s) => s.statements)
  const [editing, setEditing] = useState<Statement | null>(null)

  const sorted = [...statements].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oświadczenia"
        subtitle="Oświadczenia o odpowiedzialności za szkody powstałe w trakcie prac elektrycznych"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyStatement())}>
            Nowe oświadczenie
          </Button>
        }
      />

      <BotAssistant
        name="Elektryk-Bot · Asystent oświadczeń"
        message="Cześć! Podaj dane klienta i krótki opis zakresu prac, a ja przygotuję gotowe oświadczenie o odpowiedzialności za szkody, z podstawą prawną i miejscem na podpisy — gotowe do wydruku. To ogólny wzór, więc przed szerokim użyciem warto dać go do przejrzenia prawnikowi."
      />

      {sorted.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconProtocol className="w-6 h-6" />} title="Brak oświadczeń" /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-navy-800">
            {sorted.map((s) => (
              <div key={s.id} onClick={() => setEditing(s)} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-navy-800/60 cursor-pointer transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink-100">{s.number || 'Bez numeru'}</div>
                  <div className="text-xs text-ink-500 truncate">{s.clientName || 'Brak klienta'} · {fmtDate(s.date)}</div>
                </div>
                <div className="text-xs text-ink-500 truncate max-w-[40%] shrink text-right">{s.location}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.number || 'Nowe oświadczenie'} wide>
        {editing && <StatementForm statement={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
