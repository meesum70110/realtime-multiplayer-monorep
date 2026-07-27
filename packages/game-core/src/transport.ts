/** How the current match is being driven. */
export type MatchMode = 'offline' | 'online' | 'ghost'

export type PlayerSide = 'player_1' | 'player_2'

/** Payload delivered when the server (or a ghost fallback) has an opponent ready. */
export interface MatchFoundInfo {
  matchId: string
  playerSide: PlayerSide
  opponent: {
    id: string
    displayName: string
  }
  bestOf: number
  roundTimeLimitSeconds: number
  currentRoundId: string | null
  /** Absolute ISO timestamp for a unanimous countdown. Null until the round is armed. */
  roundEndsAt: string | null
  queueEntryId: string
}

export interface QueueJoinedInfo {
  queueEntryId: string
  estimatedWaitTime?: number
}

export interface RoundStartedInfo {
  roundId: string
  roundNumber: number
  roundEndsAt: string
  roundTimeLimitSeconds: number
}

export interface OpponentSubmittedInfo {
  roundId: string
  roundStatus: string
}

export interface BattleResolvedInfo {
  roundId: string
  battleDescription: string
  winnerUserId: string
  player1UserId: string
  player2UserId: string
  player1Input: string
  player2Input: string
  player1Score: number
  player2Score: number
}

export interface NextRoundInfo {
  roundId: string
  roundNumber: number
  roundEndsAt: string | null
  roundTimeLimitSeconds: number
}

export interface MatchCompletedInfo {
  matchId: string
  winnerUserId: string
  finalScore: { player1: number; player2: number }
}

export interface MatchForfeitedInfo {
  matchId: string
  winnerUserId: string
  forfeitedUserId: string
  reason: string
  finalScore: { player1: number; player2: number }
}

export interface RematchRequestedInfo {
  matchId: string
  fromUserId: string
  fromDisplayName: string
}

export interface RematchDeclinedInfo {
  matchId: string
  byUserId: string
}

export interface RoundStartResult {
  roundId: string
  roundNumber: number
  roundEndsAt: string
  roundTimeLimitSeconds: number
}

export interface PrivateLobbyInfo {
  inviteCode: string
}

export interface RematchResult {
  status: 'waiting' | 'matched'
  matchId: string
}

export interface ChatMessageInfo {
  matchId: string
  fromUserId: string
  fromDisplayName: string
  text: string
  sentAt: string
}

/**
 * Injected by the app shell so GameEngine can talk to Safwan's Nest API
 * without game-core importing fetch/socket.io directly.
 */
export interface MatchTransport {
  joinQueue(): Promise<QueueJoinedInfo>
  cancelQueue(queueEntryId: string): Promise<void>
  /** Arms the shared round clock. Idempotent on the server. */
  startRound(matchId: string, roundId: string): Promise<RoundStartResult>
  submitThrow(matchId: string, roundId: string, input: string): Promise<void>
  endMatch(matchId: string): Promise<void>
  requestRematch(matchId: string): Promise<RematchResult>
  declineRematch(matchId: string): Promise<void>
  createPrivateLobby(): Promise<PrivateLobbyInfo>
  joinPrivateLobby(inviteCode: string): Promise<{ matchId?: string; status: string }>
  cancelPrivateLobby(): Promise<void>
  /** Emit a quick-chat / emote to the match room (online only). */
  sendChatMessage(matchId: string, text: string): void

  onMatchFound(handler: (info: MatchFoundInfo) => void): () => void
  onQueueCancelled?(handler: (queueEntryId: string) => void): () => void
  onRoundStarted(handler: (info: RoundStartedInfo) => void): () => void
  onOpponentSubmitted(handler: (info: OpponentSubmittedInfo) => void): () => void
  onBattleResolved(handler: (info: BattleResolvedInfo) => void): () => void
  onNextRoundStarted(handler: (info: NextRoundInfo) => void): () => void
  onMatchCompleted(handler: (info: MatchCompletedInfo) => void): () => void
  onMatchForfeited(handler: (info: MatchForfeitedInfo) => void): () => void
  onRematchRequested(handler: (info: RematchRequestedInfo) => void): () => void
  onRematchDeclined(handler: (info: RematchDeclinedInfo) => void): () => void
  onPresenceUpdated(handler: (playersOnline: number) => void): () => void
  onChatMessage(handler: (info: ChatMessageInfo) => void): () => void
}
