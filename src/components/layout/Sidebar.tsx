import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import {
  IconDashboard,
  IconBolt,
  IconWallet,
  IconUsers,
  IconChecklist,
  IconReport,
  IconInvoice,
  IconProtocol,
  IconContacts,
  IconShopping,
  IconWarehouse,
  IconCompany,
  IconCalculator,
  IconX,
} from './icons'

interface NavItem {
  to: string
  label: string
  icon: (p: { className?: string }) => React.ReactElement
}
interface NavGroup {
  title: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  { title: '', items: [{ to: '/', label: 'Pulpit', icon: IconDashboard }] },
  {
    title: 'Operacje',
    items: [
      { to: '/zlecenia', label: 'Zlecenia', icon: IconBolt },
      { to: '/zadania', label: 'Zadania', icon: IconChecklist },
    ],
  },
  {
    title: 'Finanse',
    items: [
      { to: '/finanse', label: 'Finanse', icon: IconWallet },
      { to: '/raporty', label: 'Raporty', icon: IconReport },
      { to: '/faktury', label: 'Faktury', icon: IconInvoice },
      { to: '/protokoly', label: 'Protokoły', icon: IconProtocol },
      { to: '/kalkulator', label: 'Kalkulator wycen', icon: IconCalculator },
    ],
  },
  {
    title: 'Zasoby',
    items: [
      { to: '/pracownicy', label: 'Pracownicy', icon: IconUsers },
      { to: '/kontakty', label: 'Kontakty', icon: IconContacts },
      { to: '/zakupy', label: 'Zakupy', icon: IconShopping },
      { to: '/magazyn', label: 'Magazyn', icon: IconWarehouse },
    ],
  },
  { title: 'Firma', items: [{ to: '/firma', label: 'Dane firmy', icon: IconCompany }] },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-svh w-72 z-40 flex flex-col border-r border-navy-700 bg-navy-950/95 backdrop-blur-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="safe-area-top-lg flex items-center justify-between gap-2 px-5 pb-5 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="A.C. Electrics" className="w-9 h-9" />
            <div className="leading-tight font-head">
              <div className="text-teal-bright font-bold text-sm">A.C.</div>
              <div className="text-gold text-[10px] tracking-[2px] font-bold">ELECTRICS</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-500 hover:text-gold p-1">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((g) => (
            <div key={g.title || 'root'}>
              {g.title && (
                <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[1.5px] text-ink-500 uppercase">
                  {g.title}
                </div>
              )}
              <div className="space-y-1">
                {g.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-gold/15 to-transparent text-gold-bright border border-gold/25'
                          : 'text-ink-300 border border-transparent hover:bg-navy-800 hover:text-ink-100'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-navy-800 text-[11px] text-ink-500">
          Adam — Szef / Właściciel
          <br />
          Jacek Lewandowski — Partner Zarządzający / Wspólnik
        </div>
      </aside>
    </>
  )
}
