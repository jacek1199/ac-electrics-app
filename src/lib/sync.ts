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
  'documents',
  'statements',
  'invoiceCounter',
  'protocolCounter',
  'statementCounter',
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

// The last `updated_at` this client actually saw from the server. Every push
// is conditioned on the row still having this value — if another client (or
// an old/stale tab of this one) wrote in the meantime, the condition matches
// zero rows and we pull fresh data instead of blindly overwriting it. Without
// this, a tab left open for a long time with an outdated in-memory snapshot
// (e.g. one that missed a realtime update) would silently wipe out newer
// changes the next time it happened to push.
let lastKnownUpdatedAt: string | null = null

function applyRemoteSnapshot(data: Partial<AppState>, updatedAt: string) {
  applyingRemote = true
  useStore.setState(backfillDefaults(data))
  applyingRemote = false
  lastKnownUpdatedAt = updatedAt
}

async function pullRemote(): Promise<void> {
  const { data, error } = await supabase.from('app_state').select('data, updated_at').eq('id', 1).single()
  if (!error && data) {
    applyRemoteSnapshot(data.data as Partial<AppState>, data.updated_at as string)
  }
}

async function pushToRemote() {
  try {
    const nowIso = new Date().toISOString()
    let query = supabase.from('app_state').update({ data: snapshot(), updated_at: nowIso }).eq('id', 1)
    if (lastKnownUpdatedAt) query = query.eq('updated_at', lastKnownUpdatedAt)
    const { data, error } = await query.select('updated_at')
    if (error) return
    if (!data || data.length === 0) {
      // Someone else changed the shared data since we last saw it — pull
      // fresh instead of overwriting so we never destroy their changes.
      await pullRemote()
      return
    }
    lastKnownUpdatedAt = data[0].updated_at as string
  } catch {
    /* offline or unreachable — local data stays queued via the next change */
  }
}

export async function initSync(): Promise<void> {
  if (initialized) return
  initialized = true

  try {
    const { data, error } = await supabase.from('app_state').select('data, updated_at').eq('id', 1).single()
    if (!error && data) {
      if (!isEmptySnapshot(data.data as Partial<SyncedState>)) {
        applyRemoteSnapshot(data.data as Partial<AppState>, data.updated_at as string)
      } else {
        lastKnownUpdatedAt = data.updated_at as string
        await pushToRemote()
      }
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
        applyRemoteSnapshot(payload.new.data as Partial<AppState>, payload.new.updated_at as string)
      },
    )
    .subscribe()

  useStore.subscribe(() => {
    if (applyingRemote) return
    if (pushTimer) window.clearTimeout(pushTimer)
    pushTimer = window.setTimeout(pushToRemote, 800)
  })
}
