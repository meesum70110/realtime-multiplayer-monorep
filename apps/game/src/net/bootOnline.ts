import type {
  BattleResolvedInfo,
  ChatMessageInfo,
  MatchCompletedInfo,
  MatchForfeitedInfo,
  MatchFoundInfo,
  MatchTransport,
  NextRoundInfo,
  OpponentSubmittedInfo,
  QueueJoinedInfo,
  RematchDeclinedInfo,
  RematchRequestedInfo,
  RoundStartedInfo,
  RoundStartResult,
} from '@rpsa/game-core'
import {
  cancelMatchmakingQueue,
  cancelPrivateLobby,
  createGuestSession,
  createPrivateLobby,
  declineRematch,
  endMatch,
  ensureGuestSession,
  getMatchLobby,
  joinMatchmakingQueue,
  joinPrivateLobby,
  requestRematch,
  startMatchRound,
  submitMatchThrow,
} from '@/lib/api/client'
import type {
  BattleResolvedRaw,
  ChatMessageRaw,
  MatchCompletedRaw,
  MatchForfeitedRaw,
  MatchFoundRaw,
  NextRoundStartedRaw,
  OpponentSubmittedRaw,
  PresenceUpdatedRaw,
  RematchDeclinedRaw,
  RematchRequestedRaw,
  RoundStartRaw,
} from '@/lib/api/types'
import {
  connectRealtime,
  emitChatMessage,
  setRealtimeHandlers,
  waitForConnectionReady,
} from '@/lib/socket'

type MatchFoundListener = (info: MatchFoundInfo) => void
type QueueCancelledListener = (queueEntryId: string) => void
type RoundStartedListener = (info: RoundStartedInfo) => void
type OpponentSubmittedListener = (info: OpponentSubmittedInfo) => void
type BattleResolvedListener = (info: BattleResolvedInfo) => void
type NextRoundListener = (info: NextRoundInfo) => void
type MatchCompletedListener = (info: MatchCompletedInfo) => void
type MatchForfeitedListener = (info: MatchForfeitedInfo) => void
type RematchRequestedListener = (info: RematchRequestedInfo) => void
type RematchDeclinedListener = (info: RematchDeclinedInfo) => void
type PresenceListener = (playersOnline: number) => void
type ChatMessageListener = (info: ChatMessageInfo) => void

/**
 * App-side adapter that implements game-core's MatchTransport against
 * Safwan's REST API + Socket.io realtime events.
 */
export function createMatchTransport(): MatchTransport {
  const matchFoundListeners = new Set<MatchFoundListener>()
  const queueCancelledListeners = new Set<QueueCancelledListener>()
  const roundStartedListeners = new Set<RoundStartedListener>()
  const opponentSubmittedListeners = new Set<OpponentSubmittedListener>()
  const battleResolvedListeners = new Set<BattleResolvedListener>()
  const nextRoundListeners = new Set<NextRoundListener>()
  const matchCompletedListeners = new Set<MatchCompletedListener>()
  const matchForfeitedListeners = new Set<MatchForfeitedListener>()
  const rematchRequestedListeners = new Set<RematchRequestedListener>()
  const rematchDeclinedListeners = new Set<RematchDeclinedListener>()
  const presenceListeners = new Set<PresenceListener>()
  const chatMessageListeners = new Set<ChatMessageListener>()

  setRealtimeHandlers({
    onMatchFound: (raw) => {
      void hydrateMatchFound(raw)
        .then((info) => {
          for (const listener of matchFoundListeners) listener(info)
        })
        .catch((err) => {
          console.warn('[matchmaking] failed to hydrate match_found', err)
        })
    },
    onQueueCancelled: (payload) => {
      for (const listener of queueCancelledListeners) {
        listener(payload.queue_entry_id)
      }
    },
    onRoundStarted: (raw: RoundStartRaw) => {
      const info = mapRoundStarted(raw)
      for (const listener of roundStartedListeners) listener(info)
    },
    onOpponentSubmitted: (raw: OpponentSubmittedRaw) => {
      const info = {
        roundId: raw.round_id,
        roundStatus: raw.round_status,
      }
      for (const listener of opponentSubmittedListeners) listener(info)
    },
    onBattleResolved: (raw: BattleResolvedRaw) => {
      const info = mapBattleResolved(raw)
      for (const listener of battleResolvedListeners) listener(info)
    },
    onNextRoundStarted: (raw: NextRoundStartedRaw) => {
      const info = mapNextRound(raw)
      for (const listener of nextRoundListeners) listener(info)
    },
    onMatchCompleted: (raw: MatchCompletedRaw) => {
      const info = mapMatchCompleted(raw)
      for (const listener of matchCompletedListeners) listener(info)
    },
    onMatchForfeited: (raw: MatchForfeitedRaw) => {
      const info = mapMatchForfeited(raw)
      for (const listener of matchForfeitedListeners) listener(info)
    },
    onRematchRequested: (raw: RematchRequestedRaw) => {
      const info = {
        matchId: raw.match_id,
        fromUserId: raw.from_user_id,
        fromDisplayName: raw.from_display_name,
      }
      for (const listener of rematchRequestedListeners) listener(info)
    },
    onRematchDeclined: (raw: RematchDeclinedRaw) => {
      const info = {
        matchId: raw.match_id,
        byUserId: raw.by_user_id,
      }
      for (const listener of rematchDeclinedListeners) listener(info)
    },
    onPresenceUpdated: (raw: PresenceUpdatedRaw) => {
      for (const listener of presenceListeners) listener(raw.players_online)
    },
    onChatMessage: (raw: ChatMessageRaw) => {
      const info: ChatMessageInfo = {
        matchId: raw.match_id,
        fromUserId: raw.from_user_id,
        fromDisplayName: raw.from_display_name,
        text: raw.text,
        sentAt: raw.sent_at,
      }
      for (const listener of chatMessageListeners) listener(info)
    },
    onConnectionReady: (payload) => {
      if (typeof payload.players_online === 'number') {
        for (const listener of presenceListeners) listener(payload.players_online)
      }
    },
  })

  return {
    async joinQueue(): Promise<QueueJoinedInfo> {
      const joined = await joinMatchmakingQueue()

      if (joined.queueStatus === 'matched' && joined.matchId) {
        void hydrateMatchFound({
          match_id: joined.matchId,
          match_status: 'lobby',
          mode_type: joined.modeType,
          player_side: 'player_2',
          queue_entry_id: joined.queueEntryId,
        })
          .then((info) => {
            for (const listener of matchFoundListeners) listener(info)
          })
          .catch((err) => {
            console.warn('[matchmaking] failed to hydrate instant match', err)
          })
      }

      return {
        queueEntryId: joined.queueEntryId,
        estimatedWaitTime: joined.estimatedWaitTime,
      }
    },

    async cancelQueue(queueEntryId: string): Promise<void> {
      await cancelMatchmakingQueue(queueEntryId)
    },

    async startRound(matchId: string, roundId: string): Promise<RoundStartResult> {
      return startMatchRound(matchId, roundId)
    },

    async submitThrow(matchId: string, roundId: string, input: string): Promise<void> {
      await submitMatchThrow(matchId, roundId, input)
    },

    async endMatch(matchId: string): Promise<void> {
      await endMatch(matchId)
    },

    async requestRematch(matchId: string) {
      return requestRematch(matchId)
    },

    async declineRematch(matchId: string): Promise<void> {
      await declineRematch(matchId)
    },

    async createPrivateLobby() {
      return createPrivateLobby()
    },

    async joinPrivateLobby(inviteCode: string) {
      return joinPrivateLobby(inviteCode)
    },

    async cancelPrivateLobby(): Promise<void> {
      await cancelPrivateLobby()
    },

    sendChatMessage(matchId: string, text: string): void {
      emitChatMessage(matchId, text)
    },

    onMatchFound(handler: MatchFoundListener): () => void {
      matchFoundListeners.add(handler)
      return () => {
        matchFoundListeners.delete(handler)
      }
    },

    onQueueCancelled(handler: QueueCancelledListener): () => void {
      queueCancelledListeners.add(handler)
      return () => {
        queueCancelledListeners.delete(handler)
      }
    },

    onRoundStarted(handler: RoundStartedListener): () => void {
      roundStartedListeners.add(handler)
      return () => {
        roundStartedListeners.delete(handler)
      }
    },

    onOpponentSubmitted(handler: OpponentSubmittedListener): () => void {
      opponentSubmittedListeners.add(handler)
      return () => {
        opponentSubmittedListeners.delete(handler)
      }
    },

    onBattleResolved(handler: BattleResolvedListener): () => void {
      battleResolvedListeners.add(handler)
      return () => {
        battleResolvedListeners.delete(handler)
      }
    },

    onNextRoundStarted(handler: NextRoundListener): () => void {
      nextRoundListeners.add(handler)
      return () => {
        nextRoundListeners.delete(handler)
      }
    },

    onMatchCompleted(handler: MatchCompletedListener): () => void {
      matchCompletedListeners.add(handler)
      return () => {
        matchCompletedListeners.delete(handler)
      }
    },

    onMatchForfeited(handler: MatchForfeitedListener): () => void {
      matchForfeitedListeners.add(handler)
      return () => {
        matchForfeitedListeners.delete(handler)
      }
    },

    onRematchRequested(handler: RematchRequestedListener): () => void {
      rematchRequestedListeners.add(handler)
      return () => {
        rematchRequestedListeners.delete(handler)
      }
    },

    onRematchDeclined(handler: RematchDeclinedListener): () => void {
      rematchDeclinedListeners.add(handler)
      return () => {
        rematchDeclinedListeners.delete(handler)
      }
    },

    onPresenceUpdated(handler: PresenceListener): () => void {
      presenceListeners.add(handler)
      return () => {
        presenceListeners.delete(handler)
      }
    },

    onChatMessage(handler: ChatMessageListener): () => void {
      chatMessageListeners.add(handler)
      return () => {
        chatMessageListeners.delete(handler)
      }
    },
  }
}

function mapRoundStarted(raw: RoundStartRaw): RoundStartedInfo {
  return {
    roundId: raw.round_id,
    roundNumber: raw.round_number,
    roundEndsAt: raw.round_ends_at,
    roundTimeLimitSeconds: raw.round_time_limit_seconds,
  }
}

function mapBattleResolved(raw: BattleResolvedRaw): BattleResolvedInfo {
  return {
    roundId: raw.round_id,
    battleDescription: raw.battle_description,
    winnerUserId: raw.winner_user_id,
    player1UserId: raw.player_1_user_id,
    player2UserId: raw.player_2_user_id,
    player1Input: raw.player_1_input,
    player2Input: raw.player_2_input,
    player1Score: raw.player_1_score,
    player2Score: raw.player_2_score,
  }
}

function mapNextRound(raw: NextRoundStartedRaw): NextRoundInfo {
  return {
    roundId: raw.round_id,
    roundNumber: raw.round_number,
    roundEndsAt: raw.round_ends_at,
    roundTimeLimitSeconds: raw.round_time_limit_seconds,
  }
}

function mapMatchCompleted(raw: MatchCompletedRaw): MatchCompletedInfo {
  return {
    matchId: raw.match_id,
    winnerUserId: raw.winner_user_id,
    finalScore: {
      player1: raw.final_score.player_1,
      player2: raw.final_score.player_2,
    },
  }
}

function mapMatchForfeited(raw: MatchForfeitedRaw): MatchForfeitedInfo {
  return {
    matchId: raw.match_id,
    winnerUserId: raw.winner_user_id,
    forfeitedUserId: raw.forfeited_user_id,
    reason: raw.reason,
    finalScore: {
      player1: raw.final_score.player_1,
      player2: raw.final_score.player_2,
    },
  }
}

async function hydrateMatchFound(raw: MatchFoundRaw): Promise<MatchFoundInfo> {
  const lobby = await getMatchLobby(raw.match_id)
  const opponent =
    lobby.playerSide === 'player_1' ? lobby.player2 : lobby.player1

  return {
    matchId: lobby.matchId,
    playerSide: lobby.playerSide,
    opponent: {
      id: opponent.id,
      displayName: opponent.displayName,
    },
    bestOf: lobby.bestOf,
    roundTimeLimitSeconds: lobby.roundTimeLimitSeconds,
    currentRoundId: lobby.currentRoundId,
    roundEndsAt: lobby.roundEndsAt,
    queueEntryId: raw.queue_entry_id,
  }
}

/**
 * Boots identity + realtime on app mount (not on Find Match).
 * Returns a transport when REST guest auth succeeds. Socket readiness is
 * best-effort: if realtime times out we keep the REST transport so queue /
 * lobby calls still work, instead of silently dropping to pure offline bots.
 */
export async function bootOnlineSession(engine: {
  setTransport: (t: MatchTransport | null) => void
  setPlayerIdentity: (name: string, userId?: string) => void
}): Promise<MatchTransport | null> {
  try {
    let session = await ensureGuestSession()
    engine.setPlayerIdentity(session.user.displayName, session.user.id)

    // Register handlers BEFORE connect so `connection_ready` / presence are not dropped.
    const transport = createMatchTransport()
    engine.setTransport(transport)

    connectRealtime(session.accessToken)

    try {
      await waitForConnectionReady(12_000)
      console.info('[boot] online session ready (REST + realtime)')
    } catch (firstErr) {
      console.warn('[boot] realtime timed out — minting fresh guest and retrying', firstErr)
      session = await createGuestSession()
      engine.setPlayerIdentity(session.user.displayName, session.user.id)
      connectRealtime(session.accessToken)
      try {
        await waitForConnectionReady(12_000)
        console.info('[boot] online session ready after retry (REST + realtime)')
      } catch (secondErr) {
        // REST is up (guest worked); keep transport. Socket.io will keep reconnecting.
        console.warn(
          '[boot] realtime still unavailable — continuing with REST transport; socket will retry',
          secondErr,
        )
      }
    }

    return transport
  } catch (err) {
    console.warn('[boot] online session unavailable — falling back to offline bot', err)
    engine.setTransport(null)
    return null
  }
}
