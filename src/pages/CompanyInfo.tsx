import { useState } from 'react'
import { useStore } from '../lib/store'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { IconPlus, IconTrash } from '../components/layout/icons'
import { pushToast } from '../components/ui/toastBus'
import { PinSettings } from '../components/lock/PinSettings'
import logo from '../assets/logo.svg'

function ListEditor({ label, values, onChange, placeholder }: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  return (
    <div>
      <div className="text-xs font-medium text-ink-300 mb-1.5">{label}</div>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={placeholder}
              className="flex-1 bg-navy-950 border border-navy-600 rounded-lg px-3 py-2 text-sm text-ink-100 outline-none focus:border-gold"
            />
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 hover:text-danger hover:bg-danger/10 shrink-0">
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => onChange([...values, ''])} className="text-xs text-teal-bright hover:text-gold flex items-center gap-1">
          <IconPlus className="w-3.5 h-3.5" /> Dodaj
        </button>
      </div>
    </div>
  )
}

export function CompanyInfoPage() {
  const company = useStore((s) => s.company)
  const updateCompany = useStore((s) => s.updateCompany)
  const [draft, setDraft] = useState(company)

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    updateCompany(draft)
    pushToast('Dane firmy zapisane')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dane firmy" subtitle="Dane wykorzystywane na fakturach, protokołach i raportach" />

      <Card className="p-5 flex items-center gap-4">
        <img src={logo} alt="A.C. Electrics" className="w-16 h-16" />
        <div>
          <h3 className="font-head text-lg font-bold text-ink-100">{draft.name}</h3>
          <p className="text-sm text-ink-500">{draft.website}</p>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Dane podstawowe" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nazwa firmy" value={draft.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="NIP" value={draft.nip} onChange={(e) => set('nip', e.target.value)} />
          <Input label="REGON" value={draft.regon} onChange={(e) => set('regon', e.target.value)} />
          <Input label="Strona www" value={draft.website} onChange={(e) => set('website', e.target.value)} />
          <div className="sm:col-span-2">
            <Input label="Adres siedziby" value={draft.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <Input label="Nazwa banku" value={draft.bankName} onChange={(e) => set('bankName', e.target.value)} />
          <Input label="Numer konta bankowego" value={draft.bankAccount} onChange={(e) => set('bankAccount', e.target.value)} />
          <div className="sm:col-span-2">
            <Input label="Godziny pracy" value={draft.workingHours} onChange={(e) => set('workingHours', e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-5">
          <CardHeader title="Numery telefonów" />
          <ListEditor label="Telefony" values={draft.phones} onChange={(v) => set('phones', v)} placeholder="np. 510 125 602" />
        </Card>
        <Card className="p-5">
          <CardHeader title="Adresy e-mail" />
          <ListEditor label="E-maile" values={draft.emails} onChange={(v) => set('emails', v)} placeholder="np. biuro@ac-electrics.pl" />
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader title="Zakres usług / możliwości" subtitle="Widoczne m.in. na ofertach i wycenach" />
        <ListEditor label="Usługi" values={draft.capabilities} onChange={(v) => set('capabilities', v)} placeholder="np. Instalacje zewnętrzne" />
      </Card>

      <PinSettings />

      <div className="flex justify-end">
        <Button variant="primary" onClick={save}>Zapisz dane firmy</Button>
      </div>
    </div>
  )
}
