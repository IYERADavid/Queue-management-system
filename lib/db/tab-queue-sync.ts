import { InMemoryQueueStore } from '@/lib/patterns/in-memory-queue-store'
import type { Operator, Ticket } from '@/lib/types'

const STORAGE_KEY = 'qms-demo-queue-sync-v2'
const CHANNEL_NAME = 'qms-demo-queue-sync-v2'

type SyncPayload = {
  revision: number
  origin: string
  tickets: Ticket[]
  operators: Operator[]
}

const TAB_ORIGIN =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tab-${Math.random().toString(36).slice(2)}`

let lastAppliedRevision = 0
let listenersAttached = false
let broadcastChannel: BroadcastChannel | null = null

const listeners = new Set<() => void>()

function parse(raw: string | null): SyncPayload | null {
  if (!raw) return null
  try {
    const o = JSON.parse(raw) as SyncPayload
    if (
      typeof o.revision === 'number' &&
      typeof o.origin === 'string' &&
      Array.isArray(o.tickets) &&
      Array.isArray(o.operators)
    ) {
      return o
    }
  } catch {
    return null
  }
  return null
}

function applyPayload(payload: SyncPayload) {
  if (payload.revision <= lastAppliedRevision) return
  lastAppliedRevision = payload.revision
  const store = InMemoryQueueStore.getInstance()
  store.setTickets(JSON.parse(JSON.stringify(payload.tickets)) as Ticket[])
  store.setOperators(JSON.parse(JSON.stringify(payload.operators)) as Operator[])
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* ignore subscriber errors */
    }
  })
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY || !e.newValue) return
  const payload = parse(e.newValue)
  if (payload) applyPayload(payload)
}

function ensureListeners() {
  if (typeof window === 'undefined' || listenersAttached) return
  listenersAttached = true

  window.addEventListener('storage', onStorage)

  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
    broadcastChannel.onmessage = (ev: MessageEvent<SyncPayload>) => {
      const p = ev.data
      if (!p || typeof p.revision !== 'number') return
      if (p.origin === TAB_ORIGIN) return
      applyPayload(p)
    }
  }
}

/** Read persisted queue (other tabs / last session) into the in-memory store. */
export function initQueueTabSyncFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const payload = parse(localStorage.getItem(STORAGE_KEY))
    if (payload) applyPayload(payload)
  } catch {
    /* ignore */
  }
  ensureListeners()
}

/** After any local mutation to tickets/operators, persist and notify other tabs. */
export function pushQueueSnapshotAfterLocalMutation() {
  if (typeof window === 'undefined') return
  const { tickets, operators } = InMemoryQueueStore.getInstance().getData()
  let prevRev = 0
  try {
    const prev = parse(localStorage.getItem(STORAGE_KEY))
    if (prev) prevRev = prev.revision
  } catch {
    /* ignore */
  }
  const revision = Math.max(prevRev, lastAppliedRevision) + 1
  lastAppliedRevision = revision
  const payload: SyncPayload = {
    revision,
    origin: TAB_ORIGIN,
    tickets: JSON.parse(JSON.stringify(tickets)) as Ticket[],
    operators: JSON.parse(JSON.stringify(operators)) as Operator[],
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* storage full or disabled */
  }
  ensureListeners()
  broadcastChannel?.postMessage(payload)
}

export function subscribeQueueTabSync(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
