import { useState } from 'react'
import { useStore, emptyProtocol } from '../lib/store'
import type { Protocol } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { ProtocolForm } from '../components/protocols/ProtocolForm'
import { BotAssistant } from '../components/ui/BotAssistant'
import { fmtDate } from '../lib/calc'
import { IconPlus, IconProtocol } from '../components/layout/icons'

export function Protocols() {
  const protocols = useStore((s) => s.protocols)
  const [editing, setEditing] = useState<Protocol | null>(null)

  const sorted = [...protocols].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Protokoły"
        subtitle="Protokoły zdawczo-odbiorcze powiązane ze zleceniami i fakturami"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyProtocol())}>
            Nowy protokół
          </Button>
        }
      />

      <BotAssistant
        name="Elektryk-Bot · Asystent protokołów"
        message="Cześć! Podaj mi dane zlecenia, zakres wykonanych prac i kto to robił — a ja złożę gotowy protokół zdawczo-odbiorczy z miejscem na podpisy, gotowy do druku."
      />

      {sorted.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconProtocol className="w-6 h-6" />} title="Brak protokołów" /></Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-navy-800">
            {sorted.map((p) => (
              <div key={p.id} onClick={() => setEditing(p)} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-navy-800/60 cursor-pointer transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink-100">{p.number || 'Bez numeru'}</div>
                  <div className="text-xs text-ink-500 truncate">{p.client || 'Brak klienta'} · {fmtDate(p.date)}</div>
                </div>
                <div className="text-xs text-ink-500 truncate max-w-[40%] shrink text-right">{p.location}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.number || 'Nowy protokół'} wide>
        {editing && <ProtocolForm protocol={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
