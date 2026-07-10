import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { IconMenu, IconBell, IconLock } from './icons'
import { SaveIndicator } from './SaveIndicator'
import {
  isNotificationSupported,
  requestNotificationPermission,
  playBrandChime,
} from '../../lib/notifications'
import { pushToast } from '../ui/toastBus'
import { requestLock } from '../../lib/lockBus'

const titles: Record<string, string> = {
  '/': 'Pulpit',
  '/zlecenia': 'Zlecenia',
  '/zadania': 'Zadania',
  '/finanse': 'Finanse',
  '/raporty': 'Raporty',
  '/faktury': 'Faktury',
  '/protokoly': 'Protokoły',
  '/kalkulator': 'Kalkulator wycen',
  '/pracownicy': 'Pracownicy',
  '/kontakty': 'Kontakty',
  '/zakupy': 'Zakupy',
  '/magazyn': 'Magazyn',
  '/firma': 'Dane firmy',
}

function titleFor(pathname: string): string {
  if (titles[pathname]) return titles[pathname]
  const base = '/' + pathname.split('/')[1]
  return titles[base] ?? 'A.C. Electrics'
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const [permission, setPermission] = useState<NotificationPermission>(
    isNotificationSupported() ? Notification.permission : 'denied',
  )

  useEffect(() => {
    window.speechSynthesis?.getVoices()
  }, [])

  const handleBell = async () => {
    if (!isNotificationSupported()) {
      pushToast('Powiadomienia nie są wspierane w tej przeglądarce', 'danger')
      return
    }
    if (permission !== 'granted') {
      const p = await requestNotificationPermission()
      setPermission(p)
      if (p === 'granted') {
        pushToast('Powiadomienia włączone')
        playBrandChime()
      } else {
        pushToast('Powiadomienia zablokowane', 'danger')
      }
    } else {
      playBrandChime()
      pushToast('Dźwięk testowy A.C. Electrics odtworzony', 'info')
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-navy-800 bg-navy-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenu}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-300 hover:text-gold hover:bg-navy-800 shrink-0"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <h1 className="font-head text-lg sm:text-xl font-bold text-ink-100 truncate">
          {titleFor(location.pathname)}
        </h1>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <SaveIndicator />
        <button
          onClick={handleBell}
          title="Powiadomienia dźwiękowe A.C. Electrics"
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
            permission === 'granted'
              ? 'text-gold border-gold/30 bg-gold/10'
              : 'text-ink-300 border-navy-600 hover:border-teal-bright/50 hover:text-teal-bright'
          }`}
        >
          <IconBell className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={requestLock}
          title="Zablokuj panel"
          className="w-9 h-9 rounded-lg flex items-center justify-center border border-navy-600 text-ink-300 hover:border-danger/50 hover:text-danger transition-colors"
        >
          <IconLock className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  )
}
