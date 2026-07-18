import { supabase } from './supabaseClient'
import { useStore, backfillDefaults, type AppState } from './store'

const SYNC_KEYS = [
  'orders',
  'transactions',
  'employees',
  'tasks',
  'contacts',
  'shopping',
  'warehouse',
  'company',
  'invoices',
  'protocols',
  'coupons',
  'notes',
  'invoiceCounter',
  'protocolCounter',
  'pin',
  'monthlyGoal',
] as const

type SyncedState = Pick<AppState, (typeof SYNC_KEYS)[number]>

function snapshot(): SyncedState {
  const state = useStore.getState()
  const out = {} as SyncedState
  for (const key of SYNC_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(out as any)[key] = state[key]
  }
  return out
}

function isEmptySnapshot(data: Partial<SyncedState> | null | undefined): boolean {
  if (!data) return true
  return !data.orders && !data.employees && !data.contacts && !data.invoices
}

let applyingRemote = false
let pushTimer: number | null = null
let initialized = false

async function pushToRemote() {
  try {
    await supabase
      .from('app_state')
      .update({ data: snapshot(), updated_at: new Date().toISOString() })
      .eq('id', 1)
  } catch {
    /* offline or unreachable — local data stays queued via the next change */
  }
}

export async function initSync(): Promise<void> {
  if (initialized) return
  initialized = true

  try {
    const { data, error } = await supabase.from('app_state').select('data').eq('id', 1).single()
    if (!error && !isEmptySnapshot(data?.data as Partial<SyncedState>)) {
      applyingRemote = true
      useStore.setState(backfillDefaults(data!.data as Partial<AppState>))
      applyingRemote = false
    } else {
      await pushToRemote()
    }
  } catch {
    /* offline on startup — keep working from local cache */
  }

  supabase
    .channel('app_state_sync')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'app_state', filter: 'id=eq.1' },
      (payload) => {
        applyingRemote = true
        useStore.setState(backfillDefaults(payload.new.data as Partial<AppState>))
        applyingRemote = false
      },
    )
    .subscribe()

  useStore.subscribe(() => {
    if (applyingRemote) return
    if (pushTimer) window.clearTimeout(pushTimer)
    pushTimer = window.setTimeout(pushToRemote, 800)
  })
}
