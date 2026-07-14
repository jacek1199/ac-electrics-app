import { useState } from 'react'
import { useStore, emptyNote } from '../lib/store'
import type { Note } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { NoteForm } from '../components/notes/NoteForm'
import { fmtDateTime } from '../lib/calc'
import { IconPlus, IconNote } from '../components/layout/icons'

export function Notes() {
  const notes = useStore((s) => s.notes)
  const [editing, setEditing] = useState<Note | null>(null)

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notatnik"
        subtitle="Szybkie notatki dla Adama i Jacka"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyNote())}>
            Nowa notatka
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconNote className="w-6 h-6" />} title="Brak notatek" hint="Dodaj pierwszą notatkę." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((n) => (
            <Card
              key={n.id}
              sweep
              className={`p-4 cursor-pointer hover:border-gold/40 ${n.pinned ? 'border-gold/40' : ''}`}
              onClick={() => setEditing(n)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-head font-semibold text-ink-100 truncate">{n.title || 'Bez tytułu'}</h3>
                {n.pinned && <span className="text-[10px] px-2 py-1 rounded-full bg-gold/15 text-gold-bright border border-gold/30 shrink-0">Przypięta</span>}
              </div>
              <p className="text-xs text-ink-400 whitespace-pre-wrap line-clamp-4 mb-3">{n.content || 'Brak treści'}</p>
              <div className="text-[11px] text-ink-500 pt-2 border-t border-navy-700">Zaktualizowano: {fmtDateTime(n.updatedAt)}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title || 'Notatka'}>
        {editing && <NoteForm note={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
