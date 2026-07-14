import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { PageHeader } from '../components/ui/PageHeader'
import { BotAssistant } from '../components/ui/BotAssistant'
import { Card, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { fmtPLN } from '../lib/calc'
import { generateQuotePdf, type QuoteData } from '../lib/pdf'
import { IconDownload } from '../components/layout/icons'
import { pushToast } from '../components/ui/toastBus'
import { RateSuggestion } from '../components/ui/RateSuggestion'

export function QuoteCalculator() {
  const company = useStore((s) => s.company)
  const [q, setQ] = useState<QuoteData>({
    title: '',
    clientName: '',
    laborHours: 4,
    laborRate: 60,
    materials: 300,
    fuel: 50,
    marginPercent: 20,
    vatPercent: 23,
  })
  const [downloading, setDownloading] = useState(false)

  const set = <K extends keyof QuoteData>(key: K, value: QuoteData[K]) => setQ((d) => ({ ...d, [key]: value }))

  const applyRate = (mid: number) => {
    const laborRate = 150
    const materials = Math.round(mid * 0.3)
    const laborPortion = mid - materials
    const laborHours = Math.max(1, Math.round((laborPortion / laborRate) * 2) / 2)
    setQ((d) => ({ ...d, laborRate, laborHours, materials }))
    pushToast('Zastosowano szacunkowe stawki')
  }

  const result = useMemo(() => {
    const labor = q.laborHours * q.laborRate
    const base = labor + q.materials + q.fuel
    const margin = base * (q.marginPercent / 100)
    const net = base + margin
    const gross = net * (1 + q.vatPercent / 100)
    const jacekCut = net * 0.15
    return { labor, base, margin, net, gross, jacekCut }
  }, [q])

  const download = async () => {
    setDownloading(true)
    try {
      const doc = await generateQuotePdf(q, company)
      doc.save(`Wycena-${(q.title || 'AC-Electrics').replace(/\s+/g, '_')}.pdf`)
      pushToast('Wycena PDF pobrana')
    } catch {
      pushToast('Nie udało się wygenerować PDF', 'danger')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Kalkulator wycen" subtitle="Szybka wycena zlecenia — do wysłania klientowi" />

      <BotAssistant
        name="Elektryk-Bot · Asystent wycen"
        message="Cześć! Wpisz mi tutaj godziny pracy, materiały i marżę, a ja policzę wycenę na żywo i przygotuję ładny PDF do wysłania klientowi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <CardHeader title="Dane wyceny" />
          <div className="space-y-4">
            <Input label="Tytuł / opis usługi" value={q.title} onChange={(e) => set('title', e.target.value)} placeholder="np. Wymiana instalacji — mieszkanie 50m²" />
            <RateSuggestion text={q.title} onApply={applyRate} />
            <Input label="Klient" value={q.clientName} onChange={(e) => set('clientName', e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="number" label="Godziny pracy" value={q.laborHours} onChange={(e) => set('laborHours', Number(e.target.value))} />
              <Input type="number" label="Stawka za godzinę (PLN)" value={q.laborRate} onChange={(e) => set('laborRate', Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="number" label="Materiały (PLN)" value={q.materials} onChange={(e) => set('materials', Number(e.target.value))} />
              <Input type="number" label="Dojazd / paliwo (PLN)" value={q.fuel} onChange={(e) => set('fuel', Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-ink-300 mb-1.5"><span>Marża</span><span>{q.marginPercent}%</span></div>
                <input type="range" min={0} max={100} value={q.marginPercent} onChange={(e) => set('marginPercent', Number(e.target.value))} className="w-full" />
              </div>
              <Input type="number" label="VAT (%)" value={q.vatPercent} onChange={(e) => set('vatPercent', Number(e.target.value))} />
            </div>
          </div>
        </Card>

        <Card className="p-5" glow>
          <CardHeader title="Podsumowanie wyceny" />
          <div className="space-y-2 text-sm mb-5">
            <Row label="Robocizna" value={fmtPLN(result.labor)} />
            <Row label="Materiały" value={fmtPLN(q.materials)} />
            <Row label="Dojazd / paliwo" value={fmtPLN(q.fuel)} />
            <Row label={`Marża (${q.marginPercent}%)`} value={fmtPLN(result.margin)} gold />
            <div className="border-t border-navy-700 my-2" />
            <Row label="Wartość netto" value={fmtPLN(result.net)} strong />
            <Row label={`VAT (${q.vatPercent}%)`} value={fmtPLN(result.gross - result.net)} muted />
            <Row label="Do zapłaty (brutto)" value={fmtPLN(result.gross)} strong big />
            <div className="border-t border-navy-700 my-2" />
            <Row label="Orientacyjny udział — Jacek (15% netto)" value={fmtPLN(result.jacekCut)} gold />
          </div>
          <Button variant="primary" icon={<IconDownload className="w-4 h-4" />} onClick={download} disabled={downloading} className="w-full">
            {downloading ? 'Generuję…' : 'Pobierz wycenę PDF'}
          </Button>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value, muted, gold, strong, big }: { label: string; value: string; muted?: boolean; gold?: boolean; strong?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-ink-500' : gold ? 'text-gold' : strong ? 'text-ink-100 font-bold font-head' : 'text-ink-300'}>{label}</span>
      <span className={`${big ? 'text-base' : ''} ${muted ? 'text-ink-400' : gold ? 'text-gold-bright font-semibold' : strong ? 'text-success font-bold font-head' : 'text-ink-100 font-medium'}`}>{value}</span>
    </div>
  )
}
