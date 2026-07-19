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
    if (!lastKnownUpdatedAt) {
      // No confirmed baseline for this session — e.g. this device was
      // offline when it started up, so it never got to compare notes with
      // the server. Pulling first (instead of skipping the WHERE-condition
      // and writing unconditionally) guarantees we never blindly overwrite
      // changes made elsewhere while we were out of sync. Losing whatever
      // local edit triggered this push is an acceptable, rare trade-off —
      // silently wiping shared company data is not.
      await pullRemote()
      return
    }
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('app_state')
      .update({ data: snapshot(), updated_at: nowIso })
      .eq('id', 1)
      .eq('updated_at', lastKnownUpdatedAt)
      .select('updated_at')
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

async function pullOrBootstrap(): Promise<void> {
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
    /* offline on startup — keep working from local cache. pushToRemote()
       always pulls fresh before ever writing while lastKnownUpdatedAt is
       unset, and the listeners below retry this pull once we're back. */
  }
}

export async function initSync(): Promise<void> {
  if (initialized) return
  initialized = true

  await pullOrBootstrap()

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

  // Mobile browsers routinely suspend the realtime WebSocket while the PWA
  // is backgrounded (screen locked, app switched away) without surfacing an
  // error, so changes made elsewhere never arrive. Re-pull whenever the tab
  // becomes visible again so a phone that's been asleep catches up instead
  // of silently sitting on stale data.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pullRemote()
  })
  window.addEventListener('online', () => {
    if (!lastKnownUpdatedAt) pullOrBootstrap()
  })
}
