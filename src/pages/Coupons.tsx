import { useState } from 'react'
import { useStore, emptyCoupon } from '../lib/store'
import type { Coupon, CouponType } from '../lib/types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { CouponForm } from '../components/coupons/CouponForm'
import { IconPlus, IconCoupon } from '../components/layout/icons'

const typeLabels: Record<CouponType, string> = {
  znizka_kolejna_usluga: 'Zniżka na następną usługę',
  zwrot_polecenie: 'Zwrot za polecenie firmy',
}

export function Coupons() {
  const coupons = useStore((s) => s.coupons)
  const [editing, setEditing] = useState<Coupon | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kupony"
        subtitle="Kody rabatowe do zastosowania przy zleceniach"
        action={
          <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => setEditing(emptyCoupon())}>
            Nowy kupon
          </Button>
        }
      />

      {coupons.length === 0 ? (
        <Card className="p-2"><EmptyState icon={<IconCoupon className="w-6 h-6" />} title="Brak kuponów" hint="Dodaj pierwszy kupon rabatowy." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <Card key={c.id} sweep className={`p-4 cursor-pointer hover:border-gold/40 ${!c.active ? 'opacity-50' : ''}`} onClick={() => setEditing(c)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-head font-semibold text-ink-100">{c.name || 'Bez nazwy'}</h3>
                <span className="font-head font-bold text-gold-bright text-lg shrink-0">-{c.percent}%</span>
              </div>
              <div className="text-xs text-ink-500 mb-3">{typeLabels[c.type]}</div>
              <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-navy-950 border border-navy-600 text-teal-bright">{c.code || '—'}</span>
                {!c.active && <span className="text-[10px] px-2 py-1 rounded-full bg-ink-500/15 text-ink-500 border border-ink-500/30">Nieaktywny</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.name || 'Kupon'}>
        {editing && <CouponForm coupon={editing} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
