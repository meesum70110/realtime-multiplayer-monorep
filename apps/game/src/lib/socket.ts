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

const WS_URL = (import.meta.env.VITE_WS_URL || 'http://localhost:3001/realtime').replace(
  /\/$/,
  '',
)

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
    transports: ['websocket', 'polling'],
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

  socket.on('connect_error', () => {
    /* engine degrades to ghost/offline; leave logging to boot */
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
