import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Dashboard } from './pages/Dashboard'
import { Orders } from './pages/Orders'
import { Tasks } from './pages/Tasks'
import { Finance } from './pages/Finance'
import { Reports } from './pages/Reports'
import { Invoices } from './pages/Invoices'
import { Protocols } from './pages/Protocols'
import { QuoteCalculator } from './pages/QuoteCalculator'
import { Employees } from './pages/Employees'
import { Contacts } from './pages/Contacts'
import { Shopping } from './pages/Shopping'
import { Warehouse } from './pages/Warehouse'
import { CompanyInfoPage } from './pages/CompanyInfo'
import { LockScreen } from './components/lock/LockScreen'
import { subscribeLock } from './lib/lockBus'

const UNLOCK_KEY = 'ac-electrics-unlocked'

function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1')

  useEffect(
    () =>
      subscribeLock(() => {
        sessionStorage.removeItem(UNLOCK_KEY)
        setUnlocked(false)
      }),
    [],
  )

  if (!unlocked) {
    return (
      <LockScreen
        onUnlock={() => {
          sessionStorage.setItem(UNLOCK_KEY, '1')
          setUnlocked(true)
        }}
      />
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zlecenia" element={<Orders />} />
          <Route path="/zadania" element={<Tasks />} />
          <Route path="/finanse" element={<Finance />} />
          <Route path="/raporty" element={<Reports />} />
          <Route path="/faktury" element={<Invoices />} />
          <Route path="/protokoly" element={<Protocols />} />
          <Route path="/kalkulator" element={<QuoteCalculator />} />
          <Route path="/pracownicy" element={<Employees />} />
          <Route path="/kontakty" element={<Contacts />} />
          <Route path="/zakupy" element={<Shopping />} />
          <Route path="/magazyn" element={<Warehouse />} />
          <Route path="/firma" element={<CompanyInfoPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
