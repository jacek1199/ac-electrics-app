import type { SVGProps } from 'react'

const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const IconDashboard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="11" width="8" height="10" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></svg>
)
export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" /></svg>
)
export const IconWallet = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" /><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H6a2 2 0 0 1 0-4h13" /><circle cx="16" cy="14" r="1.5" /></svg>
)
export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="9" r="2.6" /><path d="M15.5 14.2c2.6.4 4.5 2.3 4.5 5.3" /></svg>
)
export const IconChecklist = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1.2 1.2L6.5 5" /><path d="m3 12 1.2 1.2L6.5 11" /><path d="m3 18 1.2 1.2L6.5 17" /></svg>
)
export const IconReport = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M15 3v4h4" /><path d="M9 12h6M9 16h6" /></svg>
)
export const IconInvoice = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 2h9l3 3v17H6Z" /><path d="M9 8h6M9 12h6M9 16h3" /><path d="M15 2v3h3" /></svg>
)
export const IconProtocol = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="6" y="3" width="12" height="18" rx="1.5" /><path d="M9 3V2h6v1" /><path d="m9 12 2 2 4-4" /></svg>
)
export const IconContacts = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="9" r="2.5" /><path d="M8 17c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" /></svg>
)
export const IconShopping = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6" /></svg>
)
export const IconWarehouse = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 21V9l9-5 9 5v12" /><path d="M3 21h18M7 21v-6h4v6M14 12h4v4h-4z" /></svg>
)
export const IconCompany = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /><path d="M10 21v-4h4v4" /></svg>
)
export const IconCalculator = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8" /><circle cx="8.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none" /><circle cx="8.5" cy="14.5" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="14.5" r="1" fill="currentColor" stroke="none" /><circle cx="8.5" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="15.5" cy="18" r="1" fill="currentColor" stroke="none" /></svg>
)
export const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
)
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
)
export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 8a6 6 0 1 1 12 0c0 4.5 1.5 6 2 7H4c.5-1 2-2.5 2-7Z" /><path d="M9.5 18a2.5 2.5 0 0 0 5 0" /></svg>
)
export const IconMapPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /></svg>
)
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconTrash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" /></svg>
)
export const IconEdit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
export const IconDownload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
)
export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>
)
export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
export const IconLock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
)
export const IconBackspace = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 4h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9l-7-8Z" /><path d="m12 9.5 5 5M17 9.5l-5 5" /></svg>
)
export const IconGripVertical = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} strokeWidth={0} fill="currentColor">
    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
  </svg>
)
export const IconSort = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 7h11M3 12h7M3 17h4" /><path d="M17 4v16M17 20l-3-3M17 20l3-3" /></svg>
)
export const IconBulb = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.15 1 1.9V16h5v-.2c0-.75.4-1.45 1-1.9A6 6 0 0 0 12 3Z" /></svg>
)
export const IconNote = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M5 3h11l3 3v15H5Z" /><path d="M16 3v3h3" /><path d="M8 10h8M8 14h8M8 18h4" /></svg>
)
export const IconCoupon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 9a2 2 0 0 1 0 6" /><path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 1 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3" /><path d="M14 5v14" strokeDasharray="2.5 2.5" /></svg>
)
export const IconPaperclip = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M21 12.5 12.5 21a5 5 0 0 1-7-7L14 5.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3L15 8.5" /></svg>
)
export const IconImage = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-5.5-5.5L4 21" /></svg>
)
export const IconVideo = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3.5v11L16 14" /></svg>
)
export const IconFolder = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /></svg>
)
export const IconFile = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 2h9l3 3v17H6Z" /><path d="M15 2v3h3" /></svg>
)
export const IconUpload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M12 21V9" /><path d="m7 14 5-5 5 5" /><path d="M5 21h14" /></svg>
)
export const IconStatement = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}><path d="M6 2h9l3 3v17H6Z" /><path d="M15 2v3h3" /><path d="M9 11h6M9 15h4" /><path d="m8.5 19.5 1.5 1.5 3-3" /></svg>
)
