import { useState } from 'react'
import { useStore } from '../../lib/store'
import { Card, CardHeader } from '../ui/Card'
import { Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { IconLock } from '../layout/icons'
import { pushToast } from '../ui/toastBus'

export function PinSettings() {
  const pin = useStore((s) => s.pin)
  const setPin = useStore((s) => s.setPin)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const save = () => {
    if (current !== pin) {
      pushToast('Obecny PIN jest nieprawidłowy', 'danger')
      return
    }
    if (!/^\d{4,6}$/.test(next)) {
      pushToast('Nowy PIN musi mieć 4-6 cyfr', 'danger')
      return
    }
    if (next !== confirm) {
      pushToast('Nowy PIN i potwierdzenie różnią się', 'danger')
      return
    }
    setPin(next)
    setCurrent('')
    setNext('')
    setConfirm('')
    pushToast('PIN zmieniony — obowiązuje od następnego zablokowania')
  }

  return (
    <Card className="p-5">
      <CardHeader
        title="Bezpieczeństwo"
        subtitle="Wspólny PIN dostępu dla Adama i Jacka — obowiązuje na tym urządzeniu"
        action={<IconLock className="w-5 h-5 text-ink-500" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input type="password" inputMode="numeric" label="Obecny PIN" value={current} onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ''))} maxLength={6} />
        <Input type="password" inputMode="numeric" label="Nowy PIN (4-6 cyfr)" value={next} onChange={(e) => setNext(e.target.value.replace(/\D/g, ''))} maxLength={6} />
        <Input type="password" inputMode="numeric" label="Powtórz nowy PIN" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))} maxLength={6} />
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="primary" size="sm" onClick={save}>Zmień PIN</Button>
      </div>
    </Card>
  )
}
