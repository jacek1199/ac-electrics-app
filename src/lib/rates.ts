// Orientacyjne stawki rynkowe za usługi elektryczne w Polsce (2026), zebrane z publicznie
// dostępnych cenników branżowych. Służą wyłącznie jako punkt odniesienia przy wycenie —
// finalna cena zawsze zależy od realnego zakresu prac.
export interface ServiceRate {
  id: string
  label: string
  keywords: string[]
  unit: string
  priceMin: number
  priceMax: number
  hourlyMin?: number
  hourlyMax?: number
  note: string
}

export const SERVICE_RATES: ServiceRate[] = [
  {
    id: 'punkt',
    label: 'Punkt elektryczny (gniazdko / wypustka światła)',
    keywords: ['punkt elektryczny', 'punkt świetlny', 'punkt oświetleniowy', 'gniazdko', 'gniazdo', 'wypustka', 'montaż gniazd', 'wymiana gniazd'],
    unit: 'za punkt',
    priceMin: 90,
    priceMax: 210,
    note: 'Sama robocizna 90–210 zł/punkt, z materiałem ok. 140–280 zł/punkt.',
  },
  {
    id: 'naprawa',
    label: 'Naprawa / usterka / drobny serwis',
    keywords: ['naprawa', 'awaria', 'usterka', 'serwis', 'nie działa', 'wysiada', 'iskrzy'],
    unit: 'za godzinę',
    priceMin: 100,
    priceMax: 250,
    hourlyMin: 100,
    hourlyMax: 250,
    note: 'Roboczogodzina 100–250 zł. Wezwanie awaryjne (1h z dojazdem) 150–250 zł, w nocy/święta 300–400 zł.',
  },
  {
    id: 'wezwanie',
    label: 'Wezwanie awaryjne (pogotowie elektryczne)',
    keywords: ['wezwanie', 'pogotowie elektryczne', 'tryb awaryjny', 'nagły wyjazd'],
    unit: 'pierwsza godzina',
    priceMin: 150,
    priceMax: 400,
    note: 'Pierwsza godzina (dojazd + diagnoza) 150–250 zł, w nocy lub święta nawet 300–400 zł.',
  },
  {
    id: 'pomiary',
    label: 'Pomiary instalacji elektrycznej',
    keywords: ['pomiar', 'pomiary', 'protokół pomiarowy', 'badanie instalacji', 'odbiór instalacji', 'skuteczność ochrony'],
    unit: 'usługa',
    priceMin: 300,
    priceMax: 1000,
    note: 'Mieszkanie 300–500 zł, dom jednorodzinny 400–1000 zł — zależnie od liczby obwodów.',
  },
  {
    id: 'rozdzielnica',
    label: 'Montaż / wymiana rozdzielnicy',
    keywords: ['rozdzielnica', 'rozdzielnia', 'skrzynka elektryczna', 'tablica elektryczna', 'tablica bezpiecznikowa'],
    unit: 'usługa',
    priceMin: 300,
    priceMax: 1000,
    note: 'Standardowa rozdzielnica 300–1000+ zł. Rozdzielnica pod smart/KNX 2000–6000 zł.',
  },
  {
    id: 'odgromowa',
    label: 'Instalacja odgromowa (piorunochron)',
    keywords: ['odgromow', 'piorunochron', 'zwód', 'uziemienie dachu'],
    unit: 'usługa',
    priceMin: 2000,
    priceMax: 5000,
    note: 'Zależnie od powierzchni dachu i skomplikowania konstrukcji: 2000–5000 zł.',
  },
  {
    id: 'smart',
    label: 'Smart Home / Inteligentny dom',
    keywords: ['smart home', 'inteligentny dom', 'knx', 'automatyka domowa', 'sterowanie oświetleniem'],
    unit: 'za m²',
    priceMin: 200,
    priceMax: 600,
    note: 'Samo okablowanie pod smart home: 200–600 zł/m². Sterowniki/czujniki/panele osobno: 15 000–60 000 zł.',
  },
  {
    id: 'nowa_instalacja',
    label: 'Kompletna nowa instalacja elektryczna (dom)',
    keywords: ['nowa instalacja', 'instalacja od podstaw', 'instalacja domu', 'okablowanie domu', 'podłączenie domu do prądu'],
    unit: 'usługa',
    priceMin: 20000,
    priceMax: 50000,
    note: 'Dom 100–120 m² w standardzie deweloperskim (robocizna + materiał): 20 000–50 000 zł.',
  },
  {
    id: 'monitoring',
    label: 'Montaż monitoringu (kamery, CCTV)',
    keywords: ['monitoring', 'kamera', 'kamery', 'cctv'],
    unit: 'za punkt kamerowy',
    priceMin: 200,
    priceMax: 500,
    note: 'Montaż i podłączenie jednej kamery z okablowaniem: 200–500 zł/kamerę.',
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function matchServiceRates(text: string): ServiceRate[] {
  const q = normalize(text)
  if (q.trim().length < 3) return []
  return SERVICE_RATES.filter((r) => r.keywords.some((k) => q.includes(normalize(k))))
}
