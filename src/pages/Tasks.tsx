import { useState } from 'react'
import { useStore, emptyTask } from '../lib/store'
import type { TaskItem, TaskAssignee } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { TaskForm } from '../components/tasks/TaskForm'
import { fmtDate } from '../lib/calc'
import { IconPlus, IconChecklist } from '../components/layout/icons'

function Column({ assignee, label, tasks, onEdit, onToggle }: {
  assignee: TaskAssignee
  label: string
  tasks: TaskItem[]
  onEdit: (t: TaskItem) => void
  onToggle: (t: TaskItem) => void
}) {
  const mine = tasks.filter((t) => t.assignee === assignee).sort((a, b) => Number(a.done) - Number(b.done) || a.deadline.localeCompare(b.deadline))
  return (
    <Card className="p-5">
      <CardHeader title={label} subtitle={`${mine.filter((t) => !t.done).length} aktywnych`} />
      {mine.length === 0 ? (
        <EmptyState icon={<IconChecklist className="w-6 h-6" />} title="Brak zadań" />
      ) : (
        <div className="space-y-2">
          {mine.map((t) => {
            const overdue = !t.done && new Date(t.deadline) < new Date(new Date().toDateString())
            return (
              <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border ${t.done ? 'bg-navy-950/40 border-navy-800 opacity-60' : 'bg-navy-950/60 border-navy-700'}`}>
                <button
                  onClick={() => onToggle(t)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${t.done ? 'bg-success border-success text-navy-950' : 'border-ink-500 text-transparent hover:border-gold'}`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(t)}>
                  <div className={`text-sm font-medium ${t.done ? 'line-through text-ink-500' : 'text-ink-100'}`}>{t.title || 'Zadanie'}</div>
                  {t.content && <div className="text-xs text-ink-500 truncate">{t.content}</div>}
                  <div className={`text-[11px] mt-1 ${overdue ? 'text-danger font-semibold' : 'text-ink-500'}`}>Termin: {fmtDate(t.deadline)}{overdue && ' — zaległe'}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export function Tasks() {
  const tasks = useStore((s) => s.tasks)
  const updateTask = useStore((s) => s.updateTask)
  const [editing, setEditing] = useState<TaskItem | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zadania"
        subtitle="Zadania dla Adama i Jacka z powiadomieniami o terminach"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyTask())}>
            Nowe zadanie
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Column assignee="adam" label="Adam — Szef / Właściciel" tasks={tasks} onEdit={setEditing} onToggle={(t) => updateTask({ ...t, done: !t.done })} />
        <Column assignee="jacek" label="Jacek — Partner Zarządzający / Wspólnik" tasks={tasks} onEdit={setEditing} onToggle={(t) => updateTask({ ...t, done: !t.done })} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title || 'Zadanie'}>
        {editing && <TaskForm task={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
