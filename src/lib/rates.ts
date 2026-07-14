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

// Keywords are STEMS, not full words — Polish declines nouns/adjectives heavily
// (rozdzielnica/rozdzielnicy/rozdzielnicę…), so a literal-word match would miss most
// real sentences. A space inside one entry means "all these stems, anywhere in the text".
export const SERVICE_RATES: ServiceRate[] = [
  {
    id: 'punkt',
    label: 'Punkt elektryczny (gniazdko / wypustka światła)',
    keywords: ['punkt elektryczn', 'punkt świetln', 'punkt oświetleniow', 'gniazd', 'wypustk', 'włączni', 'przełączni'],
    unit: 'za punkt',
    priceMin: 90,
    priceMax: 210,
    note: 'Sama robocizna 90–210 zł/punkt, z materiałem ok. 140–280 zł/punkt.',
  },
  {
    id: 'silowe',
    label: 'Gniazdo siłowe / trójfazowe (400V)',
    keywords: ['gniazd siłow', 'gniazd trojfazow', 'gniazd 400v', 'gniazd 3 fazow', 'przylacz siłow'],
    unit: 'za punkt',
    priceMin: 150,
    priceMax: 550,
    note: 'Montaż gniazda siłowego 150–280 zł, z przeróbką instalacji nawet 450–700 zł.',
  },
  {
    id: 'oswietlenie',
    label: 'Montaż lampy / żyrandola / oprawy oświetleniowej',
    keywords: ['lamp', 'żyrandol', 'opraw oświetleniow', 'plafon', 'kinkiet', 'oświetleni', 'halogen'],
    unit: 'za sztukę',
    priceMin: 120,
    priceMax: 700,
    note: 'Proste podłączenie 120–200 zł, wymiana żyrandola 200–400 zł, ciężki żyrandol / wysoki sufit 400–700 zł.',
  },
  {
    id: 'naprawa',
    label: 'Naprawa / usterka / drobny serwis',
    keywords: ['napraw', 'awari', 'usterk', 'serwis', 'nie działa', 'wysiad', 'iskrz'],
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
    keywords: ['wezwani', 'pogotowi elektryczn', 'tryb awaryjn', 'nagł wyjazd'],
    unit: 'pierwsza godzina',
    priceMin: 150,
    priceMax: 400,
    note: 'Pierwsza godzina (dojazd + diagnoza) 150–250 zł, w nocy lub święta nawet 300–400 zł.',
  },
  {
    id: 'pomiary',
    label: 'Pomiary instalacji elektrycznej',
    keywords: ['pomiar', 'protokoł pomiarow', 'badani instalacj', 'odbior instalacj', 'skuteczność ochron'],
    unit: 'usługa',
    priceMin: 300,
    priceMax: 1000,
    note: 'Mieszkanie 300–500 zł, dom jednorodzinny 400–1000 zł — zależnie od liczby obwodów.',
  },
  {
    id: 'przeglad',
    label: 'Przegląd / konserwacja instalacji elektrycznej',
    keywords: ['przegląd instalacj', 'konserwacj instalacj', 'okresow przegląd', 'kontrol instalacj'],
    unit: 'usługa',
    priceMin: 330,
    priceMax: 480,
    note: 'Średnio ok. 374 zł (330–480 zł) za standardowy przegląd okresowy.',
  },
  {
    id: 'rozdzielnica',
    label: 'Montaż / wymiana rozdzielnicy',
    keywords: ['rozdzielni', 'skrzynk elektryczn', 'tablic elektryczn', 'tablic bezpiecznik', 'bezpiecznik', 'roznicowk', 'wyłączni nadprądow'],
    unit: 'usługa',
    priceMin: 800,
    priceMax: 2500,
    note: 'Wymiana skrzynki z bezpiecznikami 800–2500 zł (zależnie od liczby obwodów). Pod smart/KNX 2000–6000 zł.',
  },
  {
    id: 'odgromowa',
    label: 'Instalacja odgromowa (piorunochron)',
    keywords: ['odgromow', 'piorunochron', 'zwod'],
    unit: 'usługa',
    priceMin: 2000,
    priceMax: 5000,
    note: 'Zależnie od powierzchni dachu i skomplikowania konstrukcji: 2000–5000 zł.',
  },
  {
    id: 'uziemienie',
    label: 'Uziemienie / ogranicznik przepięć',
    keywords: ['uziemieni', 'ogranicznik', 'ochronnik przepięciow', 'zabezpieczeni przeciwprzepięciow'],
    unit: 'usługa',
    priceMin: 300,
    priceMax: 1200,
    note: 'Ogranicznik przepięć klasy B+C w rozdzielnicy oraz uziomy — zależnie od zakresu prac.',
  },
  {
    id: 'smart',
    label: 'Smart Home / Inteligentny dom',
    keywords: ['smart home', 'inteligentn dom', 'knx', 'automatyk domow', 'sterowani oświetleni'],
    unit: 'za m²',
    priceMin: 200,
    priceMax: 600,
    note: 'Samo okablowanie pod smart home: 200–600 zł/m². Sterowniki/czujniki/panele osobno: 15 000–60 000 zł.',
  },
  {
    id: 'nowa_instalacja',
    label: 'Kompletna nowa instalacja elektryczna (dom)',
    keywords: ['now instalacj', 'instalacj od podstaw', 'okablowani domu', 'cał instalacj elektryczn', 'modernizacj instalacj'],
    unit: 'usługa',
    priceMin: 10000,
    priceMax: 50000,
    note: 'Robocizna za 50–80 punktów + przyłącze: 10 000–20 000 zł. Pełny koszt z materiałem (dom 100–120 m²): do 50 000 zł.',
  },
  {
    id: 'przylacze',
    label: 'Przyłącze energetyczne (podłączenie do sieci)',
    keywords: ['przyłącz energetyczn', 'przyłącz prądu', 'podłączeni domu do prądu', 'przyłączeni do sieci'],
    unit: 'usługa',
    priceMin: 3000,
    priceMax: 5000,
    note: 'Opłata przyłączeniowa ~1000 zł + projekt 500–800 zł + robocizna/materiały 1500–3000 zł.',
  },
  {
    id: 'licznik',
    label: 'Wymiana / montaż licznika prądu',
    keywords: ['licznik prądu', 'licznik energii', 'wymian licznik', 'podlicznik'],
    unit: 'usługa',
    priceMin: 250,
    priceMax: 700,
    note: 'Podlicznik ok. 130 zł, pełna wymiana licznika 250–700 zł (drożej dla trójfazowych).',
  },
  {
    id: 'monitoring',
    label: 'Montaż monitoringu (kamery, CCTV)',
    keywords: ['monitoring', 'kamer', 'cctv'],
    unit: 'za punkt kamerowy',
    priceMin: 200,
    priceMax: 500,
    note: 'Montaż i podłączenie jednej kamery z okablowaniem: 200–500 zł/kamerę.',
  },
  {
    id: 'domofon',
    label: 'Montaż domofonu',
    keywords: ['domofon'],
    unit: 'usługa',
    priceMin: 500,
    priceMax: 1000,
    note: 'Montaż domofonu ok. 500–730 zł/punkt, dla domu jednorodzinnego z urządzeniem ok. 1000 zł.',
  },
  {
    id: 'wideodomofon',
    label: 'Montaż wideodomofonu',
    keywords: ['wideodomofon', 'video domofon'],
    unit: 'usługa',
    priceMin: 350,
    priceMax: 1400,
    note: 'Analogowy 350–750 zł, cyfrowy wideodomofon 1000–1400 zł (bez urządzenia).',
  },
  {
    id: 'alarm',
    label: 'Instalacja alarmowa',
    keywords: ['alarm', 'system alarmow', 'czujk ruchu'],
    unit: 'usługa',
    priceMin: 800,
    priceMax: 3000,
    note: 'Zależnie od liczby czujek i stref — orientacyjnie 800–3000 zł za montaż w domu jednorodzinnym.',
  },
  {
    id: 'fotowoltaika',
    label: 'Instalacja fotowoltaiczna (PV)',
    keywords: ['fotowoltai', 'panel słoneczn', 'instalacj pv', 'panel pv'],
    unit: 'za kWp',
    priceMin: 4000,
    priceMax: 6500,
    note: 'Bez magazynu energii: 4000–6500 zł/kWp. Instalacja 5 kWp: ok. 20 000–32 500 zł.',
  },
  {
    id: 'wallbox',
    label: 'Ładowarka do auta elektrycznego (wallbox)',
    keywords: ['wallbox', 'ładowark samochodow', 'ładowark do aut', 'stacj ładowani ev', 'ładowani samochodu elektryczn'],
    unit: 'usługa',
    priceMin: 790,
    priceMax: 1350,
    note: 'Sam montaż (bez urządzenia) 790–1350 zł. Z urządzeniem i dedykowanym obwodem: 3000–10 000 zł.',
  },
  {
    id: 'ogrzewanie_elektryczne',
    label: 'Ogrzewanie podłogowe elektryczne / maty grzewcze',
    keywords: ['ogrzewani podłogow elektryczn', 'mat grzewcz', 'kabel grzewcz', 'foli grzewcz'],
    unit: 'za m²',
    priceMin: 50,
    priceMax: 100,
    note: 'Robocizna 50–100 zł/m² (maty vs. kable), materiał osobno 50–300 zł/m² + termostat 200–800 zł.',
  },
  {
    id: 'automatyka',
    label: 'Automatyka bram / rolet elektrycznych',
    keywords: ['automatyk bram', 'napęd bram', 'automatyk rolet', 'silnik rolet', 'bram elektryczn'],
    unit: 'usługa',
    priceMin: 300,
    priceMax: 900,
    note: 'Montaż i podłączenie napędu/siłownika (bez urządzenia): orientacyjnie 300–900 zł.',
  },
  {
    id: 'siec_lan',
    label: 'Okablowanie strukturalne / sieć LAN',
    keywords: ['sieć lan', 'okablowani strukturaln', 'gniazd rj45', 'punkt sieciow', 'gniazd internetow'],
    unit: 'za punkt',
    priceMin: 90,
    priceMax: 200,
    note: 'Wykonanie punktu sieciowego (RJ45) — porównywalnie do punktu elektrycznego: 90–200 zł/punkt.',
  },
  {
    id: 'agd',
    label: 'Podłączenie AGD (płyta indukcyjna, piekarnik)',
    keywords: ['płyt indukcyjn', 'podłączeni agd', 'piekarnik', 'kuchenk elektryczn'],
    unit: 'usługa',
    priceMin: 150,
    priceMax: 300,
    note: 'Podłączenie płyty indukcyjnej/piekarnika z wpisem do gwarancji: ok. 150–300 zł.',
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Each keyword entry is one or more space-separated word STEMS (Polish nouns/adjectives
// decline heavily, so "rozdzielnica" would miss "rozdzielnicy" / "rozdzielnicę" etc. if
// matched as a literal substring). All stems in an entry must appear somewhere in the
// text (order-independent) for that entry to match.
export function matchServiceRates(text: string): ServiceRate[] {
  const q = normalize(text)
  if (q.trim().length < 3) return []
  return SERVICE_RATES.filter((r) =>
    r.keywords.some((k) => normalize(k).split(' ').every((stem) => q.includes(stem))),
  )
}
