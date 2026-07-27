export type AuthUser = {
  id: string
  displayName: string
  email: string
  role: string
  totalMatchesPlayed: number
  totalWins: number
  totalLosses: number
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type QueueResponse = {
  queueEntryId: string
  queueStatus: 'waiting' | 'matched' | 'cancelled'
  matchId: string | null
  modeType: string
  bestOf: number
  roundTimeLimitSeconds: number
  estimatedWaitTime?: number
}

export type MatchLobby = {
  matchId: string
  matchStatus: string
  bestOf: number
  roundTimeLimitSeconds: number
  roundEndsAt: string | null
  player1: { id: string; displayName: string; submitted: boolean }
  player2: { id: string; displayName: string; submitted: boolean }
  player1Score: number
  player2Score: number
  playerSide: 'player_1' | 'player_2'
  currentRoundId: string | null
  currentRoundNumber: number | null
  currentRoundStatus: string | null
}

/** Raw snake_case payloads from the Nest API / Socket.io gateway. */
export type AuthResponseRaw = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    display_name: string
    email: string
    role: string
    total_matches_played: number
    total_wins: number
    total_losses: number
  }
}

export type QueueResponseRaw = {
  queue_entry_id: string
  queue_status: 'waiting' | 'matched' | 'cancelled'
  match_id: string | null
  mode_type: string
  best_of: number
  round_time_limit_seconds: number
  estimated_wait_time?: number
}

export type MatchLobbyRaw = {
  match_id: string
  match_status: string
  best_of: number
  round_time_limit_seconds: number
  round_ends_at: string | null
  player_1: { id: string; display_name: string; submitted: boolean }
  player_2: { id: string; display_name: string; submitted: boolean }
  player_1_score: number
  player_2_score: number
  player_side: 'player_1' | 'player_2'
  current_round_id: string | null
  current_round_number: number | null
  current_round_status: string | null
}

export type MatchFoundRaw = {
  match_id: string
  match_status: string
  mode_type: string
  player_side: 'player_1' | 'player_2'
  queue_entry_id: string
}

export type RoundStartRaw = {
  round_id: string
  round_number: number
  round_ends_at: string
  round_time_limit_seconds: number
}

export type OpponentSubmittedRaw = {
  round_id: string
  round_status: string
}

export type BattleResolvedRaw = {
  round_id: string
  battle_description: string
  headline?: string
  winner_user_id: string | null
  winner_item_id: string | null
  is_tie?: boolean
  player_1_user_id: string
  player_2_user_id: string
  player_1_input: string
  player_2_input: string
  player_1_score: number
  player_2_score: number
}

export type NextRoundStartedRaw = {
  round_id: string
  round_number: number
  round_ends_at: string | null
  round_time_limit_seconds: number
}

export type MatchCompletedRaw = {
  match_id: string
  winner_user_id: string
  final_score: { player_1: number; player_2: number }
}

export type PresenceUpdatedRaw = {
  players_online: number
}

export type ConnectionReadyRaw = {
  user_id: string
  players_online?: number
}

export type MatchForfeitedRaw = {
  match_id: string
  winner_user_id: string
  forfeited_user_id: string
  reason: string
  final_score: { player_1: number; player_2: number }
}

export type RematchRequestedRaw = {
  match_id: string
  from_user_id: string
  from_display_name: string
}

export type RematchDeclinedRaw = {
  match_id: string
  by_user_id: string
}

export type ChatMessageRaw = {
  match_id: string
  from_user_id: string
  from_display_name: string
  text: string
  sent_at: string
}
