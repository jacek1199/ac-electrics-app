import { useState } from 'react'
import type { Coupon } from '../../lib/types'
import { useStore } from '../../lib/store'
import { Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconTrash } from '../layout/icons'
import { confirmAction } from '../ui/confirmBus'
import { pushToast } from '../ui/toastBus'

export function CouponForm({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const [draft, setDraft] = useState<Coupon>(coupon)
  const addCoupon = useStore((s) => s.addCoupon)
  const updateCoupon = useStore((s) => s.updateCoupon)
  const removeCoupon = useStore((s) => s.removeCoupon)
  const isNew = !useStore.getState().coupons.some((c) => c.id === coupon.id)

  const set = <K extends keyof Coupon>(key: K, value: Coupon[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = () => {
    if (!draft.name.trim()) {
      pushToast('Podaj nazwę kuponu', 'danger')
      return
    }
    if (isNew) addCoupon(draft)
    else updateCoupon(draft)
    pushToast('Zapisano')
    onClose()
  }

  const del = async () => {
    const ok = await confirmAction('Usunąć ten kupon?', 'Usuń kupon')
    if (!ok) return
    removeCoupon(draft.id)
    pushToast('Usunięto', 'info')
    onClose()
  }

  return (
    <div className="space-y-4">
      <Input label="Nazwa kuponu" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="np. Zniżka za polecenie -10%" autoFocus />
      <Select label="Typ kuponu" value={draft.type} onChange={(e) => set('type', e.target.value as Coupon['type'])}>
        <option value="znizka_kolejna_usluga">Zniżka na następną usługę</option>
        <option value="zwrot_polecenie">Zwrot od wykonanej usługi po poleceniu firmy</option>
      </Select>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Kod kuponu" value={draft.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="np. POLEC10" />
        <Input type="number" label="Rabat (%)" value={draft.percent} onChange={(e) => set('percent', Number(e.target.value))} />
      </div>
      <Input label="Notatka (opcjonalnie)" value={draft.note} onChange={(e) => set('note', e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-300">
        <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} className="accent-gold w-4 h-4" />
        Aktywny (widoczny do wyboru przy zleceniach)
      </label>

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
