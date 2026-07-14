import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { newId } from './id'
import type {
  Order,
  Transaction,
  Employee,
  TaskItem,
  Contact,
  ShoppingItem,
  WarehouseItem,
  CompanyInfo,
  Invoice,
  Protocol,
  OrderCosts,
  Coupon,
  Note,
} from './types'

const defaultCosts: OrderCosts = { materials: 0, labor: 0, fuel: 0, taxPercent: 0, other: 0 }

export const emptyOrder = (): Order => ({
  id: newId(),
  title: '',
  description: '',
  incomeSource: 'klasyczne',
  location: null,
  client: { name: '', phone: '', email: '', address: '' },
  deadline: null,
  createdAt: new Date().toISOString(),
  startedAt: null,
  completedAt: null,
  assignedEmployeeIds: [],
  status: 'nowe',
  paymentMethod: 'przelew',
  price: 0,
  costs: { ...defaultCosts },
  jacekPercent: 15,
  couponId: undefined,
  discountPercent: 0,
  notes: '',
  notifiedDayBefore: false,
  notifiedDayOf: false,
})

export const emptyTransaction = (type: Transaction['type']): Transaction => ({
  id: newId(),
  type,
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  label: '',
  incomeSource: type === 'income' ? 'inne' : undefined,
  expenseKind: type === 'expense' ? 'jednorazowe' : undefined,
  note: '',
})

export const emptyEmployee = (): Employee => ({
  id: newId(),
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  profession: '',
  rank: '',
  hourlyRate: 0,
  active: true,
  monthlyHours: {},
  note: '',
})

export const emptyTask = (): TaskItem => ({
  id: newId(),
  assignee: 'jacek',
  title: '',
  content: '',
  deadline: new Date().toISOString().slice(0, 10),
  time: '',
  done: false,
  priority: 'sredni',
  createdAt: new Date().toISOString(),
  notifiedHourBefore: false,
  notifiedAtTime: false,
  notifiedDayBefore: false,
  notifiedDayOf: false,
  sortOrder: Date.now(),
})

export const emptyContact = (): Contact => ({
  id: newId(),
  type: 'klient',
  firstName: '',
  lastName: '',
  companyName: '',
  phone: '',
  email: '',
  address: '',
  nip: '',
  note: '',
})

export const emptyShoppingItem = (): ShoppingItem => ({
  id: newId(),
  name: '',
  category: 'materialy',
  price: 0,
  quantity: 1,
  bought: false,
  addedToExpenses: false,
  priority: 'sredni',
  note: '',
  date: new Date().toISOString().slice(0, 10),
  sortOrder: Date.now(),
  relatedOrderId: undefined,
})

export const emptyWarehouseItem = (): WarehouseItem => ({
  id: newId(),
  name: '',
  category: 'materialy',
  quantity: 0,
  unit: 'szt.',
  place: '',
  value: 0,
  note: '',
  sortOrder: Date.now(),
  priority: 'sredni',
})

export const emptyCoupon = (): Coupon => ({
  id: newId(),
  name: '',
  type: 'znizka_kolejna_usluga',
  code: '',
  percent: 10,
  active: true,
  note: '',
  createdAt: new Date().toISOString(),
})

export const emptyNote = (): Note => ({
  id: newId(),
  title: '',
  content: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pinned: false,
})

export const emptyInvoice = (): Invoice => ({
  id: newId(),
  number: '',
  issueDate: new Date().toISOString().slice(0, 10),
  saleDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'przelew',
  status: 'wystawiona',
  buyer: { name: '', address: '', nip: '' },
  items: [{ description: '', quantity: 1, unit: 'usł.', unitPriceNet: 0, vatRate: 23 }],
  notes: '',
})

export const emptyProtocol = (): Protocol => ({
  id: newId(),
  number: '',
  date: new Date().toISOString().slice(0, 10),
  client: '',
  location: '',
  scopeOfWork: '',
  performedBy: [],
  materialsUsed: '',
  clientSignatureName: '',
  contractorSignatureName: 'A.C. Electrics',
  notes: '',
})

const defaultCompanyInfo: CompanyInfo = {
  name: 'A.C. Electrics',
  nip: '',
  regon: '',
  address: 'Strzelce Opolskie',
  phones: ['510 125 602'],
  emails: [],
  bankAccount: '',
  bankName: '',
  website: 'ac-electrics.pl',
  capabilities: [
    'Remont i naprawa instalacji',
    'Poprawa istniejących instalacji',
    'Monitoring',
    'Inteligentny dom (Smart Dom)',
    'Skrzynki elektryczne',
    'Wykończenia instalacji',
    'Instalacje zewnętrzne',
  ],
  workingHours: 'Pon–Sob, szybki kontakt',
}

// Older saved/synced data predates the priority & manual sort-order fields —
// backfill sane defaults so it doesn't render as "undefined" on any device.
export function backfillDefaults(data: Partial<AppState>): Partial<AppState> {
  const out = { ...data }
  if (out.tasks) {
    out.tasks = out.tasks.map(
      (t, idx) =>
        ({
          priority: 'sredni' as const,
          sortOrder: idx,
          time: '',
          notifiedHourBefore: false,
          notifiedAtTime: false,
          ...(t as Partial<TaskItem>),
        }) as TaskItem,
    )
  }
  if (out.shopping) {
    out.shopping = out.shopping.map((i, idx) => ({ priority: 'sredni' as const, sortOrder: idx, ...(i as Partial<ShoppingItem>) }) as ShoppingItem)
  }
  if (out.warehouse) {
    out.warehouse = out.warehouse.map((i, idx) => ({ sortOrder: idx, priority: 'sredni' as const, ...(i as Partial<WarehouseItem>) }) as WarehouseItem)
  }
  if (out.orders) {
    out.orders = out.orders.map((o) => ({ discountPercent: 0, ...(o as Partial<Order>) }) as Order)
  }
  if (!out.coupons) out.coupons = []
  if (!out.notes) out.notes = []
  return out
}

export interface AppState {
  orders: Order[]
  transactions: Transaction[]
  employees: Employee[]
  tasks: TaskItem[]
  contacts: Contact[]
  shopping: ShoppingItem[]
  warehouse: WarehouseItem[]
  company: CompanyInfo
  invoices: Invoice[]
  protocols: Protocol[]
  coupons: Coupon[]
  notes: Note[]
  invoiceCounter: number
  protocolCounter: number
  pin: string
  setPin: (pin: string) => void

  addOrder: (o: Order) => void
  updateOrder: (o: Order) => void
  removeOrder: (id: string) => void

  addTransaction: (t: Transaction) => void
  updateTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void

  addEmployee: (e: Employee) => void
  updateEmployee: (e: Employee) => void
  removeEmployee: (id: string) => void

  addTask: (t: TaskItem) => void
  updateTask: (t: TaskItem) => void
  removeTask: (id: string) => void
  reorderTasks: (tasks: TaskItem[]) => void

  addContact: (c: Contact) => void
  updateContact: (c: Contact) => void
  removeContact: (id: string) => void

  addShoppingItem: (s: ShoppingItem) => void
  updateShoppingItem: (s: ShoppingItem) => void
  removeShoppingItem: (id: string) => void
  reorderShopping: (items: ShoppingItem[]) => void

  addWarehouseItem: (w: WarehouseItem) => void
  updateWarehouseItem: (w: WarehouseItem) => void
  removeWarehouseItem: (id: string) => void
  reorderWarehouse: (items: WarehouseItem[]) => void

  updateCompany: (c: CompanyInfo) => void

  addInvoice: (i: Invoice) => void
  updateInvoice: (i: Invoice) => void
  removeInvoice: (id: string) => void
  nextInvoiceNumber: () => string

  addProtocol: (p: Protocol) => void
  updateProtocol: (p: Protocol) => void
  removeProtocol: (id: string) => void
  nextProtocolNumber: () => string

  addCoupon: (c: Coupon) => void
  updateCoupon: (c: Coupon) => void
  removeCoupon: (id: string) => void

  addNote: (n: Note) => void
  updateNote: (n: Note) => void
  removeNote: (id: string) => void

  importAll: (data: Partial<AppState>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      orders: [],
      transactions: [],
      employees: [],
      tasks: [],
      contacts: [],
      shopping: [],
      warehouse: [],
      company: defaultCompanyInfo,
      invoices: [],
      protocols: [],
      coupons: [],
      notes: [],
      invoiceCounter: 1,
      protocolCounter: 1,
      pin: '9282',
      setPin: (pin) => set({ pin }),

      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      updateOrder: (o) => set((s) => ({ orders: s.orders.map((x) => (x.id === o.id ? o : x)) })),
      removeOrder: (id) => set((s) => ({ orders: s.orders.filter((x) => x.id !== id) })),

      addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
      updateTransaction: (t) =>
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === t.id ? t : x)) })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addEmployee: (e) => set((s) => ({ employees: [e, ...s.employees] })),
      updateEmployee: (e) =>
        set((s) => ({ employees: s.employees.map((x) => (x.id === e.id ? e : x)) })),
      removeEmployee: (id) => set((s) => ({ employees: s.employees.filter((x) => x.id !== id) })),

      addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
      updateTask: (t) => set((s) => ({ tasks: s.tasks.map((x) => (x.id === t.id ? t : x)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),
      reorderTasks: (tasks) => set({ tasks }),

      addContact: (c) => set((s) => ({ contacts: [c, ...s.contacts] })),
      updateContact: (c) =>
        set((s) => ({ contacts: s.contacts.map((x) => (x.id === c.id ? c : x)) })),
      removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((x) => x.id !== id) })),

      addShoppingItem: (i) => set((s) => ({ shopping: [i, ...s.shopping] })),
      updateShoppingItem: (i) =>
        set((s) => ({ shopping: s.shopping.map((x) => (x.id === i.id ? i : x)) })),
      removeShoppingItem: (id) =>
        set((s) => ({ shopping: s.shopping.filter((x) => x.id !== id) })),
      reorderShopping: (shopping) => set({ shopping }),

      addWarehouseItem: (i) => set((s) => ({ warehouse: [i, ...s.warehouse] })),
      updateWarehouseItem: (i) =>
        set((s) => ({ warehouse: s.warehouse.map((x) => (x.id === i.id ? i : x)) })),
      removeWarehouseItem: (id) =>
        set((s) => ({ warehouse: s.warehouse.filter((x) => x.id !== id) })),
      reorderWarehouse: (warehouse) => set({ warehouse }),

      updateCompany: (c) => set({ company: c }),

      addInvoice: (i) => set((s) => ({ invoices: [i, ...s.invoices] })),
      updateInvoice: (i) =>
        set((s) => ({ invoices: s.invoices.map((x) => (x.id === i.id ? i : x)) })),
      removeInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),
      nextInvoiceNumber: () => {
        const n = get().invoiceCounter
        const d = new Date()
        set({ invoiceCounter: n + 1 })
        return `FV/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(n).padStart(3, '0')}`
      },

      addProtocol: (p) => set((s) => ({ protocols: [p, ...s.protocols] })),
      updateProtocol: (p) =>
        set((s) => ({ protocols: s.protocols.map((x) => (x.id === p.id ? p : x)) })),
      removeProtocol: (id) => set((s) => ({ protocols: s.protocols.filter((x) => x.id !== id) })),
      nextProtocolNumber: () => {
        const n = get().protocolCounter
        const d = new Date()
        set({ protocolCounter: n + 1 })
        return `PROT/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(n).padStart(3, '0')}`
      },

      addCoupon: (c) => set((s) => ({ coupons: [c, ...s.coupons] })),
      updateCoupon: (c) => set((s) => ({ coupons: s.coupons.map((x) => (x.id === c.id ? c : x)) })),
      removeCoupon: (id) => set((s) => ({ coupons: s.coupons.filter((x) => x.id !== id) })),

      addNote: (n) => set((s) => ({ notes: [n, ...s.notes] })),
      updateNote: (n) => set((s) => ({ notes: s.notes.map((x) => (x.id === n.id ? n : x)) })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((x) => x.id !== id) })),

      importAll: (data) => set(() => ({ ...data }) as AppState),
    }),
    {
      name: 'ac-electrics-data',
      merge: (persisted, current) => ({ ...current, ...backfillDefaults((persisted ?? {}) as Partial<AppState>) }),
    },
  ),
)
