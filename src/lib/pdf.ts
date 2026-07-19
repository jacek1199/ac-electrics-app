import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoUrl from '../assets/logo-print.png'
import interRegularUrl from '../assets/fonts/Inter-Regular.ttf'
import interBoldUrl from '../assets/fonts/Inter-Bold.ttf'
import type { CompanyInfo, Invoice, Protocol, Statement, Order } from './types'
import { fmtDate, computeOrderProfit, fmtPLN, type PeriodSummary } from './calc'

const NAVY: [number, number, number] = [7, 15, 28]
const TEAL: [number, number, number] = [47, 147, 168]
const GOLD: [number, number, number] = [242, 183, 5]
const INK: [number, number, number] = [40, 48, 58]
const GREY: [number, number, number] = [126, 145, 166]

/** jsPDF's built-in fonts use WinAnsi encoding and cannot render Polish diacritics
 *  (ą ć ę ł ń ó ś ź ż) — every document embeds Inter instead, which covers them. */
const FONT = 'Inter'

let cachedLogo: string | null = null
async function logoDataUrl(): Promise<string> {
  if (cachedLogo) return cachedLogo
  const res = await fetch(logoUrl)
  const blob = await res.blob()
  cachedLogo = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return cachedLogo
}

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return dataUrl.slice(dataUrl.indexOf(',') + 1)
}

let cachedFonts: { regular: string; bold: string } | null = null
async function registerFonts(doc: jsPDF): Promise<void> {
  if (!cachedFonts) {
    const [regular, bold] = await Promise.all([toBase64(interRegularUrl), toBase64(interBoldUrl)])
    cachedFonts = { regular, bold }
  }
  doc.addFileToVFS('Inter-Regular.ttf', cachedFonts.regular)
  doc.addFont('Inter-Regular.ttf', FONT, 'normal')
  doc.addFileToVFS('Inter-Bold.ttf', cachedFonts.bold)
  doc.addFont('Inter-Bold.ttf', FONT, 'bold')
}

export async function newBrandedDoc(title: string, company: CompanyInfo): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  await registerFonts(doc)
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageWidth, 32, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, 32, pageWidth, 1.2, 'F')

  try {
    const logo = await logoDataUrl()
    doc.addImage(logo, 'PNG', 14, 5, 22, 22)
  } catch {
    /* logo optional */
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(16)
  doc.text(company.name.toUpperCase(), 42, 15)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9)
  doc.setTextColor(200, 210, 220)
  const contact = [company.address, company.phones.join(' / '), company.emails.join(' / ')].filter(Boolean).join('   ·   ')
  doc.text(contact, 42, 21)
  if (company.nip) doc.text(`NIP: ${company.nip}`, 42, 26)

  doc.setFontSize(13)
  doc.setTextColor(...GOLD)
  doc.setFont(FONT, 'bold')
  doc.text(title, pageWidth - 14, 15, { align: 'right' })

  doc.setTextColor(...INK)
  return doc
}

export function drawFooter(doc: jsPDF, note?: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.3)
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18)
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  doc.text(note || 'Wygenerowano automatycznie w panelu A.C. Electrics', 14, pageHeight - 13)
  doc.text(`Strona ${doc.internal.pages.length - 1}`, pageWidth - 14, pageHeight - 13, { align: 'right' })
}

export async function generateInvoicePdf(invoice: Invoice, company: CompanyInfo): Promise<jsPDF> {
  const doc = await newBrandedDoc(`FAKTURA ${invoice.number}`, company)
  let y = 42

  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('SPRZEDAWCA', 14, y)
  doc.text('NABYWCA', 110, y)
  y += 5
  doc.setTextColor(...INK)
  doc.setFont(FONT, 'bold')
  doc.text(company.name, 14, y)
  doc.text(invoice.buyer.name || '—', 110, y)
  doc.setFont(FONT, 'normal')
  y += 5
  doc.text(company.address || '', 14, y)
  doc.text(invoice.buyer.address || '', 110, y)
  y += 5
  doc.text(company.nip ? `NIP: ${company.nip}` : '', 14, y)
  doc.text(invoice.buyer.nip ? `NIP: ${invoice.buyer.nip}` : '', 110, y)

  y += 10
  doc.setFontSize(9)
  doc.text(`Data wystawienia: ${fmtDate(invoice.issueDate)}`, 14, y)
  doc.text(`Data sprzedaży: ${fmtDate(invoice.saleDate)}`, 80, y)
  doc.text(`Termin płatności: ${fmtDate(invoice.dueDate)}`, 146, y)
  y += 5
  const methodLabels: Record<Invoice['paymentMethod'], string> = { gotowka: 'Gotówka', przelew: 'Przelew', karta: 'Karta', inne: 'Inne' }
  doc.text(`Sposób płatności: ${methodLabels[invoice.paymentMethod]}`, 14, y)

  y += 8
  const rows = invoice.items.map((it) => {
    const net = it.quantity * it.unitPriceNet
    const vat = net * (it.vatRate / 100)
    return [
      it.description || '—',
      String(it.quantity),
      it.unit,
      it.unitPriceNet.toFixed(2),
      `${it.vatRate}%`,
      net.toFixed(2),
      (net + vat).toFixed(2),
    ]
  })
  const netTotal = invoice.items.reduce((a, it) => a + it.quantity * it.unitPriceNet, 0)
  const grossTotal = invoice.items.reduce((a, it) => a + it.quantity * it.unitPriceNet * (1 + it.vatRate / 100), 0)
  const vatTotal = grossTotal - netTotal

  autoTable(doc, {
    startY: y,
    head: [['Opis', 'Ilość', 'J.m.', 'Cena netto', 'VAT', 'Wartość netto', 'Wartość brutto']],
    body: rows,
    theme: 'plain',
    styles: { font: FONT, fontSize: 9, textColor: INK, lineColor: [200, 208, 216], lineWidth: 0.1 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 247, 250] },
    margin: { left: 14, right: 14 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 6

  // legally required breakdown: net/VAT/gross per VAT rate (art. 106e ustawy o VAT)
  const vatGroups = new Map<number, { net: number; vat: number }>()
  for (const it of invoice.items) {
    const net = it.quantity * it.unitPriceNet
    const g = vatGroups.get(it.vatRate) || { net: 0, vat: 0 }
    g.net += net
    g.vat += net * (it.vatRate / 100)
    vatGroups.set(it.vatRate, g)
  }
  const vatRows = [...vatGroups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, g]) => [`${rate}%`, g.net.toFixed(2), g.vat.toFixed(2), (g.net + g.vat).toFixed(2)])

  autoTable(doc, {
    startY: finalY,
    head: [['Stawka VAT', 'Wartość netto', 'Kwota VAT', 'Wartość brutto']],
    body: vatRows,
    foot: [['Razem', netTotal.toFixed(2), vatTotal.toFixed(2), grossTotal.toFixed(2)]],
    theme: 'plain',
    styles: { font: FONT, fontSize: 8.5, textColor: INK, lineColor: [200, 208, 216], lineWidth: 0.1 },
    headStyles: { fillColor: [20, 40, 66], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [244, 247, 250], textColor: INK, fontStyle: 'bold' },
    margin: { left: 14, right: 110 },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...GOLD)
  doc.text(`DO ZAPŁATY: ${grossTotal.toFixed(2)} PLN`, 196, finalY - 4, { align: 'right' })
  doc.setTextColor(...INK)
  doc.setFont(FONT, 'normal')

  if (invoice.paymentMethod === 'przelew' && company.bankAccount) {
    doc.setFontSize(9)
    doc.setFont(FONT, 'bold')
    doc.text('Płatność przelewem na numer konta:', 14, finalY)
    doc.setFont(FONT, 'normal')
    doc.text(`${company.bankAccount}${company.bankName ? '  (' + company.bankName + ')' : ''}`, 14, finalY + 5)
    finalY += 12
  }

  if (invoice.notes) {
    doc.setFontSize(9)
    doc.setFont(FONT, 'bold')
    doc.text('Uwagi:', 14, finalY)
    doc.setFont(FONT, 'normal')
    doc.text(doc.splitTextToSize(invoice.notes, 180), 14, finalY + 5)
  }

  drawFooter(doc, `${company.name}${company.nip ? ' · NIP ' + company.nip : ''}`)
  return doc
}

export async function generateProtocolPdf(protocol: Protocol, company: CompanyInfo): Promise<jsPDF> {
  const doc = await newBrandedDoc(`PROTOKÓŁ ${protocol.number}`, company)
  let y = 45

  doc.setFontSize(10)
  const field = (label: string, value: string) => {
    doc.setFont(FONT, 'bold')
    doc.text(`${label}:`, 14, y)
    doc.setFont(FONT, 'normal')
    doc.text(doc.splitTextToSize(value || '—', 150), 55, y)
    y += 8
  }

  field('Data', fmtDate(protocol.date))
  field('Klient', protocol.client)
  field('Lokalizacja', protocol.location)
  y += 2
  doc.setFont(FONT, 'bold')
  doc.text('Zakres wykonanych prac:', 14, y)
  y += 6
  doc.setFont(FONT, 'normal')
  const scopeLines = doc.splitTextToSize(protocol.scopeOfWork || '—', 180)
  doc.text(scopeLines, 14, y)
  y += scopeLines.length * 5 + 6

  doc.setFont(FONT, 'bold')
  doc.text('Wykonawcy:', 14, y)
  doc.setFont(FONT, 'normal')
  doc.text(protocol.performedBy.join(', ') || '—', 55, y)
  y += 8

  doc.setFont(FONT, 'bold')
  doc.text('Użyte materiały:', 14, y)
  y += 6
  doc.setFont(FONT, 'normal')
  const matLines = doc.splitTextToSize(protocol.materialsUsed || '—', 180)
  doc.text(matLines, 14, y)
  y += matLines.length * 5 + 6

  if (protocol.notes) {
    doc.setFont(FONT, 'bold')
    doc.text('Uwagi:', 14, y)
    y += 6
    doc.setFont(FONT, 'normal')
    doc.text(doc.splitTextToSize(protocol.notes, 180), 14, y)
    y += 14
  }

  y = Math.max(y, 220)
  doc.setDrawColor(...GREY)
  doc.line(20, y, 85, y)
  doc.line(115, y, 180, y)
  doc.setFontSize(9)
  doc.text(protocol.clientSignatureName || 'Podpis klienta', 20, y + 5)
  doc.text(protocol.contractorSignatureName || 'Podpis wykonawcy', 115, y + 5)

  drawFooter(doc)
  return doc
}

export async function generateStatementPdf(statement: Statement, company: CompanyInfo): Promise<jsPDF> {
  const doc = await newBrandedDoc(`OŚWIADCZENIE ${statement.number}`, company)
  let y = 42

  doc.setFontSize(10)
  const field = (label: string, value: string) => {
    doc.setFont(FONT, 'bold')
    doc.text(`${label}:`, 14, y)
    doc.setFont(FONT, 'normal')
    doc.text(doc.splitTextToSize(value || '—', 150), 55, y)
    y += 7
  }
  field('Data', fmtDate(statement.date))
  field('Miejsce', statement.location)
  y += 3

  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('ZLECENIODAWCA', 14, y)
  doc.text('ZLECENIOBIORCA', 110, y)
  y += 5
  doc.setTextColor(...INK)
  doc.setFont(FONT, 'bold')
  doc.text(statement.clientName || '—', 14, y)
  doc.text(company.name, 110, y)
  doc.setFont(FONT, 'normal')
  y += 5
  doc.text(doc.splitTextToSize(statement.clientAddress || '', 85), 14, y)
  doc.text(doc.splitTextToSize(company.address || '', 85), 110, y)
  y += 12

  const heading = (text: string) => {
    doc.setFont(FONT, 'bold')
    doc.setFontSize(10)
    doc.text(text, 14, y)
    y += 6
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9.5)
  }
  const paragraph = (text: string) => {
    const lines = doc.splitTextToSize(text, 182)
    doc.text(lines, 14, y)
    y += lines.length * 4.6 + 4
  }

  heading('§ 1. Przedmiot oświadczenia')
  paragraph(
    `Niniejsze oświadczenie dotyczy prac elektrycznych wykonywanych przez Zleceniobiorcę na zlecenie Zleceniodawcy w lokalizacji: ${statement.location || '—'}, obejmujących: ${(statement.scopeDescription || '—').trim().replace(/\.+$/, '')}.`,
  )

  heading('§ 2. Świadomość ryzyka')
  paragraph(
    'Zleceniodawca oświadcza, iż został poinformowany, że prace polegające na ingerencji w istniejącą instalację elektryczną oraz elementy budowlane (ściany, tynki, okładziny, sufity podwieszane itp.) niezbędne do jej prawidłowego wykonania mogą wiązać się z: (a) koniecznością naruszenia istniejących powłok i wykończeń w miejscach bezpośrednio związanych z zakresem prac, (b) ujawnieniem wcześniej nieznanych usterek, uszkodzeń lub nieprawidłowości instalacji elektrycznej powstałych przed rozpoczęciem prac przez Zleceniobiorcę.',
  )

  heading('§ 3. Zakres odpowiedzialności')
  paragraph(
    '1. Zleceniobiorca ponosi odpowiedzialność za szkody wyrządzone Zleceniodawcy w związku z nienależytym wykonaniem zobowiązania, zgodnie z art. 471 Kodeksu cywilnego, w zakresie wynikającym z winy umyślnej lub rażącego niedbalstwa Zleceniobiorcy.',
  )
  paragraph(
    '2. Zleceniobiorca nie ponosi odpowiedzialności za szkody będące normalnym następstwem prawidłowo wykonanych prac (art. 361 § 1 Kodeksu cywilnego), w tym za konieczne naruszenie elementów wykończeniowych wskazanych w § 2 lit. a, o ile ich naprawa nie została odrębnie zlecona Zleceniobiorcy.',
  )
  paragraph(
    '3. Zleceniodawca ponosi odpowiedzialność za szkody powstałe wskutek zatajenia przed Zleceniobiorcą informacji o stanie technicznym istniejącej instalacji, mających wpływ na prawidłowe wykonanie prac.',
  )
  paragraph(
    '4. Postanowienia niniejszego oświadczenia nie wyłączają ani nie ograniczają odpowiedzialności Zleceniobiorcy za szkodę wyrządzoną umyślnie (art. 473 § 2 Kodeksu cywilnego) ani uprawnień Zleceniodawcy będącego konsumentem wynikających z powszechnie obowiązujących przepisów prawa, w szczególności ustawy o prawach konsumenta.',
  )

  heading('§ 4. Postanowienia końcowe')
  paragraph('Oświadczenie sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.')

  if (statement.notes) {
    doc.setFont(FONT, 'bold')
    doc.text('Uwagi:', 14, y)
    y += 6
    doc.setFont(FONT, 'normal')
    doc.text(doc.splitTextToSize(statement.notes, 182), 14, y)
    y += 14
  }

  y = Math.max(y + 6, 245)
  doc.setDrawColor(...GREY)
  doc.line(20, y, 85, y)
  doc.line(115, y, 180, y)
  doc.setFontSize(9)
  doc.text(statement.clientSignatureName || 'Podpis zleceniodawcy', 20, y + 5)
  doc.text(statement.contractorSignatureName || 'Podpis zleceniobiorcy', 115, y + 5)

  drawFooter(doc)
  return doc
}

const statusLabelsPdf: Record<Order['status'], string> = {
  nowe: 'Nowe', w_trakcie: 'W trakcie', zakonczone: 'Zakończone', anulowane: 'Anulowane',
}
const sourceLabelsPdf: Record<Order['incomeSource'], string> = {
  klasyczne: 'Klasyczne', odwrocone: 'Odwrócone', inne: 'Inne',
}

export async function generateReportPdf(
  orders: Order[],
  summary: PeriodSummary,
  company: CompanyInfo,
  periodLabel: string,
): Promise<jsPDF> {
  const doc = await newBrandedDoc(`RAPORT — ${periodLabel}`, company)
  let y = 42

  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('PODSUMOWANIE OKRESU', 14, y)
  y += 6

  const stats: [string, string][] = [
    ['Przychody', fmtPLN(summary.income)],
    ['Wydatki', fmtPLN(summary.expenses)],
    ['Udział Jacka', fmtPLN(summary.jacekTotal)],
    ['Zysk netto', fmtPLN(summary.profit)],
    ['Liczba zleceń', String(summary.orderCount)],
    ['Godziny przepracowane', `${summary.hoursWorked} h`],
  ]
  const colWidth = 60
  stats.forEach(([label, value], i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 14 + col * colWidth
    const yy = y + row * 16
    doc.setTextColor(...GREY)
    doc.setFontSize(8)
    doc.text(label.toUpperCase(), x, yy)
    doc.setTextColor(...INK)
    doc.setFont(FONT, 'bold')
    doc.setFontSize(12)
    doc.text(value, x, yy + 6)
    doc.setFont(FONT, 'normal')
  })
  y += 16 * Math.ceil(stats.length / 3) + 8

  const rows = [...orders]
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .map((o) => {
      const p = computeOrderProfit(o)
      return [
        o.title || '—',
        fmtDate(o.deadline),
        statusLabelsPdf[o.status],
        sourceLabelsPdf[o.incomeSource],
        p.price.toFixed(2),
        p.totalCosts.toFixed(2),
        p.netProfit.toFixed(2),
      ]
    })

  autoTable(doc, {
    startY: y,
    head: [['Zlecenie', 'Termin', 'Status', 'Kategoria', 'Przychód', 'Koszty', 'Zysk netto']],
    body: rows,
    theme: 'plain',
    styles: { font: FONT, fontSize: 8.5, textColor: INK, lineColor: [200, 208, 216], lineWidth: 0.1 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 247, 250] },
    margin: { left: 14, right: 14 },
  })

  drawFooter(doc, `Raport wygenerowany dla ${company.name} — ${periodLabel}`)
  return doc
}

export interface QuoteData {
  title: string
  clientName: string
  laborHours: number
  laborRate: number
  materials: number
  fuel: number
  marginPercent: number
  vatPercent: number
}

export async function generateQuotePdf(q: QuoteData, company: CompanyInfo): Promise<jsPDF> {
  const doc = await newBrandedDoc('WYCENA', company)
  let y = 42

  doc.setFontSize(11)
  doc.setFont(FONT, 'bold')
  doc.text(q.title || 'Wycena usługi elektrycznej', 14, y)
  doc.setFont(FONT, 'normal')
  y += 6
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text(`Dla: ${q.clientName || '—'}`, 14, y)
  doc.text(`Data: ${fmtDate(new Date().toISOString())}`, 150, y)
  y += 10

  const labor = q.laborHours * q.laborRate
  const base = labor + q.materials + q.fuel
  const margin = base * (q.marginPercent / 100)
  const net = base + margin
  const gross = net * (1 + q.vatPercent / 100)

  autoTable(doc, {
    startY: y,
    head: [['Pozycja', 'Wartość (PLN)']],
    body: [
      [`Robocizna (${q.laborHours} h × ${q.laborRate.toFixed(2)} PLN)`, labor.toFixed(2)],
      ['Materiały', q.materials.toFixed(2)],
      ['Dojazd / paliwo', q.fuel.toFixed(2)],
      [`Marża (${q.marginPercent}%)`, margin.toFixed(2)],
    ],
    theme: 'plain',
    styles: { font: FONT, fontSize: 10, textColor: INK, lineColor: [200, 208, 216], lineWidth: 0.1 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    columnStyles: { 1: { halign: 'right' } },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.text(`Wartość netto: ${net.toFixed(2)} PLN`, 196, finalY, { align: 'right' })
  doc.setTextColor(...GOLD)
  doc.setFontSize(13)
  doc.text(`Do zapłaty (brutto, VAT ${q.vatPercent}%): ${gross.toFixed(2)} PLN`, 196, finalY + 8, { align: 'right' })
  doc.setTextColor(...INK)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.text('Wycena orientacyjna — ostateczna cena może się różnić po oględzinach na miejscu.', 14, finalY + 20)

  drawFooter(doc)
  return doc
}
