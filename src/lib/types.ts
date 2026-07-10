export type OrderStatus = 'nowe' | 'w_trakcie' | 'zakonczone' | 'anulowane'
export type IncomeSource = 'klasyczne' | 'odwrocone' | 'inne'
export type PaymentMethod = 'gotowka' | 'przelew' | 'karta' | 'inne'
export type ExpenseKind = 'stale' | 'jednorazowe'

export interface OrderLocation {
  address: string
  lat: number
  lng: number
}

export interface OrderCosts {
  materials: number
  labor: number
  fuel: number
  taxPercent: number
  other: number
}

export interface Order {
  id: string
  title: string
  description: string
  incomeSource: IncomeSource
  location: OrderLocation | null
  client: {
    name: string
    phone: string
    email: string
    address: string
  }
  deadline: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  assignedEmployeeIds: string[]
  status: OrderStatus
  paymentMethod: PaymentMethod
  price: number
  costs: OrderCosts
  jacekPercent: number
  notes: string
  notifiedDayBefore: boolean
  notifiedDayOf: boolean
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  date: string
  amount: number
  label: string
  incomeSource?: IncomeSource
  expenseKind?: ExpenseKind
  orderId?: string
  note?: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  profession: string
  rank: string
  hourlyRate: number
  active: boolean
  monthlyHours: Record<string, number>
  note: string
}

export type TaskAssignee = 'adam' | 'jacek'

export interface TaskItem {
  id: string
  assignee: TaskAssignee
  title: string
  content: string
  deadline: string
  relatedOrderId?: string
  done: boolean
  createdAt: string
  notifiedDayBefore: boolean
  notifiedDayOf: boolean
}

export type ContactType = 'klient' | 'partner' | 'wspolnik' | 'pracownik' | 'inne'

export interface Contact {
  id: string
  type: ContactType
  firstName: string
  lastName: string
  companyName: string
  phone: string
  email: string
  address: string
  nip: string
  note: string
}

export type ShoppingCategory = 'sprzet' | 'auta' | 'materialy' | 'inne'

export interface ShoppingItem {
  id: string
  name: string
  category: ShoppingCategory
  price: number
  quantity: number
  bought: boolean
  addedToExpenses: boolean
  note: string
  date: string
}

export type WarehouseCategory = 'sprzet' | 'materialy' | 'auta' | 'nieruchomosci' | 'inne'

export interface WarehouseItem {
  id: string
  name: string
  category: WarehouseCategory
  quantity: number
  unit: string
  place: string
  value: number
  note: string
}

export interface CompanyInfo {
  name: string
  nip: string
  regon: string
  address: string
  phones: string[]
  emails: string[]
  bankAccount: string
  bankName: string
  website: string
  capabilities: string[]
  workingHours: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unit: string
  unitPriceNet: number
  vatRate: number
}

export type InvoiceStatus = 'wystawiona' | 'oplacona' | 'anulowana'

export interface Invoice {
  id: string
  number: string
  issueDate: string
  saleDate: string
  dueDate: string
  paymentMethod: PaymentMethod
  status: InvoiceStatus
  buyer: {
    name: string
    address: string
    nip: string
  }
  orderId?: string
  items: InvoiceItem[]
  notes: string
}

export interface Protocol {
  id: string
  number: string
  date: string
  orderId?: string
  invoiceId?: string
  client: string
  location: string
  scopeOfWork: string
  performedBy: string[]
  materialsUsed: string
  clientSignatureName: string
  contractorSignatureName: string
  notes: string
}
