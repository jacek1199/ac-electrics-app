import { useState } from 'react'
import { useStore, emptyTask } from '../lib/store'
import type { TaskItem, TaskAssignee } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { SortSelect } from '../components/ui/SortSelect'
import { DragList } from '../components/ui/DragList'
import { PriorityBadge, priorityOrder } from '../components/ui/Badge'
import { TaskForm } from '../components/tasks/TaskForm'
import { fmtDate } from '../lib/calc'
import { IconPlus, IconChecklist } from '../components/layout/icons'

type SortMode = 'inteligentne' | 'custom' | 'priorytet' | 'termin' | 'az'

const sortOptions = [
  { value: 'inteligentne', label: 'Automatycznie (termin, priorytet)' },
  { value: 'custom', label: 'Kolejność własna' },
  { value: 'priorytet', label: 'Priorytet' },
  { value: 'termin', label: 'Termin' },
  { value: 'az', label: 'Nazwa A-Z' },
]

function sortTasks(tasks: TaskItem[], mode: SortMode): TaskItem[] {
  const arr = [...tasks]
  arr.sort((a, b) => {
    const doneDiff = Number(a.done) - Number(b.done)
    if (doneDiff !== 0) return doneDiff
    switch (mode) {
      case 'priorytet':
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.deadline.localeCompare(b.deadline)
      case 'termin':
        return a.deadline.localeCompare(b.deadline)
      case 'az':
        return a.title.localeCompare(b.title, 'pl')
      case 'custom':
        return a.sortOrder - b.sortOrder
      default:
        return a.deadline.localeCompare(b.deadline) || priorityOrder[a.priority] - priorityOrder[b.priority]
    }
  })
  return arr
}

function Column({ assignee, label, tasks, sortMode, onEdit, onToggle, onReorder }: {
  assignee: TaskAssignee
  label: string
  tasks: TaskItem[]
  sortMode: SortMode
  onEdit: (t: TaskItem) => void
  onToggle: (t: TaskItem) => void
  onReorder: (items: TaskItem[]) => void
}) {
  const mine = sortTasks(tasks.filter((t) => t.assignee === assignee), sortMode)
  return (
    <Card className="p-5">
      <CardHeader title={label} subtitle={`${mine.filter((t) => !t.done).length} aktywnych`} />
      {mine.length === 0 ? (
        <EmptyState icon={<IconChecklist className="w-6 h-6" />} title="Brak zadań" />
      ) : (
        <div className="space-y-2">
          <DragList
            items={mine}
            onReorder={onReorder}
            disabled={sortMode !== 'custom'}
            renderItem={(t, dragHandle) => {
              const overdue = !t.done && new Date(t.deadline) < new Date(new Date().toDateString())
              return (
                <div className={`flex items-start gap-2 p-3 rounded-xl border ${t.done ? 'bg-navy-950/40 border-navy-800 opacity-60' : 'bg-navy-950/60 border-navy-700'}`}>
                  {dragHandle}
                  <button
                    onClick={() => onToggle(t)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${t.done ? 'bg-success border-success text-navy-950' : 'border-ink-500 text-transparent hover:border-gold'}`}
                  >
                    ✓
                  </button>
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(t)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`text-sm font-medium ${t.done ? 'line-through text-ink-500' : 'text-ink-100'}`}>{t.title || 'Zadanie'}</div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    {t.content && <div className="text-xs text-ink-500 truncate mt-0.5">{t.content}</div>}
                    <div className={`text-[11px] mt-1 ${overdue ? 'text-danger font-semibold' : 'text-ink-500'}`}>Termin: {fmtDate(t.deadline)}{t.time && ` ${t.time}`}{overdue && ' — zaległe'}</div>
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}
    </Card>
  )
}

export function Tasks() {
  const tasks = useStore((s) => s.tasks)
  const updateTask = useStore((s) => s.updateTask)
  const reorderTasks = useStore((s) => s.reorderTasks)
  const [editing, setEditing] = useState<TaskItem | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('inteligentne')

  const handleReorder = (assignee: TaskAssignee) => (newOrder: TaskItem[]) => {
    const updated = newOrder.map((t, idx) => ({ ...t, sortOrder: idx }))
    const updatedIds = new Set(updated.map((t) => t.id))
    const rest = tasks.filter((t) => t.assignee !== assignee || !updatedIds.has(t.id))
    reorderTasks([...updated, ...rest])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zadania"
        subtitle="Zadania dla Adama i Jacka z powiadomieniami o terminach"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <SortSelect value={sortMode} onChange={(v) => setSortMode(v as SortMode)} options={sortOptions} />
            <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyTask())}>
              Nowe zadanie
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Column
          assignee="adam"
          label="Adam — Szef / Właściciel"
          tasks={tasks}
          sortMode={sortMode}
          onEdit={setEditing}
          onToggle={(t) => updateTask({ ...t, done: !t.done })}
          onReorder={handleReorder('adam')}
        />
        <Column
          assignee="jacek"
          label="Jacek — Partner Zarządzający / Wspólnik"
          tasks={tasks}
          sortMode={sortMode}
          onEdit={setEditing}
          onToggle={(t) => updateTask({ ...t, done: !t.done })}
          onReorder={handleReorder('jacek')}
        />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title || 'Zadanie'}>
        {editing && <TaskForm task={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
