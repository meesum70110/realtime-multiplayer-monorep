import type { CSSProperties } from 'react'

export type Phase = 'menu' | 'searching' | 'intro' | 'banner' | 'typing' | 'clash' | 'end'
export type Outcome = '' | 'you' | 'opp' | 'tie' | 'timeout'
export type RoundOutcome = 'you' | 'opp' | 'tie'
export type ClashStep = 'break' | 'verdict'
export type SearchStep = 'searching' | 'found'
export type OverlayKind = null | 'howto' | 'settings' | 'invite' | 'tutorialConfirm' | 'profileSettings'
export type ProfileView = null | 'you' | 'opp' | 'friend'
export type ClashAnim = 'rush' | 'sky' | 'cyclone' | 'upper'
export type DieAnim = 'launch' | 'drop' | 'spin' | 'blast'
export type MorphSym =
  | 'q'
  | 'fire'
  | 'drop'
  | 'leaf'
  | 'zap'
  | 'star'
  | 'heart'
  | 'moon'
  | 'crown'
  | 'gem'
  | 'skull'

export type Country = readonly [flag: string, name: string]

export interface ChatMsg {
  id: number
  from: 'you' | 'bot'
  text: string
}

export interface Friend {
  name: string
  handle: string
  flag: string
  country: string
  online: boolean
  color: string
  matches: string
  wr: string
  fav: string
}

export interface TopWord {
  word: string
  emoji: string
  plays: string
  wr: string
  wrBg: string
  wrC: string
}

/** A live "clash feed" ticker item shown on the menu (not a played match). */
export interface Clash {
  id: number
  wEmoji: string
  wWord: string
  lEmoji: string
  lWord: string
}

export interface HistoryEntry {
  round: number
  you: string
  opp: string
  outcome: RoundOutcome
}

export interface Shard {
  style: CSSProperties
}

export interface Burst {
  emoji: string
  style: CSSProperties
}

export interface PaneLine {
  t0: number
  pts: string
  style: { opacity: number; strokeWidth: number }
}

export interface PaneFacet {
  clip: string
  bg: string
  tx: string
  ty: string
  rot: string
  dur: string
  delay: string
}

export interface PaneFrag {
  x: number
  y: number
  s: number
  clip: string
  dl: string
  tx: string
  ty: string
  rot: string
}

export interface Pane {
  outline: string
  outlineClip: string
  crack: string
  lines: PaneLine[]
  facets: PaneFacet[]
  frags: PaneFrag[]
}

export interface Confetti {
  emoji: string
  style: CSSProperties
}

export interface CoachRect {
  x: number
  y: number
  w: number
  h: number
}

export interface State {
  phase: Phase
  round: number
  count: number
  searchStep: SearchStep
  matchCount: number
  playersOnline: number
  youCountry: Country
  oppCountry: Country
  soundOn: boolean
  musicOn: boolean
  panicPref: boolean
  showExitConfirm: boolean
  invitedFriends: string[]
  chatOpen: boolean
  chatMsgs: ChatMsg[]
  chatUnread: number
  chatToast: string | null
  profileView: ProfileView
  profileFriend: Friend | null
  profileNotice: string
  playerName: string
  playerCountry: Country
  nameDraft: string
  clashes: Clash[]
  flashId: number | null
  overlay: OverlayKind
  howStep: number
  tutorMode: boolean
  coachStep: number
  coachRect: CoachRect | null
  youScore: number
  oppScore: number
  chantDone: boolean
  secondsLeft: number
  input: string
  error: string
  crackLevel: number
  crackTick: number
  youLocked: boolean
  oppLocked: boolean
  oppDots: number
  yourWord: string
  oppWord: string
  verdictCount: number
  outcome: Outcome
  headline: string
  flavor: string
  clashStep: ClashStep
  shards: Shard[]
  barShards: Shard[]
  burst: Burst[]
  clashWord: string
  clashAnim: ClashAnim
  dieAnim: DieAnim
  history: HistoryEntry[]
  suggestions: string[]
  confetti: Confetti[] | null
  pane: Pane
  morphSym: MorphSym
  morphK: number
  inviteCopied: boolean
}

/** Placeholder contract — replaced with the full view-model shape in Task 7 (engine/view.ts). */
export type ViewModel = Record<string, never>
