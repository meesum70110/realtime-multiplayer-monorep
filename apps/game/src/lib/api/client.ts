import type {
  AuthResponseRaw,
  AuthSession,
  AuthUser,
  MatchLobby,
  MatchLobbyRaw,
  QueueResponse,
  QueueResponseRaw,
  RoundStartRaw,
} from './types'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

const TOKEN_KEY = 'rpsa-access-token'
const REFRESH_KEY = 'rpsa-refresh-token'
const USER_KEY = 'rpsa-user'

let accessTokenMemory: string | null = null

export function getApiUrl(): string {
  return API_URL
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory
  try {
    accessTokenMemory = localStorage.getItem(TOKEN_KEY)
  } catch {
    accessTokenMemory = null
  }
  return accessTokenMemory
}

export function clearSession(): void {
  accessTokenMemory = null
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

export function saveSession(session: AuthSession): void {
  accessTokenMemory = session.accessToken
  try {
    localStorage.setItem(TOKEN_KEY, session.accessToken)
    localStorage.setItem(REFRESH_KEY, session.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  } catch {
    /* ignore */
  }
}

export function loadCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      (typeof (data as { message: unknown }).message === 'string' ||
        Array.isArray((data as { message: unknown }).message))
        ? Array.isArray((data as { message: unknown }).message)
          ? ((data as { message: string[] }).message).join(', ')
          : String((data as { message: string }).message)
        : `Request failed (${res.status})`
    throw new ApiError(msg, res.status, data)
  }

  return data as T
}

function mapUser(raw: AuthResponseRaw['user']): AuthUser {
  return {
    id: raw.id,
    displayName: raw.display_name,
    email: raw.email,
    role: raw.role,
    totalMatchesPlayed: raw.total_matches_played,
    totalWins: raw.total_wins,
    totalLosses: raw.total_losses,
  }
}

function mapAuth(raw: AuthResponseRaw): AuthSession {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    user: mapUser(raw.user),
  }
}

function mapQueue(raw: QueueResponseRaw): QueueResponse {
  return {
    queueEntryId: raw.queue_entry_id,
    queueStatus: raw.queue_status,
    matchId: raw.match_id,
    modeType: raw.mode_type,
    bestOf: raw.best_of,
    roundTimeLimitSeconds: raw.round_time_limit_seconds,
    estimatedWaitTime: raw.estimated_wait_time,
  }
}

function mapLobby(raw: MatchLobbyRaw): MatchLobby {
  return {
    matchId: raw.match_id,
    matchStatus: raw.match_status,
    bestOf: raw.best_of,
    roundTimeLimitSeconds: raw.round_time_limit_seconds,
    roundEndsAt: raw.round_ends_at,
    player1: {
      id: raw.player_1.id,
      displayName: raw.player_1.display_name,
      submitted: raw.player_1.submitted,
    },
    player2: {
      id: raw.player_2.id,
      displayName: raw.player_2.display_name,
      submitted: raw.player_2.submitted,
    },
    player1Score: raw.player_1_score,
    player2Score: raw.player_2_score,
    playerSide: raw.player_side,
    currentRoundId: raw.current_round_id,
    currentRoundNumber: raw.current_round_number,
    currentRoundStatus: raw.current_round_status,
  }
}

export async function createGuestSession(displayName?: string): Promise<AuthSession> {
  const body =
    displayName && displayName.trim().length >= 4
      ? JSON.stringify({ display_name: displayName.trim() })
      : JSON.stringify({})

  const raw = await request<AuthResponseRaw>(
    '/auth/guest',
    { method: 'POST', body },
    false,
  )
  const session = mapAuth(raw)
  saveSession(session)
  return session
}

/**
 * Ensures we have a usable guest session. Reuses a cached token when present;
 * mints a fresh guest if missing or if the health/auth check fails later.
 */
export async function ensureGuestSession(): Promise<AuthSession> {
  const existing = getAccessToken()
  const cachedUser = loadCachedUser()
  if (existing && cachedUser) {
    return {
      accessToken: existing,
      refreshToken: '',
      user: cachedUser,
    }
  }
  return createGuestSession()
}

export async function joinMatchmakingQueue(): Promise<QueueResponse> {
  const raw = await request<QueueResponseRaw>('/matchmaking/queue', {
    method: 'POST',
    body: JSON.stringify({ mode_type: '1v1' }),
  })
  return mapQueue(raw)
}

export async function cancelMatchmakingQueue(queueEntryId: string): Promise<void> {
  await request(`/matchmaking/queue/${queueEntryId}`, { method: 'DELETE' })
}

export async function getMatchLobby(matchId: string): Promise<MatchLobby> {
  const raw = await request<MatchLobbyRaw>(`/matches/${matchId}`)
  return mapLobby(raw)
}

export async function startMatchRound(
  matchId: string,
  roundId: string,
): Promise<{
  roundId: string
  roundNumber: number
  roundEndsAt: string
  roundTimeLimitSeconds: number
}> {
  const raw = await request<RoundStartRaw>(
    `/matches/${matchId}/rounds/${roundId}/start`,
    { method: 'POST', body: JSON.stringify({}) },
  )
  return {
    roundId: raw.round_id,
    roundNumber: raw.round_number,
    roundEndsAt: raw.round_ends_at,
    roundTimeLimitSeconds: raw.round_time_limit_seconds,
  }
}

export async function submitMatchThrow(
  matchId: string,
  roundId: string,
  input: string,
): Promise<void> {
  await request(`/matches/${matchId}/rounds/${roundId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ input }),
  })
}

export async function endMatch(matchId: string): Promise<void> {
  await request(`/matches/${matchId}/end`, { method: 'POST', body: JSON.stringify({}) })
}

export async function requestRematch(
  matchId: string,
): Promise<{ status: 'waiting' | 'matched'; matchId: string }> {
  const raw = await request<{ status: 'waiting' | 'matched'; match_id: string }>(
    `/matches/${matchId}/rematch`,
    { method: 'POST', body: JSON.stringify({}) },
  )
  return { status: raw.status, matchId: raw.match_id }
}

export async function declineRematch(matchId: string): Promise<void> {
  await request(`/matches/${matchId}/rematch/decline`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function createPrivateLobby(): Promise<{ inviteCode: string }> {
  const raw = await request<{ invite_code: string }>('/matchmaking/private', {
    method: 'POST',
    body: JSON.stringify({}),
  })
  return { inviteCode: raw.invite_code }
}

export async function joinPrivateLobby(
  inviteCode: string,
): Promise<{ status: string; matchId?: string }> {
  const raw = await request<{ status: string; match_id?: string }>(
    '/matchmaking/private/join',
    {
      method: 'POST',
      body: JSON.stringify({ invite_code: inviteCode }),
    },
  )
  return { status: raw.status, matchId: raw.match_id }
}

export async function cancelPrivateLobby(): Promise<void> {
  await request('/matchmaking/private', { method: 'DELETE' })
}

export async function pingHealth(): Promise<boolean> {
  try {
    await request('/health', { method: 'GET' }, false)
    return true
  } catch {
    return false
  }
}
