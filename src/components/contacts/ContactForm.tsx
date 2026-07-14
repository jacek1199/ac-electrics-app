import { useState } from 'react'
import type { Contact } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function ContactForm({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const [draft, setDraft] = useState<Contact>(contact)
  const addContact = useStore((s) => s.addContact)
  const updateContact = useStore((s) => s.updateContact)
  const removeContact = useStore((s) => s.removeContact)
  const isNew = !useStore.getState().contacts.some((c) => c.id === contact.id)

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.firstName.trim() && !draft.companyName.trim()) {
      pushToast('Podaj imię lub nazwę firmy', 'danger')
      return
    }
    if (isNew) addContact(draft)
    else updateContact(draft)
    pushToast(isNew ? 'Kontakt dodany' : 'Kontakt zaktualizowany')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć ten kontakt?', 'Usuń kontakt')
    if (!ok) return
    removeContact(draft.id)
    pushToast('Kontakt usunięty', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Select label="Typ kontaktu" value={draft.type} onChange={(e) => set('type', e.target.value as Contact['type'])}>
        <option value="klient">Klient</option>
        <option value="partner">Partner</option>
        <option value="wspolnik">Wspólnik</option>
        <option value="pracownik">Pracownik</option>
        <option value="inne">Inne</option>
      </Select>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Imię" value={draft.firstName} onChange={(e) => set('firstName', e.target.value)} autoFocus />
        <Input label="Nazwisko" value={draft.lastName} onChange={(e) => set('lastName', e.target.value)} />
      </div>
      <Input label="Firma (opcjonalnie)" value={draft.companyName} onChange={(e) => set('companyName', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Telefon" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input label="E-mail" value={draft.email} onChange={(e) => set('email', e.target.value)} />
      </div>
      <Input label="Adres" value={draft.address} onChange={(e) => set('address', e.target.value)} />
      <Input label="NIP (opcjonalnie)" value={draft.nip} onChange={(e) => set('nip', e.target.value)} />
      <Textarea label="Notatka" value={draft.note} onChange={(e) => set('note', e.target.value)} />

      <div className="flex items-center justify-between pt-2 border-t border-navy-700">
        {!isNew ? (
          <Button variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />} onClick={del}>Usuń</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="subtle" onClick={onClose}>Anuluj</Button>
          <Button variant="primary" onClick={save}>Zapisz</Button>
        </div>
      </div>
    </div>
  )
}
