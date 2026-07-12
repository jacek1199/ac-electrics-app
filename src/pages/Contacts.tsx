import { useMemo, useState } from 'react'
import { useStore, emptyContact } from '../lib/store'
import type { Contact, ContactType } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { SortSelect } from '../components/ui/SortSelect'
import { ContactForm } from '../components/contacts/ContactForm'
import { IconPlus, IconContacts, IconPhone } from '../components/layout/icons'

const typeLabels: Record<ContactType, string> = {
  klient: 'Klient', partner: 'Partner', wspolnik: 'Wspólnik', pracownik: 'Pracownik', inne: 'Inne',
}

type SortMode = 'dodania' | 'az'

const sortOptions = [
  { value: 'dodania', label: 'Kolejność dodania' },
  { value: 'az', label: 'Nazwa A-Z' },
]

export function Contacts() {
  const contacts = useStore((s) => s.contacts)
  const employees = useStore((s) => s.employees)
  const [tab, setTab] = useState<'kontakty' | 'ksiazka'>('kontakty')
  const [editing, setEditing] = useState<Contact | null>(null)
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('dodania')

  const contactName = (c: Contact) => `${c.firstName} ${c.lastName}`.trim() || c.companyName

  const filteredContacts = contacts
    .filter((c) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return `${c.firstName} ${c.lastName} ${c.companyName} ${c.phone}`.toLowerCase().includes(q)
    })
    .sort((a, b) => (sortMode === 'az' ? contactName(a).localeCompare(contactName(b), 'pl') : 0))

  const phoneBook = useMemo(() => {
    const fromContacts = contacts
      .filter((c) => c.phone)
      .map((c) => ({ name: `${c.firstName} ${c.lastName}`.trim() || c.companyName, phone: c.phone, role: typeLabels[c.type] }))
    const fromEmployees = employees
      .filter((e) => e.phone)
      .map((e) => ({ name: `${e.firstName} ${e.lastName}`.trim(), phone: e.phone, role: e.profession || 'Pracownik' }))
    const all = [...fromContacts, ...fromEmployees]
    const q = search.trim().toLowerCase()
    return all
      .filter((p) => !q || `${p.name} ${p.phone}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [contacts, employees, search])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kontakty"
        subtitle="Klienci, partnerzy, wspólnicy i książka telefoniczna"
        action={
          tab === 'kontakty' && (
            <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyContact())}>
              Dodaj kontakt
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex bg-navy-800 border border-navy-600 rounded-lg p-1">
          <button onClick={() => setTab('kontakty')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${tab === 'kontakty' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Kontakty</button>
          <button onClick={() => setTab('ksiazka')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${tab === 'ksiazka' ? 'bg-gold text-navy-950' : 'text-ink-300'}`}>Książka telefoniczna</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj po imieniu, nazwisku, telefonie…"
          className="flex-1 min-w-[200px] bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none focus:border-gold"
        />
        {tab === 'kontakty' && (
          <SortSelect value={sortMode} onChange={(v) => setSortMode(v as SortMode)} options={sortOptions} />
        )}
      </div>

      {tab === 'kontakty' ? (
        filteredContacts.length === 0 ? (
          <Card className="p-2"><EmptyState icon={<IconContacts className="w-6 h-6" />} title="Brak kontaktów" /></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredContacts.map((c) => (
              <Card key={c.id} sweep className="p-4 cursor-pointer hover:border-gold/40" onClick={() => setEditing(c)}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-head font-semibold text-ink-100">{`${c.firstName} ${c.lastName}`.trim() || c.companyName || 'Bez nazwy'}</h3>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-teal/15 text-teal-bright border border-teal/30 shrink-0">{typeLabels[c.type]}</span>
                </div>
                {c.companyName && (c.firstName || c.lastName) && <p className="text-xs text-ink-500 mb-2">{c.companyName}</p>}
                {c.phone && <div className="flex items-center gap-1.5 text-xs text-ink-300"><IconPhone className="w-3.5 h-3.5" /> {c.phone}</div>}
                {c.email && <div className="text-xs text-ink-500 mt-1 truncate">{c.email}</div>}
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="p-0 overflow-hidden">
          {phoneBook.length === 0 ? (
            <EmptyState icon={<IconPhone className="w-6 h-6" />} title="Brak numerów telefonów" />
          ) : (
            <div className="divide-y divide-navy-800">
              {phoneBook.map((p, i) => (
                <a key={i} href={`tel:${p.phone}`} className="flex items-center justify-between px-5 py-3 hover:bg-navy-800/60 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-ink-100">{p.name || 'Bez nazwy'}</div>
                    <div className="text-xs text-ink-500">{p.role}</div>
                  </div>
                  <div className="text-sm text-teal-bright font-medium">{p.phone}</div>
                </a>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `${editing.firstName} ${editing.lastName}`.trim() || 'Kontakt' : ''}>
        {editing && <ContactForm contact={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
