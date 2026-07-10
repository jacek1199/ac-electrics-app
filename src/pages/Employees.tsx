import { useState } from 'react'
import { useStore, emptyEmployee } from '../lib/store'
import type { Employee } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { EmployeeForm } from '../components/employees/EmployeeForm'
import { monthKey, employeePayroll, fmtPLN } from '../lib/calc'
import { IconPlus, IconUsers, IconPhone } from '../components/layout/icons'

export function Employees() {
  const employees = useStore((s) => s.employees)
  const [editing, setEditing] = useState<Employee | null>(null)
  const mKey = monthKey(new Date())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pracownicy"
        subtitle={`${employees.length} pracowników · stawki, godziny i wypłaty`}
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyEmployee())}>
            Dodaj pracownika
          </Button>
        }
      />

      {employees.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconUsers className="w-6 h-6" />} title="Brak pracowników" hint="Dodaj pierwszego pracownika, aby przypisywać go do zleceń." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {employees.map((e) => (
            <Card key={e.id} sweep className="p-4 cursor-pointer hover:border-gold/40" onClick={() => setEditing(e)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-head font-semibold text-ink-100">{e.firstName} {e.lastName}</h3>
                  <p className="text-xs text-ink-500">{e.profession || 'Brak zawodu'} {e.rank && `· ${e.rank}`}</p>
                </div>
                {!e.active && <span className="text-[10px] px-2 py-1 rounded-full bg-ink-500/15 text-ink-500 border border-ink-500/30">Nieaktywny</span>}
              </div>
              {e.phone && (
                <div className="flex items-center gap-1.5 text-xs text-ink-400 mb-3">
                  <IconPhone className="w-3.5 h-3.5" /> {e.phone}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-700">
                <div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wide">Stawka</div>
                  <div className="font-head font-bold text-ink-100 text-sm">{fmtPLN(e.hourlyRate)}/h</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-500 uppercase tracking-wide">Wypłata (mies.)</div>
                  <div className="font-head font-bold text-gold-bright text-sm">{fmtPLN(employeePayroll(e, mKey))}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `${editing.firstName || 'Nowy'} ${editing.lastName || 'pracownik'}` : ''}>
        {editing && <EmployeeForm employee={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
