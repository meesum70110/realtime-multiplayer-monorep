import type { CSSProperties, ChangeEvent, KeyboardEvent, MouseEvent } from 'react'

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
  /** Display name for the current opponent (human, ghost, or DOOM_BOT). */
  oppName: string
  oppHandle: string
  /** How the active match is driven — offline bot, live server, or silent ghost bot. */
  matchMode: 'offline' | 'online' | 'ghost'
  /** True when the opponent disconnected / rage-quit mid-match. */
  forfeitWin: boolean
  rematchWaiting: boolean
  rematchNotice: string
  privateInviteCode: string
  privateJoinDraft: string
  privateError: string
  /** True for Play-with-a-Friend matches (free-form chat); false for public queue. */
  isPrivateMatch: boolean
  /** Draft text for private free-form match chat. */
  chatDraft: string
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
  yourThrow: string
  oppThrow: string
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

// ---- view-model row/item shapes (produced by engine/view.ts buildView) ----

/** A style-only wrapper used for particle/shard/facet/fragment lists. */
export interface StyleItem {
  style: CSSProperties
}

export interface TopWordView extends TopWord {
  rank: number
  badgeStyle: CSSProperties
  wrStyle: CSSProperties
}

export interface ClashView extends Clash {
  ago: string
  rowStyle: CSSProperties
}

export interface SettingsRowView {
  label: string
  desc: string
  toggle: () => void
  trackStyle: CSSProperties
  knobStyle: CSSProperties
}

export interface FriendListItem {
  name: string
  country: string
  initial: string
  invited: boolean
  notInvited: boolean
  onInvite: (e?: MouseEvent) => void
  onOpen: () => void
  avatarStyle: CSSProperties
  dotStyle: CSSProperties
  statusLabel: string
}

export interface DotView {
  w: string
  color: string
}

export interface ProfileStat {
  label: string
  value: string
}

export interface CountryOption {
  flag: string
  name: string
  selStyle: CSSProperties
  pick: () => void
}

export interface ChatBubble {
  text: string
  rowStyle: CSSProperties
  bubbleStyle: CSSProperties
}

export interface QuickChatView {
  text: string
  emoji: string
  send: () => void
}

export interface SuggestionView {
  word: string
  emoji: string
  pick: () => void
}

export interface UsedChipView {
  emoji: string
  word: string
  wordShort: string
  wordStyle: CSSProperties
  style: CSSProperties
  markStyle: CSSProperties
  mark: string
}

export interface PaneLineView {
  pts: string
  style: { opacity: number; strokeWidth: number }
}

export interface HeadlineWord {
  text: string
  style: CSSProperties
}

export interface AnyLetter {
  ch: string
  style: CSSProperties
}

export interface HistoryRow {
  label: string
  you: string
  opp: string
  youEmoji: string
  oppEmoji: string
  resultMark: string
  resultChipStyle: CSSProperties
  youStyle: CSSProperties
  oppStyle: CSSProperties
}

/** The complete render contract consumed by the screen/overlay components. Every
 *  key is plain data (styles, strings, numbers, booleans) or an event handler —
 *  no React elements live here (Ruleset #6). Produced by `buildView(engine)`. */
export interface ViewModel {
  // shared battle-card chrome
  cardTex: CSSProperties
  cardGloss: CSSProperties
  cardTab: CSSProperties
  cardMedal: CSSProperties
  cardPlate: CSSProperties
  cardSpark: CSSProperties
  cardBackYou: CSSProperties
  cardBackOpp: CSSProperties
  cardBackPat: CSSProperties
  lockedBackYou: CSSProperties
  lockedBackOpp: CSSProperties

  // menu morph logo (plain data, rendered by <MorphIcon/>)
  morphSym: MorphSym
  morphColor: string
  morphInk: string
  morphK: number

  inGame: boolean
  showMenu: boolean
  champ: TopWord
  topRest: TopWordView[]
  clashes: ClashView[]
  showSearching: boolean
  searchIsSearching: boolean
  searchIsFound: boolean
  playersOnline: string
  onFindMatch: () => void
  onCancelSearch: () => void
  showHowTo: boolean
  showSettings: boolean
  showInvite: boolean
  onOpenSettings: () => void
  onOpenInvite: () => void
  settingsRows: SettingsRowView[]
  privateInviteCode: string
  privateJoinDraft: string
  privateError: string
  privateIsHosting: boolean
  onPrivateJoinDraft: (e: ChangeEvent<HTMLInputElement>) => void
  onCreatePrivateLobby: () => void
  onJoinPrivateLobby: () => void
  onCancelPrivateLobby: () => void
  onCopyPrivateCode: () => void
  showTutorialConfirm: boolean
  stopProp: (e: MouseEvent) => void
  onHowToPlay: () => void
  onTutorial: () => void
  onCloseOverlay: () => void
  onStartTutorial: () => void

  // how-to overlay
  howStepLabel: string
  howEmoji: string
  howTitle: string
  howBody: string
  howEmojiWrapStyle: CSSProperties
  howNextLabel: string
  howDots: DotView[]
  howBackStyle: CSSProperties
  onHowBack: () => void
  onHowNext: () => void
  onSwitchToTutorial: () => void

  // coach-mark tutorial
  coachActive: boolean
  coachRingStyle: CSSProperties
  coachBubbleStyle: CSSProperties
  coachNum: number
  coachTotal: number
  coachTitle: string | undefined
  coachText: string | undefined
  coachCta: string | undefined
  coachCtaStyle: CSSProperties
  coachDots: DotView[]
  coachShowCta: boolean
  coachShowWait: boolean
  coachWaitLabel: string
  coachHint: string
  coachShowHint: boolean
  onCoachNext: () => void
  onCoachSkip: () => void

  onMenu: () => void
  onExit: () => void
  showExitConfirm: boolean
  onExitConfirm: () => void
  onExitCancel: () => void
  soundOn: boolean
  soundOff: boolean
  onToggleSound: () => void

  // match chat
  showChat: boolean
  chatOpen: boolean
  chatHasUnread: boolean
  chatUnread: string
  chatEmpty: boolean
  onToggleChat: () => void
  chatToast: string
  chatShowToast: boolean
  chatFabStyle: CSSProperties
  /** Private friend matches use a text input; public queue keeps quick emotes. */
  chatIsFreeForm: boolean
  chatDraft: string
  chatDraftMaxLength: number
  onChatDraft: (e: ChangeEvent<HTMLInputElement>) => void
  onSendChatDraft: () => void
  chatEmptyHint: string

  // profile modal
  showProfile: boolean
  profileIsYou: boolean
  profileIsBot: boolean
  profileIsFriend: boolean
  profileNotYou: boolean
  profileName: string
  profileHandle: string
  profileFlag: string
  profileCountry: string
  profileTag: string
  profileTagStyle: CSSProperties
  profileRingStyle: CSSProperties
  profileStats: ProfileStat[]
  profileNotice: string
  profileHasNotice: boolean
  onCloseProfile: () => void
  onProfileYou: () => void
  onProfileOpp: () => void
  onProfileFriend: () => void
  onProfileReport: () => void
  onProfileBlock: () => void
  onProfileShare: () => void
  onProfileSettings: () => void

  // profile settings
  showProfileSettings: boolean
  nameDraft: string
  onNameDraft: (e: ChangeEvent<HTMLInputElement>) => void
  nameDraftRef: (el: HTMLInputElement | null) => void
  onSaveProfile: () => void
  onOpenGameSettings: () => void
  playerName: string
  /** Always-available @handle for the local player (menu chip, etc.). */
  playerHandle: string
  countryOptions: CountryOption[]

  chatScrollRef: (el: HTMLDivElement | null) => void
  chatList: ChatBubble[]
  quickChats: QuickChatView[]

  // phase flags
  showIntro: boolean
  showBanner: boolean
  showTyping: boolean
  showClash: boolean
  showEnd: boolean

  // matchmaking / face-off
  youFlag: string
  youCountryName: string
  oppFlag: string
  oppCountryName: string
  oppName: string
  oppHandle: string
  showMatchCount: boolean
  matchCount: number
  matchCountStyle: CSSProperties

  // scoreboard / banner
  roundLabel: string
  formatLabel: string
  bannerTitle: string
  bannerTag: string
  showBannerCount: boolean
  bc3: boolean
  bc2: boolean
  bc1: boolean
  beatRock: boolean
  beatPaper: boolean
  beatScissors: boolean
  beatAnything: boolean
  anyLetters: AnyLetter[]

  // timer
  secondsLeft: number
  ringColor: string
  ringOffset: number
  timerWrapStyle: CSSProperties
  timerNumStyle: CSSProperties
  panicOn: boolean

  bgMenuStyle: CSSProperties
  bgArenaStyle: CSSProperties

  youPips: StyleItem[]
  oppPips: StyleItem[]
  youUsed: UsedChipView[]
  oppUsed: UsedChipView[]
  qYouSm: CSSProperties
  qOppSm: CSSProperties
  previewCardStyle: CSSProperties

  // typing-phase glass barrier
  paneWrapStyle: CSSProperties
  crackFlashOn: boolean
  crackTick: number
  crackFlashStyle: CSSProperties
  paneOverlayStyle: CSSProperties
  paneOutlinePts: string
  paneCrackPts: string
  paneLines: PaneLineView[]
  paneFacetsStatic: StyleItem[]
  paneFragsStatic: StyleItem[]
  paneFrostStyle: CSSProperties
  paneFrostBreakStyle: CSSProperties
  paneGlintClipStyle: CSSProperties
  paneGlintStyle: CSSProperties

  oppHalfStyle: CSSProperties
  oppModeSil: boolean
  oppModeCardBack: boolean
  oppModeDots: boolean
  oppModeTypingPill: boolean
  oppDots: string

  input: string
  onInput: (e: ChangeEvent<HTMLInputElement>) => void
  onKey: (e: KeyboardEvent) => void
  onSubmit: () => void
  inputRef: (el: HTMLInputElement | null) => void
  inputShakeStyle: CSSProperties
  hasError: boolean
  error: string
  suggestions: SuggestionView[]

  liveEmoji: string
  liveEmojiStyle: CSSProperties
  forgeWord: string
  forgeWordStyle: CSSProperties

  youLocked: boolean
  youUnlocked: boolean
  oppTyping: boolean
  oppLockedFlag: boolean

  // clash sequence
  clashStageStyle: CSSProperties
  clashWord: string
  streakLStyle: CSSProperties
  streakRStyle: CSSProperties
  barrierBreaking: boolean
  paneWrapBreakStyle: CSSProperties
  paneOverlayBreakStyle: CSSProperties
  paneFacetsBreak: StyleItem[]
  paneFragsBreak: StyleItem[]
  barShards: Shard[]
  verdictShown: boolean
  showVerdictCount: boolean
  verdictNextLabel: string
  verdictCount: number
  verdictCountStyle: CSSProperties
  yourClashWrapStyle: CSSProperties
  oppClashWrapStyle: CSSProperties
  yourBraceStyle: CSSProperties
  oppBraceStyle: CSSProperties
  yourFlipStyle: CSSProperties
  oppFlipStyle: CSSProperties
  yourFaceStyle: CSSProperties
  oppFaceStyle: CSSProperties
  shards: Shard[]
  yourWord: string
  oppWord: string
  yourEmoji: string
  oppEmoji: string
  yourWordStyle: CSSProperties
  oppWordStyle: CSSProperties
  notTie: boolean
  headlineWords: HeadlineWord[]
  flavor: string
  burst: Burst[]
  verdictBadge: string
  verdictBadgeStyle: CSSProperties

  // end screen
  endMedalEmoji: string
  endMedalStyle: CSSProperties
  endTitle: string
  endTitleStyle: CSSProperties
  endSub: string
  /** Scoreboard rival label on the end screen (`Bot` offline/ghost, real name online). */
  endOppLabel: string
  rematchWaiting: boolean
  rematchNotice: string
  rematchButtonLabel: string
  youScore: number
  oppScore: number
  confetti: Confetti[]
  history: HistoryRow[]
  onRematch: () => void
}
