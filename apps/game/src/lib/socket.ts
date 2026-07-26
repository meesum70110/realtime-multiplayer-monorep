import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from '@/lib/api/client'
import type {
  BattleResolvedRaw,
  ConnectionReadyRaw,
  MatchCompletedRaw,
  MatchForfeitedRaw,
  MatchFoundRaw,
  NextRoundStartedRaw,
  OpponentSubmittedRaw,
  PresenceUpdatedRaw,
  QueueResponseRaw,
  RematchDeclinedRaw,
  RematchRequestedRaw,
  RoundStartRaw,
} from '@/lib/api/types'

/**
 * Socket.IO expects an http(s) origin; it upgrades to ws(s) itself.
 * Nest gateway namespace is `/realtime` (pathname in the URL, not Engine.IO `path`).
 */
function resolveRealtimeUrl(): string {
  const fromEnv = (import.meta.env.VITE_WS_URL as string | undefined)?.trim()
  const fromApi = (import.meta.env.VITE_API_URL as string | undefined)?.trim()

  let raw =
    fromEnv ||
    (fromApi
      ? fromApi.replace(/\/$/, '').replace(/\/api$/i, '') + '/realtime'
      : 'http://localhost:3001/realtime')

  // Managers speak http(s); ws(s) in env is a common Vercel misconfig.
  raw = raw.replace(/^ws:/i, 'http:').replace(/^wss:/i, 'https:')

  if (!/^https?:\/\//i.test(raw)) {
    raw = `${typeof location !== 'undefined' && location.protocol === 'https:' ? 'https' : 'http'}://${raw}`
  }

  raw = raw.replace(/\/$/, '')

  // If env is only the Render origin (or …/api), still land on the Nest namespace.
  if (!/\/realtime$/i.test(raw)) {
    raw = `${raw.replace(/\/api$/i, '')}/realtime`
  }

  return raw
}

const WS_URL = resolveRealtimeUrl()

let socket: Socket | null = null
let connectionReadyPromise: Promise<string> | null = null
let connectionReadyResolve: ((userId: string) => void) | null = null

export type RealtimeHandlers = {
  onMatchFound?: (payload: MatchFoundRaw) => void
  onQueueJoined?: (payload: QueueResponseRaw) => void
  onQueueCancelled?: (payload: { queue_entry_id: string; queue_status: string }) => void
  onRoundStarted?: (payload: RoundStartRaw) => void
  onOpponentSubmitted?: (payload: OpponentSubmittedRaw) => void
  onBattleResolved?: (payload: BattleResolvedRaw) => void
  onNextRoundStarted?: (payload: NextRoundStartedRaw) => void
  onMatchCompleted?: (payload: MatchCompletedRaw) => void
  onMatchForfeited?: (payload: MatchForfeitedRaw) => void
  onRematchRequested?: (payload: RematchRequestedRaw) => void
  onRematchDeclined?: (payload: RematchDeclinedRaw) => void
  onPresenceUpdated?: (payload: PresenceUpdatedRaw) => void
  onConnectionReady?: (payload: ConnectionReadyRaw) => void
  onDisconnect?: (reason: string) => void
}

const handlers: RealtimeHandlers = {}

export function setRealtimeHandlers(next: RealtimeHandlers): void {
  Object.assign(handlers, next)
}

export function getSocket(): Socket | null {
  return socket
}

export function isSocketConnected(): boolean {
  return !!socket?.connected
}

function resetReadyPromise(): void {
  connectionReadyPromise = new Promise<string>((resolve) => {
    connectionReadyResolve = resolve
  })
}

export function waitForConnectionReady(timeoutMs = 8_000): Promise<string> {
  if (!connectionReadyPromise) resetReadyPromise()
  return Promise.race([
    connectionReadyPromise!,
    new Promise<string>((_, reject) => {
      window.setTimeout(() => reject(new Error('Realtime connection timed out')), timeoutMs)
    }),
  ])
}

/**
 * Connects (or reconnects) to the Nest `/realtime` namespace with the access token.
 * The gateway authenticates via `handshake.auth.token`.
 */
export function connectRealtime(accessToken?: string): Socket {
  const token = accessToken ?? getAccessToken()
  if (!token) {
    throw new Error('Cannot connect realtime without an access token')
  }

  if (socket) {
    socket.auth = { token }
    if (!socket.connected) socket.connect()
    return socket
  }

  resetReadyPromise()

  socket = io(WS_URL, {
    autoConnect: true,
    auth: { token },
    // Polling-first handshake, then upgrade — required for reliable cross-origin
    // HTTPS→Render. Websocket-first often fails the upgrade and never recovers
    // without rewriting transports on connect_error.
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 800,
  })

  socket.on('connection_ready', (payload: ConnectionReadyRaw) => {
    connectionReadyResolve?.(payload.user_id)
    handlers.onConnectionReady?.(payload)
    if (typeof payload.players_online === 'number') {
      handlers.onPresenceUpdated?.({ players_online: payload.players_online })
    }
  })

  socket.on('match_found', (payload: MatchFoundRaw) => {
    handlers.onMatchFound?.(payload)
  })

  socket.on('queue_joined', (payload: QueueResponseRaw) => {
    handlers.onQueueJoined?.(payload)
  })

  socket.on('queue_cancelled', (payload: { queue_entry_id: string; queue_status: string }) => {
    handlers.onQueueCancelled?.(payload)
  })

  socket.on('round_started', (payload: RoundStartRaw) => {
    handlers.onRoundStarted?.(payload)
  })

  socket.on('opponent_submitted', (payload: OpponentSubmittedRaw) => {
    handlers.onOpponentSubmitted?.(payload)
  })

  socket.on('battle_resolved', (payload: BattleResolvedRaw) => {
    handlers.onBattleResolved?.(payload)
  })

  socket.on('next_round_started', (payload: NextRoundStartedRaw) => {
    handlers.onNextRoundStarted?.(payload)
  })

  socket.on('match_completed', (payload: MatchCompletedRaw) => {
    handlers.onMatchCompleted?.(payload)
  })

  socket.on('match_forfeited', (payload: MatchForfeitedRaw) => {
    handlers.onMatchForfeited?.(payload)
  })

  socket.on('rematch_requested', (payload: RematchRequestedRaw) => {
    handlers.onRematchRequested?.(payload)
  })

  socket.on('rematch_declined', (payload: RematchDeclinedRaw) => {
    handlers.onRematchDeclined?.(payload)
  })

  socket.on('presence_updated', (payload: PresenceUpdatedRaw) => {
    handlers.onPresenceUpdated?.(payload)
  })

  socket.on('disconnect', (reason) => {
    handlers.onDisconnect?.(reason)
    resetReadyPromise()
  })

  socket.on('connect_error', (err) => {
    console.warn('[realtime] connect_error', WS_URL, err.message)
    // If a prior build forced websocket-first, restore the classic upgrade path.
    const opts = socket?.io?.opts
    if (opts?.transports?.[0] === 'websocket') {
      opts.transports = ['polling', 'websocket']
    }
  })

  return socket
}

export function disconnectRealtime(): void {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
  connectionReadyPromise = null
  connectionReadyResolve = null
}
