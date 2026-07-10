import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import type { OrderLocation } from '../../lib/types'
import { IconMapPin } from '../layout/icons'

const COMPANY_BASE = { lat: 50.5089, lng: 18.2975 } // Strzelce Opolskie — siedziba A.C. Electrics

const boltIcon = L.divIcon({
  className: '',
  html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#f2b705,#c9930a);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 14px rgba(242,183,5,0.6);border:2px solid #070f1c;">
    <svg viewBox="0 0 24 24" width="16" height="16" style="transform:rotate(45deg)" fill="#070f1c"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

const baseIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2f93a8;border:3px solid #070f1c;box-shadow:0 0 10px rgba(47,147,168,0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const provider = new OpenStreetMapProvider({ params: { 'accept-language': 'pl', countrycodes: 'pl' } })

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng])
  return null
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: OrderLocation | null
  onChange: (loc: OrderLocation) => void
}) {
  const [query, setQuery] = useState(value?.address ?? '')
  const [results, setResults] = useState<{ label: string; x: number; y: number }[]>([])
  const [searching, setSearching] = useState(false)
  const [route, setRoute] = useState<{ coords: [number, number][]; km: number; min: number } | null>(null)
  const debounceRef = useRef<number | null>(null)
  const suppressSearchRef = useRef(false)

  const point = value ?? null

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (suppressSearchRef.current) {
      suppressSearchRef.current = false
      return
    }
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const res = await provider.search({ query })
        setResults(res.slice(0, 5).map((r) => ({ label: r.label, x: r.x, y: r.y })))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    if (!point) {
      setRoute(null)
      return
    }
    const ctrl = new AbortController()
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${COMPANY_BASE.lng},${COMPANY_BASE.lat};${point.lng},${point.lat}?overview=full&geometries=geojson`,
      { signal: ctrl.signal },
    )
      .then((r) => r.json())
      .then((data) => {
        const rt = data?.routes?.[0]
        if (!rt) return setRoute(null)
        const coords: [number, number][] = rt.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
        setRoute({ coords, km: rt.distance / 1000, min: rt.duration / 60 })
      })
      .catch(() => setRoute(null))
    return () => ctrl.abort()
  }, [point?.lat, point?.lng])

  const center = point ?? COMPANY_BASE

  const pickResult = (r: { label: string; x: number; y: number }) => {
    onChange({ address: r.label, lat: r.y, lng: r.x })
    suppressSearchRef.current = true
    setQuery(r.label)
    setResults([])
  }

  const pickFromMap = (lat: number, lng: number) => {
    onChange({ address: value?.address || `Punkt ${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng })
  }

  const mapKey = useMemo(() => 'order-map', [])

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wyszukaj adres zlecenia…"
          className="w-full bg-navy-950 border border-navy-600 rounded-lg pl-9 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none focus:border-gold"
        />
        <IconMapPin className="w-4 h-4 absolute left-3 top-2.5 text-ink-500" />
        {searching && (
          <span className="absolute right-3 top-2.5 text-[10px] text-ink-500">szukam…</span>
        )}
        {results.length > 0 && (
          <div className="absolute z-[500] mt-1 w-full bg-navy-800 border border-navy-600 rounded-lg overflow-hidden shadow-xl">
            {results.map((r, i) => (
              <button
                type="button"
                key={i}
                onClick={() => pickResult(r)}
                className="w-full text-left px-3 py-2 text-xs text-ink-200 hover:bg-navy-700 hover:text-gold-bright border-b border-navy-700 last:border-0"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-navy-600 h-64">
        <MapContainer key={mapKey} center={[center.lat, center.lng]} zoom={point ? 14 : 12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />
          <ClickHandler onPick={pickFromMap} />
          <Marker position={[COMPANY_BASE.lat, COMPANY_BASE.lng]} icon={baseIcon} />
          {point && (
            <>
              <Marker position={[point.lat, point.lng]} icon={boltIcon} />
              <Recenter lat={point.lat} lng={point.lng} />
            </>
          )}
          {route && <Polyline positions={route.coords} pathOptions={{ color: '#f2b705', weight: 4, opacity: 0.85 }} />}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-500">
        <span>{point ? point.address : 'Kliknij mapę lub wyszukaj adres, aby ustawić lokalizację'}</span>
        {route && (
          <span className="text-teal-bright font-medium">
            {route.km.toFixed(1)} km · ~{Math.round(route.min)} min od siedziby
          </span>
        )}
      </div>
    </div>
  )
}
