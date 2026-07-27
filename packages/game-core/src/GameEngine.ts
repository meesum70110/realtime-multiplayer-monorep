import type { CSSProperties } from 'react'
import { AudioEngine } from './audio'
import {
  BOT_THROWS,
  COUNTRIES,
  DEFAULT_PROPS,
  GHOST_OPPONENTS,
  GHOST_QUEUE_MS,
  IDEAS,
} from './constants'
import type {
  BattleResolvedInfo,
  ChatMessageInfo,
  MatchCompletedInfo,
  MatchForfeitedInfo,
  MatchFoundInfo,
  MatchMode,
  MatchTransport,
  NextRoundInfo,
  PlayerSide,
} from './transport'
import {
  makeBarrierPane,
  makeBarrierShards,
  makeBurst,
  makeShards,
} from './geometry'
import { emojiFor, resolveThrow } from './throws'
import { rand } from './random'
import type {
  Clash,
  ClashAnim,
  Country,
  DieAnim,
  Friend,
  MorphSym,
  OverlayKind,
  ProfileView,
  RoundOutcome,
  State,
  UsedChipView,
} from './types'

/** One step of the coached-tutorial script. The `hidden` step (index 3) has no
 *  selector/copy — the player just watches the round with no veil. */
interface CoachStep {
  sel?: string
  place?: 'top' | 'bottom' | 'left' | 'right'
  num?: number
  gate?: string
  title?: string
  text?: string
  cta?: string
  wait?: string
  hidden?: boolean
}

const INITIAL_STATE: State = {
  phase: 'menu',
  round: 1,
  count: 0,
  searchStep: 'searching',
  matchCount: 0,
  playersOnline: 1024,
  youCountry: ['🇺🇸', 'USA'] as const,
  oppCountry: ['🇯🇵', 'Japan'] as const,
  soundOn: true,
  musicOn: true,
  panicPref: true,
  showExitConfirm: false,
  invitedFriends: [],
  chatOpen: false,
  chatMsgs: [],
  chatUnread: 0,
  chatToast: null,
  profileView: null,
  profileFriend: null,
  profileNotice: '',
  playerName: 'GUEST_123',
  playerCountry: ['🇺🇸', 'USA'] as const,
  oppName: 'DOOM_BOT',
  oppHandle: '@doom_bot',
  matchMode: 'offline',
  forfeitWin: false,
  rematchWaiting: false,
  rematchNotice: '',
  privateInviteCode: '',
  privateJoinDraft: '',
  privateError: '',
  isPrivateMatch: false,
  chatDraft: '',
  nameDraft: '',
  clashes: [],
  flashId: null,
  overlay: null,
  howStep: 0,
  tutorMode: false,
  coachStep: 0,
  coachRect: null,
  youScore: 0,
  oppScore: 0,
  chantDone: false,
  secondsLeft: 20,
  input: '',
  error: '',
  crackLevel: 0.14,
  crackTick: 0,
  youLocked: false,
  oppLocked: false,
  oppDots: 3,
  yourThrow: '',
  oppThrow: '',
  verdictCount: 0,
  outcome: '',
  headline: '',
  flavor: '',
  clashStep: 'break',
  shards: [],
  barShards: [],
  burst: [],
  clashWord: 'BOOM!',
  clashAnim: 'rush',
  dieAnim: 'launch',
  history: [],
  suggestions: [],
  confetti: null,
  pane: makeBarrierPane(),
  morphSym: 'q',
  morphK: 0,
  inviteCopied: false,
}

/** Framework-agnostic game core: state, the phase state machine, timers, animation
 *  sequencing and the audio bridge — ported method-for-method from the design's logic
 *  class (lines 1201–2340). `this.props.X` reads become `DEFAULT_PROPS.X`; sfx/music
 *  route through `this.audio`; throw/geometry logic comes from the pure modules. */
export class GameEngine {
  state: State = INITIAL_STATE

  private readonly listeners = new Set<() => void>()
  private timeouts: number[] = []
  private interval: number | null = null
  private readonly audio = new AudioEngine()

  private deadline = 0
  private lastWhole = 0
  private tickRAF: number | null = null
  private morphTimer: number | null = null
  private clashTimer: number | null = null
  private coachRAF: number | null = null
  private clashId = 0
  private chatId = 0
  private chatToastId = 0
  private inviteCodeValue = ''
  private chatScroll: HTMLDivElement | null = null
  private lastClashAnim: ClashAnim | null = null
  private lastDieAnim: DieAnim | null = null

  private transport: MatchTransport | null = null
  private queueEntryId: string | null = null
  private activeMatchId: string | null = null
  private activeRoundId: string | null = null
  private roundEndsAt: string | null = null
  private ghostTimer: number | null = null
  private unsubMatchFound: (() => void) | null = null
  private onlineUnsubs: Array<() => void> = []
  /** Bumps on every findMatch/cancel so in-flight async queue calls are ignored. */
  private searchEpoch = 0
  /** Latches so socket + REST instant-match can't double-start the face-off. */
  private matchAccepted = false
  /** Latches private lobby create/join so match_found can mark isPrivateMatch. */
  private privateMatchPending = false
  private selfUserId: string | null = null
  private playerSide: PlayerSide | null = null
  private serverRoundLimit: number = DEFAULT_PROPS.timerSeconds
  private useWallClock = false
  private pendingNextRound: NextRoundInfo | null = null
  private matchCompletedInfo: MatchCompletedInfo | null = null
  private scoresFromServer = false
  private onlineClockArmed = false
  private submittingOnline = false
  /** Offline/ghost AI judge result waiting to be consumed by beginClash. */
  private pendingAiVerdict: { outcome: RoundOutcome; headline: string; flavor: string } | null =
    null
  private aiJudging = false

  private readonly morphPool: MorphSym[] = [
    'fire',
    'drop',
    'leaf',
    'zap',
    'star',
    'heart',
    'moon',
    'crown',
    'gem',
    'skull',
  ]
  private morphQueue: MorphSym[] = []
  private morphCount = 0

  private readonly morphPalette: Record<MorphSym, { bg: string; ink: string }> = {
    q: { bg: '#fffdfa', ink: '#22242a' },
    fire: { bg: '#ff8c42', ink: '#8a3300' },
    drop: { bg: '#4aa8ff', ink: '#0a3f7a' },
    leaf: { bg: '#57c94f', ink: '#1c5c1a' },
    zap: { bg: '#8b5cf6', ink: '#3a1c78' },
    star: { bg: '#ffb020', ink: '#7a4a00' },
    heart: { bg: '#ff5db1', ink: '#7a1249' },
    moon: { bg: '#6c7bff', ink: '#26307a' },
    crown: { bg: '#ffb020', ink: '#7a4a00' },
    gem: { bg: '#3fd0d8', ink: '#0a5257' },
    skull: { bg: '#c05cff', ink: '#521278' },
  }

  private readonly CLASH_POOL: readonly (readonly [string, string, string, string])[] = [
    ['🌋', 'Lava', '🧊', 'Ice'],
    ['🐉', 'Dragon', '🛡️', 'Shield'],
    ['☕', 'Coffee', '😴', 'Monday'],
    ['🌊', 'Tsunami', '🏰', 'Sandcastle'],
    ['🕳️', 'Void', '☀️', 'Sun'],
    ['🦠', 'Virus', '💊', 'Cure'],
    ['⚡', 'Lightning', '🌳', 'Oak'],
    ['🧲', 'Magnet', '🔩', 'Bolt'],
    ['💡', 'Idea', '🧱', 'Wall'],
    ['🌪️', 'Tornado', '🏠', 'House'],
    ['❤️', 'Love', '💰', 'Money'],
    ['🔥', 'Fire', '📜', 'Paper'],
    ['⏰', 'Time', '👑', 'King'],
    ['🌙', 'Moon', '🐺', 'Wolf'],
    ['🍋', 'Lemon', '🦈', 'Shark'],
  ]

  private readonly HOW_STEPS = [
    {
      emoji: '🧠',
      tint: 'rgba(255,107,87,0.14)',
      title: 'Any word is a throw',
      body: 'Forget rock, paper, scissors. Type literally anything — an object, an animal, a force of nature, even an abstract idea like “gravity” or “Monday”.',
    },
    {
      emoji: '🔒',
      tint: 'rgba(238,181,47,0.16)',
      title: 'Lock it in before the clock',
      body: 'Hit Enter or the GO button to commit your throw. Your opponent picks one at the same time — in secret — so bluff wisely.',
    },
    {
      emoji: '⚖️',
      tint: 'rgba(87,201,79,0.16)',
      title: 'The AI referee decides',
      body: 'Both words flip face-up and an AI judge declares a winner with real reasoning — plus a savage roast for whoever got outplayed.',
    },
    {
      emoji: '🏆',
      tint: 'rgba(139,108,242,0.16)',
      title: 'First to 2 takes the match',
      body: 'Win a round, score a point. Two points wins it — best of 3. Stay creative, keep the pressure on, and prove anything can win.',
    },
  ]

  private readonly COACH: CoachStep[] = [
    {
      sel: '[data-tut="input"]',
      place: 'bottom',
      num: 1,
      gate: 'typed',
      title: 'Type your throw',
      text: 'This is your battle box. Type any word you like — an object, an animal, even an idea. Anything can win!',
      cta: 'Next',
    },
    {
      sel: '[data-tut="ideas"]',
      place: 'bottom',
      num: 2,
      title: 'Grab a quick idea',
      text: 'Out of inspiration? Tap any suggestion to autofill it — or keep the word you already typed.',
      cta: 'Next',
    },
    {
      sel: '[data-tut="go"]',
      place: 'left',
      num: 3,
      title: 'Lock it in',
      text: 'Happy with your throw? Press GO (or hit Enter) to commit it and start the clash.',
      wait: 'Press GO to lock in',
    },
    { hidden: true },
    {
      sel: '[data-tut="score"]',
      place: 'bottom',
      num: 4,
      title: 'The verdict is in',
      text: "Both throws clashed and the AI referee crowned a winner — the score updates up here. First to 2 rounds takes the match. That's it — you're ready!",
      cta: 'Finish',
    },
  ]

  readonly QUICK_CHATS = [
    { text: 'GG', emoji: '🤝' },
    { text: 'Nice!', emoji: '🔥' },
    { text: 'Too easy', emoji: '😎' },
    { text: 'Lucky…', emoji: '😤' },
    { text: 'Haha', emoji: '😂' },
    { text: 'Clutch!', emoji: '⚡' },
    { text: 'Watch this', emoji: '👀' },
    { text: 'Rematch?', emoji: '🔁' },
  ]

  private readonly BOT_GREETINGS = [
    'Fresh meat. 🤖',
    'Hope you brought a good word. 😏',
    'DOOM_BOT online. Prepare to lose. 🤖',
  ]
  private readonly BOT_WIN = [
    'Calculated. 🤖',
    'Was that your best? 😴',
    'Too easy. Beep boop.',
    'Skill issue detected. 📉',
  ]
  private readonly BOT_LOSE = [
    'Lucky RNG. 😑',
    'Recalculating… 🤨',
    'Enjoy it while it lasts.',
    'Error: you scored. 🐛',
  ]
  private readonly BOT_TIE = ['A draw? How dull. 🤝', 'Deadlock. Again.', 'We meet in the middle. 🤖']
  private readonly BOT_REPLIES = ['Cute. 🤖', 'lol', 'We’ll see. 😏', 'Beep boop.', 'Noted. 🤨', 'Bold words.']

  // ---- observable base ----
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  getState = (): State => this.state

  setState(patch: Partial<State> | ((s: State) => Partial<State>)): void {
    const p = typeof patch === 'function' ? patch(this.state) : patch
    this.state = { ...this.state, ...p }
    const mode: 'menu' | 'battle' =
      this.state.phase === 'menu' || this.state.phase === 'searching' ? 'menu' : 'battle'
    this.audio.setMusicMode(mode)
    this.listeners.forEach((l) => l())
  }

  private t(fn: () => void, ms: number): void {
    this.timeouts.push(window.setTimeout(fn, ms))
  }

  // ---- lifecycle ----
  mount(): void {
    let soundOn = true,
      musicOn = true,
      panicPref = true
    try {
      soundOn = localStorage.getItem('rpa-sound-on') !== '0'
      musicOn = localStorage.getItem('rpa-music-on') !== '0'
      panicPref = localStorage.getItem('rpa-panic-on') !== '0'
    } catch {
      /* localStorage unavailable */
    }
    this.audio.setEnabled(soundOn, musicOn)
    this.setState({
      soundOn,
      musicOn,
      panicPref,
      // Keep live presence from boot/socket; only mock when fully offline.
      playersOnline: this.transport
        ? this.state.playersOnline
        : 940 + Math.floor(Math.random() * 300),
    })
    this.morphTimer = window.setInterval(() => this.morphTick(), 1150)
    this.clashId = 0
    this.chatId = 0
    const seed: Clash[] = []
    for (let k = 0; k < 5; k++) seed.push(this.makeClash(seed[seed.length - 1] ?? null))
    this.setState({ clashes: seed })
    this.clashTimer = window.setInterval(() => this.pushClash(), 3200)
    this.coachRAF = requestAnimationFrame(this.coachMeasure)
  }

  unmount(): void {
    this.clearAll()
    this.audio.dispose()
    if (this.morphTimer) clearInterval(this.morphTimer)
    if (this.clashTimer) clearInterval(this.clashTimer)
    if (this.coachRAF) cancelAnimationFrame(this.coachRAF)
  }

  private clearAll(): void {
    this.timeouts.forEach(clearTimeout)
    this.timeouts = []
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    if (this.tickRAF) {
      cancelAnimationFrame(this.tickRAF)
      this.tickRAF = null
    }
    this.clearGhostTimer()
  }

  private clearGhostTimer(): void {
    if (this.ghostTimer !== null) {
      clearTimeout(this.ghostTimer)
      this.ghostTimer = null
    }
  }

  private clearMatchFoundSub(): void {
    if (this.unsubMatchFound) {
      this.unsubMatchFound()
      this.unsubMatchFound = null
    }
  }

  /** Injected by the app shell after guest auth + socket connect. Null = pure offline bot. */
  setTransport(transport: MatchTransport | null): void {
    this.clearMatchFoundSub()
    this.clearOnlineSubs()
    this.transport = transport
    if (transport) this.bindOnlineTransport(transport)
  }

  setPlayerIdentity(displayName: string, userId?: string): void {
    const name = displayName.trim() || this.state.playerName
    if (userId) this.selfUserId = userId
    this.setState({ playerName: name })
  }

  private clearOnlineSubs(): void {
    for (const unsub of this.onlineUnsubs) unsub()
    this.onlineUnsubs = []
  }

  private bindOnlineTransport(transport: MatchTransport): void {
    this.onlineUnsubs.push(
      transport.onMatchFound((info) => {
        void this.handleOnlineMatchFound(info, this.searchEpoch)
      }),
      transport.onPresenceUpdated((n) => {
        if (n > 0) this.setState({ playersOnline: n })
      }),
      transport.onRoundStarted((info) => {
        if (!this.isOnlineMatch()) return
        if (this.activeRoundId && info.roundId !== this.activeRoundId) return
        this.applyRoundClock(info.roundEndsAt, info.roundTimeLimitSeconds)
        if (this.state.phase === 'typing' && !this.tickRAF) {
          this.startTypingEngine()
        }
      }),
      transport.onOpponentSubmitted((info) => {
        if (!this.isOnlineMatch()) return
        if (info.roundId !== this.activeRoundId) return
        if (this.state.phase !== 'typing' || this.state.oppLocked) return
        this.audio.sfx('oppLock')
        this.audio.sfx('crack')
        this.setState((s) => ({
          oppLocked: true,
          crackLevel: Math.min(0.92, s.crackLevel + 0.2),
        }))
      }),
      transport.onBattleResolved((info) => {
        this.handleBattleResolved(info)
      }),
      transport.onNextRoundStarted((info) => {
        if (!this.isOnlineMatch()) return
        this.pendingNextRound = info
      }),
      transport.onMatchCompleted((info) => {
        if (!this.isOnlineMatch()) return
        this.matchCompletedInfo = info
      }),
      transport.onMatchForfeited((info) => {
        this.handleMatchForfeited(info)
      }),
      transport.onRematchRequested(() => {
        if (this.state.phase !== 'end') return
        this.setState({
          rematchNotice: this.state.oppName + ' wants a rematch!',
        })
      }),
      transport.onRematchDeclined(() => {
        if (this.state.phase !== 'end') return
        this.setState({
          rematchWaiting: false,
          rematchNotice: 'Opponent declined the rematch',
        })
        this.audio.sfx('error')
        this.t(() => this.toMenu(), 1400)
      }),
      transport.onChatMessage((info) => {
        this.handleRemoteChatMessage(info)
      }),
    )
  }

  private handleMatchForfeited(info: MatchForfeitedInfo): void {
    if (!this.selfUserId || info.winnerUserId !== this.selfUserId) return
    if (this.state.phase === 'end' || this.state.phase === 'menu') return

    this.matchCompletedInfo = {
      matchId: info.matchId,
      winnerUserId: info.winnerUserId,
      finalScore: info.finalScore,
    }
    this.activeMatchId = info.matchId
    const youAreP1 = this.playerSide === 'player_1'
    this.setState({
      forfeitWin: true,
      rematchWaiting: false,
      rematchNotice: '',
      youScore: youAreP1 ? info.finalScore.player1 : info.finalScore.player2,
      oppScore: youAreP1 ? info.finalScore.player2 : info.finalScore.player1,
      showExitConfirm: false,
    })
    this.endMatch()
  }

  private isOnlineMatch(): boolean {
    return this.state.matchMode === 'online' && !!this.transport && !!this.activeMatchId
  }

  private applyRoundClock(endsAt: string, limitSeconds: number): void {
    this.roundEndsAt = endsAt
    this.serverRoundLimit = Math.max(6, Math.min(60, limitSeconds))
    this.useWallClock = true
    this.onlineClockArmed = true
  }

  getMatchMode(): MatchMode {
    return this.state.matchMode
  }

  getActiveMatchId(): string | null {
    return this.activeMatchId
  }

  getActiveRoundId(): string | null {
    return this.activeRoundId
  }

  getRoundEndsAt(): string | null {
    return this.roundEndsAt
  }

  // ---- menu morph logo ----
  private morphTick(): void {
    if (this.state.phase !== 'menu') return
    let next: MorphSym
    if (this.morphCount >= 6) {
      next = 'q'
      this.morphCount = 0
      this.morphQueue = []
    } else {
      if (!this.morphQueue.length) this.morphQueue = [...this.morphPool].sort(() => Math.random() - 0.5)
      next = this.morphQueue.pop() ?? 'q'
      this.morphCount++
    }
    this.setState((s) => ({ morphSym: next, morphK: (s.morphK || 0) + 1 }))
  }

  morphColor(sym: MorphSym): string {
    return (this.morphPalette[sym] || this.morphPalette.star).bg
  }
  morphInk(sym: MorphSym): string {
    return (this.morphPalette[sym] || this.morphPalette.star).ink
  }

  // ---- settings, sound & invites ----
  toggleSound(): void {
    const v = !this.state.soundOn
    this.audio.setEnabled(v, this.state.musicOn)
    this.setState({ soundOn: v })
    if (v) this.audio.sfx('click')
    try {
      localStorage.setItem('rpa-sound-on', v ? '1' : '0')
    } catch {
      /* localStorage unavailable */
    }
  }

  setSetting(key: 'musicOn' | 'panicPref', keyLS: string, val: boolean): void {
    if (key === 'musicOn') this.audio.setEnabled(this.state.soundOn, val)
    this.setState({ [key]: val } as Partial<State>)
    if (this.state.soundOn) this.audio.sfx('click')
    try {
      localStorage.setItem(keyLS, val ? '1' : '0')
    } catch {
      /* localStorage unavailable */
    }
  }

  inviteFriend(name: string): void {
    this.audio.sfx('lock')
    this.setState((s) => ({
      invitedFriends: s.invitedFriends.includes(name)
        ? s.invitedFriends
        : [...s.invitedFriends, name],
    }))
  }

  copyInvite(): void {
    this.audio.sfx('click')
    try {
      if (navigator.clipboard) void navigator.clipboard.writeText('rps.gg/join/' + this.inviteCode())
    } catch {
      /* clipboard unavailable */
    }
    this.setState({ inviteCopied: true })
    this.t(() => this.setState({ inviteCopied: false }), 2000)
  }

  inviteCode(): string {
    if (!this.inviteCodeValue) {
      this.inviteCodeValue = Array.from(
        { length: 5 },
        () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)],
      ).join('')
    }
    return this.inviteCodeValue
  }

  // ---- match chat ----
  private static readonly CHAT_TEXT_MAX = 50

  private addChat(from: 'you' | 'bot', text: string): void {
    this.setState((s) => ({
      chatMsgs: [...s.chatMsgs, { id: ++this.chatId, from, text }].slice(-40),
      chatUnread: from === 'bot' && !s.chatOpen ? s.chatUnread + 1 : s.chatUnread,
    }))
    this.scrollChat()
  }

  sendChat(text: string): void {
    const trimmed = text.replace(/\s+/g, ' ').trim().slice(0, GameEngine.CHAT_TEXT_MAX)
    if (!trimmed) return

    this.audio.sfx('click')
    this.addChat('you', trimmed)

    // Live match: relay to the opponent via Socket.IO (no local bot reply).
    if (this.state.matchMode === 'online' && this.transport && this.activeMatchId) {
      this.transport.sendChatMessage(this.activeMatchId, trimmed)
      return
    }

    // Offline / ghost: keep the classic simulated opponent reply.
    if (Math.random() < 0.55)
      this.t(() => this.botChat(rand(this.BOT_REPLIES)), 900 + Math.random() * 1000)
  }

  setChatDraft(value: string): void {
    this.setState({ chatDraft: value.slice(0, GameEngine.CHAT_TEXT_MAX) })
  }

  sendChatDraft(): void {
    const draft = this.state.chatDraft
    this.setState({ chatDraft: '' })
    this.sendChat(draft)
  }

  private handleRemoteChatMessage(info: ChatMessageInfo): void {
    if (!this.activeMatchId || info.matchId !== this.activeMatchId) return
    if (this.selfUserId && info.fromUserId === this.selfUserId) return
    if (this.state.phase === 'menu' || this.state.phase === 'searching') return
    this.botChat(info.text)
  }

  private botChat(text: string): void {
    if (this.state.phase === 'menu' || this.state.phase === 'searching') return
    this.addChat('bot', text)
    if (!this.state.chatOpen) {
      this.audio.sfx('oppLock')
      this.chatToastId = this.chatToastId + 1
      const myId = this.chatToastId
      this.setState({ chatToast: text })
      this.t(() => {
        if (this.chatToastId === myId) this.setState({ chatToast: null })
      }, 3800)
    }
  }

  toggleChat(): void {
    this.audio.sfx('click')
    this.setState((s) => ({
      chatOpen: !s.chatOpen,
      chatUnread: s.chatOpen ? s.chatUnread : 0,
      chatToast: null,
    }))
    this.scrollChat()
  }

  private scrollChat(): void {
    requestAnimationFrame(() => {
      if (this.chatScroll) this.chatScroll.scrollTop = this.chatScroll.scrollHeight
    })
  }

  setChatScroll(el: HTMLDivElement | null): void {
    this.chatScroll = el
  }

  // ---- profile ----
  openProfile(who: ProfileView, friend?: Friend): void {
    this.audio.sfx('click')
    this.setState({ profileView: who, profileFriend: friend ?? null, profileNotice: '' })
  }
  closeProfile(): void {
    this.audio.sfx('click')
    this.setState({ profileView: null, profileFriend: null, profileNotice: '' })
  }
  profileAction(kind: 'friend' | 'report' | 'block' | 'share'): void {
    this.audio.sfx('click')
    const who = this.state.profileView
    const name = who === 'you' ? this.state.playerName : this.state.oppName
    let msg = ''
    if (kind === 'friend')
      msg =
        who === 'opp'
          ? this.state.oppName + ' declined your friend request.'
          : 'That’s you! Share your profile instead.'
    else if (kind === 'report') msg = 'Report submitted — our refs will review ' + name + '.'
    else if (kind === 'block')
      msg =
        who === 'opp'
          ? 'You won’t be matched with ' + this.state.oppName + ' again.'
          : 'You can’t block yourself!'
    else if (kind === 'share') msg = 'Profile link copied to clipboard.'
    this.setState({ profileNotice: msg })
  }
  openProfileSettings(): void {
    this.audio.sfx('click')
    this.setState({
      profileView: null,
      overlay: 'profileSettings',
      nameDraft: this.state.playerName,
    })
  }
  saveProfile(): void {
    const n = (this.state.nameDraft || '').trim().slice(0, 16) || 'GUEST_123'
    this.audio.sfx('lock')
    this.setState({ playerName: n, overlay: null })
  }
  setNameDraft(v: string): void {
    this.setState({ nameDraft: v })
  }
  pickCountry(cc: Country): void {
    this.audio.sfx('click')
    this.setState({ playerCountry: cc })
  }

  // ---- overlays ----
  openOverlay(k: OverlayKind): void {
    this.audio.sfx('click')
    this.setState({ overlay: k })
  }
  openHowTo(): void {
    this.audio.sfx('click')
    this.setState({ overlay: 'howto', howStep: 0 })
  }
  closeOverlay(): void {
    this.audio.sfx('click')
    this.setState({ overlay: null })
  }
  startTutorial(): void {
    this.setState({ overlay: null })
    this.startTutorMatch()
  }
  setExitConfirm(b: boolean): void {
    this.audio.sfx('click')
    this.setState({ showExitConfirm: b })
  }

  // ---- derived hardcoded props (design used this.props.*) ----
  get youColor(): string {
    return DEFAULT_PROPS.youCardColor
  }
  get oppColor(): string {
    return DEFAULT_PROPS.oppCardColor
  }
  get winTarget(): number {
    const fmt: string = DEFAULT_PROPS.matchFormat
    return fmt === 'best of 5' ? 3 : 2
  }
  get timerSecs(): number {
    return Math.max(6, Math.min(30, DEFAULT_PROPS.timerSeconds))
  }
  private roundSecs(): number {
    return this.timerSecs
  }

  // ---- style helpers (color-neutral, consumed by buildView) ----
  grad(c: string): string {
    return 'linear-gradient(160deg, ' + c + ', color-mix(in oklab, ' + c + ' 74%, black))'
  }
  private shadowOf(c: string, a: number): string {
    return 'color-mix(in srgb, ' + c + ' ' + a + '%, transparent)'
  }

  switchTrack(on: boolean): CSSProperties {
    return {
      width: '50px',
      height: '28px',
      flexShrink: 0,
      borderRadius: '999px',
      background: on ? '#00c9b8' : '#d8cbb8',
      border: '2.5px solid #22242a',
      position: 'relative',
      transition: 'background 0.2s ease',
      boxShadow: '2px 2px 0 rgba(34,36,42,0.12)',
      cursor: 'pointer',
    }
  }
  switchKnob(on: boolean): CSSProperties {
    return {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: on ? '24px' : '2px',
      width: '19px',
      height: '19px',
      borderRadius: '999px',
      background: '#fffdfa',
      border: '2px solid #22242a',
      transition: 'left 0.2s cubic-bezier(0.22,1.4,0.36,1)',
    }
  }

  qBadge(c: string, size: number, font: number): CSSProperties {
    return {
      width: size + 'px',
      height: size + 'px',
      borderRadius: '999px',
      background: c,
      color: '#fff',
      fontSize: font + 'px',
      fontWeight: 900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 20px ' + this.shadowOf(c, 40),
    }
  }

  face(c: string): CSSProperties {
    return {
      position: 'absolute',
      inset: '0px',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      borderRadius: '28px',
      background: this.grad(c),
      border: '3px solid rgba(255,255,255,0.5)',
      boxShadow:
        '0 16px 36px ' +
        this.shadowOf(c, 30) +
        ', inset 0 0 0 2px rgba(34,36,42,0.16), inset 0 3px 12px rgba(255,255,255,0.4), inset 0 -18px 34px rgba(34,36,42,0.16)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      padding: '18px 15px 16px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }
  }

  cardChrome(): {
    tex: CSSProperties
    gloss: CSSProperties
    tab: CSSProperties
    medal: CSSProperties
    plate: CSSProperties
    spark: CSSProperties
  } {
    return {
      tex: {
        position: 'absolute',
        inset: '0px',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1.1px, transparent 1.3px)',
        backgroundSize: '13px 13px',
        opacity: 0.5,
        pointerEvents: 'none',
        borderRadius: '28px',
      },
      gloss: {
        position: 'absolute',
        left: '0px',
        right: '0px',
        top: '0px',
        height: '48%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
        borderRadius: '28px 28px 60% 60%',
      },
      tab: {
        position: 'relative',
        zIndex: 2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(34,36,42,0.32)',
        color: 'rgba(255,255,255,0.96)',
        borderRadius: '999px',
        padding: '5px 15px',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22)',
        whiteSpace: 'nowrap',
      },
      medal: {
        position: 'relative',
        zIndex: 2,
        width: '138px',
        height: '138px',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background:
          'radial-gradient(circle at 50% 36%, rgba(255,255,255,0.34), rgba(255,255,255,0.04) 72%)',
        boxShadow:
          'inset 0 0 0 2px rgba(255,255,255,0.45), inset 0 8px 18px rgba(255,255,255,0.28), inset 0 -10px 20px rgba(34,36,42,0.14), 0 10px 22px rgba(34,36,42,0.14)',
      },
      plate: {
        position: 'relative',
        zIndex: 2,
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '52px',
        background: 'rgba(24,26,32,0.34)',
        borderRadius: '16px',
        padding: '9px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 2px 6px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      },
      spark: {
        position: 'absolute',
        right: '15px',
        top: '13px',
        zIndex: 2,
        color: 'rgba(255,255,255,0.9)',
        fontSize: '15px',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 2px rgba(34,36,42,0.25))',
      },
    }
  }

  cardBack(_c: string): CSSProperties {
    return {
      position: 'absolute',
      inset: '0px',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      borderRadius: '28px',
      background: 'linear-gradient(150deg, #2b2e37, #1a1c22)',
      border: '3px solid #3a3d47',
      boxShadow:
        'inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 40px rgba(0,0,0,0.5), 0 20px 44px rgba(34,36,42,0.32)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }
  }

  rankBadge(i: number): CSSProperties {
    const base: CSSProperties = {
      width: '25px',
      height: '25px',
      flexShrink: 0,
      borderRadius: '999px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      fontSize: '11.5px',
      fontWeight: 900,
      border: '2.5px solid #22242a',
      boxSizing: 'border-box',
      boxShadow: '1.5px 2px 0 rgba(34,36,42,0.14)',
    }
    const skin = [
      { bg: '#ffd233', c: '#22242a' },
      { bg: '#e2e6ea', c: '#22242a' },
      { bg: '#f0b884', c: '#22242a' },
    ][i] || { bg: '#fffdfa', c: '#8a7a62' }
    return { ...base, background: skin.bg, color: skin.c }
  }

  pip(filled: boolean, color: string): CSSProperties {
    return {
      width: '12px',
      height: '12px',
      borderRadius: '999px',
      display: 'inline-block',
      background: filled ? color : '#f5e6d3',
      boxShadow: filled ? '0 2px 8px ' + color + '55' : 'none',
      animation: filled ? 'pipPop 0.45s ease both' : 'none',
    }
  }

  private usedChip(
    outcome: RoundOutcome,
    mine: boolean,
  ): { chip: CSSProperties; mark: CSSProperties; markCh: string } {
    const win = outcome === (mine ? 'you' : 'opp')
    const lose = outcome === (mine ? 'opp' : 'you')
    const c = win ? '#2ecc71' : lose ? '#e63946' : '#d8cbb8'
    return {
      chip: {
        position: 'relative',
        width: '27px',
        height: '27px',
        borderRadius: '9px',
        background: '#fbf1e4',
        border: '2px solid ' + c,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(34,36,42,0.08)',
        animation: 'popIn 0.35s ease both',
        cursor: 'default',
        transition: 'transform 0.12s ease',
      },
      mark:
        win || lose
          ? {
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '14px',
              height: '14px',
              borderRadius: '999px',
              background: c,
              color: '#fff',
              fontSize: '8px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 1px 3px rgba(34,36,42,0.2)',
            }
          : { display: 'none' },
      markCh: win ? '✓' : lose ? '✗' : '',
    }
  }

  usedList(mine: boolean): UsedChipView[] {
    return this.state.history.map((h) => {
      const word = mine ? h.you : h.opp
      const u = this.usedChip(h.outcome, mine)
      const short = word.length > 8 ? word.slice(0, 7) + '…' : word
      const wordStyle: CSSProperties = {
        fontSize: '8.5px',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: '#6b7280',
        whiteSpace: 'nowrap',
        maxWidth: '52px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
      return {
        emoji: emojiFor(word),
        word,
        wordShort: short,
        wordStyle,
        style: u.chip,
        markStyle: u.mark,
        mark: u.markCh,
      }
    })
  }

  wordStyle(word: string): CSSProperties {
    const len = (word || '').length
    // Shrink to keep the throw on a single line (never wrap); input length is capped.
    const size = Math.max(15, Math.min(34, Math.round(300 / Math.max(len, 1))))
    return {
      fontSize: size + 'px',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: 1.1,
      letterSpacing: '0.02em',
      textShadow: '0 3px 10px rgba(0,0,0,0.18)',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    }
  }

  streakStyle(left: boolean, anim: ClashAnim): CSSProperties {
    const base: CSSProperties = {
      position: 'absolute',
      borderRadius: '999px',
      pointerEvents: 'none',
      zIndex: 1,
    }
    if (anim === 'cyclone') return { ...base, display: 'none' }
    const side: 'left' | 'right' = left ? 'left' : 'right'
    if (anim === 'sky') {
      const st: CSSProperties = {
        ...base,
        top: '-70px',
        width: '5px',
        height: '250px',
        background: 'linear-gradient(180deg, transparent, rgba(34,36,42,0.28))',
        transformOrigin: 'center top',
        animation: 'streakDashY 0.45s ease-out ' + (left ? '2.42s' : '2.48s') + ' both',
      }
      st[side] = '336px'
      return st
    }
    if (anim === 'upper') {
      const st: CSSProperties = {
        ...base,
        top: '300px',
        width: '5px',
        height: '210px',
        background: 'linear-gradient(0deg, transparent, rgba(34,36,42,0.26))',
        transformOrigin: 'center bottom',
        animation: 'streakDashY 0.45s ease-out ' + (left ? '2.4s' : '2.46s') + ' both',
      }
      st[side] = '300px'
      return st
    }
    return left
      ? {
          ...base,
          left: '130px',
          top: '148px',
          width: '230px',
          height: '5px',
          background: 'linear-gradient(90deg, transparent, rgba(34,36,42,0.26))',
          transformOrigin: 'left center',
          animation: 'streakDash 0.5s ease-out 2.35s both',
        }
      : {
          ...base,
          right: '130px',
          top: '208px',
          width: '230px',
          height: '5px',
          background: 'linear-gradient(270deg, transparent, rgba(34,36,42,0.26))',
          transformOrigin: 'right center',
          animation: 'streakDash 0.5s ease-out 2.42s both',
        }
  }

  // ---- live clash feed (menu ticker) ----
  private makeClash(prev: Clash | null): Clash {
    let e: readonly [string, string, string, string]
    do {
      e = this.CLASH_POOL[Math.floor(Math.random() * this.CLASH_POOL.length)]
    } while (prev && e[1] === prev.wWord)
    return { id: ++this.clashId, wEmoji: e[0], wWord: e[1], lEmoji: e[2], lWord: e[3] }
  }
  private pushClash(): void {
    if (this.state.phase !== 'menu') return
    this.setState((s) => {
      const c = this.makeClash(s.clashes[0] ?? null)
      return { clashes: [c, ...s.clashes].slice(0, 5), flashId: c.id }
    })
    this.t(() => this.setState({ flashId: null }), 700)
  }

  // ---- how-to overlay values ----
  howVals(s: State): {
    howStepLabel: string
    howEmoji: string
    howTitle: string
    howBody: string
    howEmojiWrapStyle: CSSProperties
    howNextLabel: string
    howDots: { w: string; color: string }[]
    howBackStyle: CSSProperties
    onHowBack: () => void
    onHowNext: () => void
    onSwitchToTutorial: () => void
  } {
    const i = s.howStep || 0
    const steps = this.HOW_STEPS
    const step = steps[i]
    const isLast = i === steps.length - 1
    const howEmojiWrapStyle: CSSProperties = {
      width: '112px',
      height: '112px',
      borderRadius: '28px',
      background: step.tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '58px',
      transition: 'background 0.3s ease',
      animation: 'modalPop 0.35s cubic-bezier(0.22,1.4,0.36,1) both',
    }
    const howBackStyle: CSSProperties = {
      display: i === 0 ? 'none' : 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: '#fbf1e4',
      color: '#6b7280',
      border: 'none',
      borderRadius: '999px',
      padding: '14px 20px',
      fontFamily: "'Inter', sans-serif",
      fontSize: '14px',
      fontWeight: 800,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }
    return {
      howStepLabel: i + 1 + ' of ' + steps.length,
      howEmoji: step.emoji,
      howTitle: step.title,
      howBody: step.body,
      howEmojiWrapStyle,
      howNextLabel: isLast ? 'Play Now' : 'Next',
      howDots: steps.map((_, k) => ({
        w: k === i ? '22px' : '7px',
        color: k === i ? '#ef4f3c' : k < i ? '#f6b3a8' : '#e7dccb',
      })),
      howBackStyle,
      onHowBack: () => {
        if ((this.state.howStep || 0) > 0) {
          this.audio.sfx('click')
          this.setState((p) => ({ howStep: p.howStep - 1 }))
        }
      },
      onHowNext: () => {
        this.audio.sfx('click')
        if ((this.state.howStep || 0) >= steps.length - 1) {
          this.setState({ overlay: null })
          this.findMatch()
        } else this.setState((p) => ({ howStep: p.howStep + 1 }))
      },
      onSwitchToTutorial: () => {
        this.audio.sfx('click')
        this.setState({ overlay: 'tutorialConfirm' })
      },
    }
  }

  // ---- live coach-mark tutorial ----
  private readonly coachMeasure = (): void => {
    if (this.state.tutorMode) {
      const active = this.coachIsActive(this.state)
      const step = this.COACH[this.state.coachStep]
      const el = active && step && step.sel ? document.querySelector(step.sel) : null
      if (el) {
        const b = el.getBoundingClientRect()
        const nr = {
          x: Math.round(b.left),
          y: Math.round(b.top),
          w: Math.round(b.width),
          h: Math.round(b.height),
        }
        const c = this.state.coachRect
        if (!c || c.x !== nr.x || c.y !== nr.y || c.w !== nr.w || c.h !== nr.h)
          this.setState({ coachRect: nr })
      } else if (this.state.coachRect) {
        this.setState({ coachRect: null })
      }
    }
    this.coachRAF = requestAnimationFrame(this.coachMeasure)
  }

  private coachIsActive(s: State): boolean {
    if (!s.tutorMode) return false
    const step = this.COACH[s.coachStep]
    if (!step || step.hidden) return false // step 3: watch the round with no veil
    if (s.coachStep <= 2) return s.phase === 'typing'
    return s.phase === 'clash' || s.phase === 'end'
  }

  startTutorMatch(): void {
    this.clearAll()
    const c = [...COUNTRIES].sort(() => Math.random() - 0.5)
    const ideas = IDEAS.slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    this.setState({
      phase: 'banner',
      tutorMode: true,
      coachStep: 0,
      coachRect: null,
      round: 1,
      youScore: 0,
      oppScore: 0,
      history: [],
      confetti: null,
      outcome: '',
      chantDone: true,
      youCountry: c[0],
      oppCountry: c[1],
      count: 0,
      input: '',
      error: '',
      youLocked: false,
      oppLocked: false,
      yourThrow: '',
      oppThrow: '',
      shards: [],
      barShards: [],
      burst: [],
      suggestions: ideas,
      clashStep: 'break',
      oppDots: 3,
      pane: makeBarrierPane(),
    })
    this.audio.sfx('banner')
    this.t(() => {
      this.setState({ count: 3 })
      this.audio.sfx('count')
    }, 450)
    this.t(() => {
      this.setState({ count: 2 })
      this.audio.sfx('count')
    }, 1050)
    this.t(() => {
      this.setState({ count: 1 })
      this.audio.sfx('count')
    }, 1650)
    this.t(() => this.startTyping(), 2250)
  }

  coachAdvance(): void {
    const i = this.state.coachStep
    this.audio.sfx('click')
    if (i === 4) {
      this.setState({ tutorMode: false, coachRect: null })
      this.resumeAfterVerdict()
      return
    }
    this.setState({ coachStep: i + 1 })
  }

  private resumeAfterVerdict(): void {
    const { youScore, oppScore, outcome } = this.state
    const done = youScore >= this.winTarget || oppScore >= this.winTarget
    if (done) {
      this.endMatch()
      return
    }
    if (outcome !== 'tie') this.setState((s) => ({ round: s.round + 1 }))
    this.startRound()
  }

  coachVals(s: State): {
    coachActive: boolean
    coachRingStyle: CSSProperties
    coachBubbleStyle: CSSProperties
    coachNum: number
    coachTotal: number
    coachTitle: string | undefined
    coachText: string | undefined
    coachCta: string | undefined
    coachCtaStyle: CSSProperties
    coachDots: { w: string; color: string }[]
    coachShowCta: boolean
    coachShowWait: boolean
    coachWaitLabel: string
    coachHint: string
    coachShowHint: boolean
    onCoachNext: () => void
    onCoachSkip: () => void
  } {
    const active = this.coachIsActive(s)
    const step = this.COACH[s.coachStep] || this.COACH[0]
    const r = s.coachRect
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    let ring: CSSProperties, bubble: CSSProperties
    if (r) {
      ring = {
        position: 'fixed',
        left: r.x - 8 + 'px',
        top: r.y - 8 + 'px',
        width: r.w + 16 + 'px',
        height: r.h + 16 + 'px',
        borderRadius: '16px',
        boxShadow: '0 0 0 9999px rgba(24,26,32,0.62)',
        border: '3px solid #ffffff',
        zIndex: 80,
        pointerEvents: 'none',
        transition: 'all 0.32s cubic-bezier(0.22,1,0.36,1)',
      }
      const W = 300,
        BH = 214,
        gap = 18,
        pad = 14
      const room = { top: r.y, bottom: vh - (r.y + r.h), left: r.x, right: vw - (r.x + r.w) }
      const fits = {
        top: room.top >= BH + gap,
        bottom: room.bottom >= BH + gap,
        left: room.left >= W + gap,
        right: room.right >= W + gap,
      }
      let place: 'top' | 'bottom' | 'left' | 'right' = step.place || 'bottom'
      if (!fits[place]) {
        const order = {
          bottom: ['bottom', 'top', 'right', 'left'],
          top: ['top', 'bottom', 'right', 'left'],
          left: ['left', 'right', 'top', 'bottom'],
          right: ['right', 'left', 'top', 'bottom'],
        }[place] as ('top' | 'bottom' | 'left' | 'right')[]
        place = order.find((p) => fits[p]) || (room.top >= room.bottom ? 'top' : 'bottom')
      }
      const cx = r.x + r.w / 2,
        cym = r.y + r.h / 2
      let bl: number, bt: number, tf: string
      if (place === 'left') {
        bl = r.x - gap
        bt = cym
        tf = 'translate(-100%, -50%)'
      } else if (place === 'right') {
        bl = r.x + r.w + gap
        bt = cym
        tf = 'translate(0, -50%)'
      } else if (place === 'top') {
        bl = cx
        bt = r.y - gap
        tf = 'translate(-50%, -100%)'
      } else {
        bl = cx
        bt = r.y + r.h + gap
        tf = 'translate(-50%, 0)'
      }
      if (place === 'top' || place === 'bottom')
        bl = Math.max(W / 2 + pad, Math.min(vw - W / 2 - pad, bl))
      else bt = Math.max(BH / 2 + pad, Math.min(vh - BH / 2 - pad, bt))
      bubble = {
        position: 'fixed',
        left: bl + 'px',
        top: bt + 'px',
        transform: tf,
        width: W + 'px',
        background: '#fffdfa',
        borderRadius: '20px',
        padding: '18px 20px 16px',
        boxShadow: '0 22px 55px rgba(24,26,32,0.42)',
        border: '2px solid rgba(0,184,169,0.18)',
        zIndex: 81,
        pointerEvents: 'auto',
        animation: 'modalPop 0.32s cubic-bezier(0.22,1.4,0.36,1) both',
        boxSizing: 'border-box',
      }
    } else {
      ring = {
        position: 'fixed',
        inset: '0',
        background: 'rgba(24,26,32,0.5)',
        zIndex: 80,
        pointerEvents: 'none',
      }
      bubble = {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%,-50%)',
        width: '300px',
        background: '#fffdfa',
        borderRadius: '20px',
        padding: '18px 20px 16px',
        boxShadow: '0 20px 50px rgba(24,26,32,0.4)',
        zIndex: 81,
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }
    }
    const valid = !this.validate(s.input)
    const disabled = step.gate === 'typed' && !valid
    const visibleSteps = this.COACH.filter((st) => !st.hidden)
    const dots = visibleSteps.map((st) => ({
      w: st.num === step.num ? '20px' : '7px',
      color:
        st.num === step.num ? '#ef4f3c' : (st.num ?? 0) < (step.num ?? 0) ? '#f6b3a8' : '#e7dccb',
    }))
    const ctaStyle: CSSProperties = disabled
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: '#ede4d6',
          color: '#b6bcc4',
          border: 'none',
          borderRadius: '999px',
          padding: '10px 20px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: 'not-allowed',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          background: 'linear-gradient(90deg, #ff6b57, #e63946)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          padding: '10px 20px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 900,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(239,79,60,0.4)',
        }
    return {
      coachActive: active,
      coachRingStyle: ring,
      coachBubbleStyle: bubble,
      coachNum: step.num || s.coachStep + 1,
      coachTotal: visibleSteps.length,
      coachTitle: step.title,
      coachText: step.text,
      coachCta: step.cta,
      coachCtaStyle: ctaStyle,
      coachDots: dots,
      coachShowCta: !step.wait,
      coachShowWait: !!step.wait,
      coachWaitLabel: step.wait || '',
      coachHint: disabled ? 'Type a word to continue' : '',
      coachShowHint: disabled,
      onCoachNext: () => {
        if (disabled) return
        this.coachAdvance()
      },
      onCoachSkip: () => this.skipTutorial(),
    }
  }

  skipTutorial(): void {
    this.audio.sfx('click')
    const resume = this.state.phase === 'typing' && !this.interval
    this.setState({ tutorMode: false, coachRect: null })
    if (resume) this.startTypingEngine()
  }

  // ---- flow ----
  findMatch(): void {
    this.clearAll()
    this.clearMatchFoundSub()
    this.searchEpoch += 1
    this.matchAccepted = false
    this.queueEntryId = null
    this.activeMatchId = null
    this.activeRoundId = null
    this.roundEndsAt = null
    this.useWallClock = false
    this.onlineClockArmed = false
    this.pendingNextRound = null
    this.matchCompletedInfo = null
    this.scoresFromServer = false
    this.pendingAiVerdict = null
    this.aiJudging = false
    this.playerSide = null
    this.submittingOnline = false
    this.audio.sfx('click')
    const c = [...COUNTRIES].sort(() => Math.random() - 0.5)
    this.setState({
      phase: 'searching',
      searchStep: 'searching',
      matchCount: 0,
      youCountry: this.state.playerCountry,
      oppCountry: c[1],
      oppName: 'DOOM_BOT',
      oppHandle: '@doom_bot',
      matchMode: this.transport ? 'online' : 'offline',
      round: 1,
      youScore: 0,
      oppScore: 0,
      history: [],
      chantDone: false,
      outcome: '',
      confetti: null,
      chatMsgs: [],
      chatOpen: false,
      chatUnread: 0,
      chatToast: null,
      profileView: null,
      forfeitWin: false,
      rematchWaiting: false,
      rematchNotice: '',
      privateInviteCode: '',
      privateError: '',
      isPrivateMatch: false,
      chatDraft: '',
    })

    this.privateMatchPending = false

    if (!this.transport) {
      this.beginLocalFoundCountdown()
      return
    }

    void this.findMatchOnline(this.searchEpoch)
  }

  private async findMatchOnline(epoch: number): Promise<void> {
    const transport = this.transport
    if (!transport) {
      this.beginLocalFoundCountdown()
      return
    }

    try {
      const joined = await transport.joinQueue()
      if (epoch !== this.searchEpoch || this.state.phase !== 'searching') return
      this.queueEntryId = joined.queueEntryId
      this.clearGhostTimer()
      this.ghostTimer = window.setTimeout(() => {
        void this.fallbackToGhost(epoch)
      }, GHOST_QUEUE_MS)
    } catch {
      if (epoch !== this.searchEpoch || this.state.phase !== 'searching') return
      // Queue failed (API down) — still give a seamless match via ghost.
      await this.fallbackToGhost(epoch)
    }
  }

  private async handleOnlineMatchFound(info: MatchFoundInfo, epoch: number): Promise<void> {
    const fromPrivateOrRematch =
      this.state.phase === 'end' ||
      !!this.state.privateInviteCode ||
      this.state.overlay === 'invite'
    if (epoch !== this.searchEpoch && !fromPrivateOrRematch) return
    if (this.matchAccepted && this.state.phase === 'searching') return
    if (this.state.matchMode === 'ghost' && this.state.phase === 'searching') return
    if (
      this.state.phase !== 'searching' &&
      this.state.phase !== 'end' &&
      this.state.overlay !== 'invite' &&
      !this.state.privateInviteCode
    ) {
      return
    }

    this.matchAccepted = true
    this.clearGhostTimer()
    this.clearMatchFoundSub()
    this.queueEntryId = info.queueEntryId
    this.activeMatchId = info.matchId
    this.activeRoundId = info.currentRoundId
    this.roundEndsAt = null
    this.useWallClock = false
    this.onlineClockArmed = false
    this.pendingNextRound = null
    this.matchCompletedInfo = null
    this.scoresFromServer = false
    this.pendingAiVerdict = null
    this.aiJudging = false
    this.playerSide = info.playerSide
    this.serverRoundLimit = info.roundTimeLimitSeconds || DEFAULT_PROPS.timerSeconds

    const isPrivateMatch =
      this.privateMatchPending ||
      !!this.state.privateInviteCode ||
      this.state.isPrivateMatch

    this.privateMatchPending = false

    const handle =
      '@' +
      info.opponent.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 16)

    const c = [...COUNTRIES].sort(() => Math.random() - 0.5)
    this.clearAll()
    this.setState({
      phase: 'searching',
      searchStep: 'searching',
      matchCount: 0,
      matchMode: 'online',
      isPrivateMatch,
      oppName: info.opponent.displayName,
      oppHandle: handle || '@rival',
      oppCountry: c[1] ?? this.state.oppCountry,
      youCountry: this.state.playerCountry,
      round: 1,
      youScore: 0,
      oppScore: 0,
      history: [],
      chantDone: false,
      outcome: '',
      confetti: null,
      forfeitWin: false,
      rematchWaiting: false,
      rematchNotice: '',
      privateInviteCode: '',
      privateError: '',
      overlay: null,
      chatMsgs: [],
      chatOpen: false,
      chatUnread: 0,
      chatToast: null,
      chatDraft: '',
      profileView: null,
    })
    this.beginLocalFoundCountdown()
  }

  private async fallbackToGhost(epoch: number): Promise<void> {
    if (epoch !== this.searchEpoch) return
    if (this.state.phase !== 'searching' || this.matchAccepted) return

    this.clearGhostTimer()
    this.clearMatchFoundSub()

    const queueId = this.queueEntryId
    this.queueEntryId = null
    if (queueId && this.transport) {
      try {
        await this.transport.cancelQueue(queueId)
      } catch {
        /* already cancelled / matched — ignore */
      }
    }

    // A real match_found may have won the race while we awaited cancel.
    if (epoch !== this.searchEpoch || this.matchAccepted) return
    if (this.state.phase !== 'searching') return

    this.matchAccepted = true
    const ghost = rand(GHOST_OPPONENTS)
    this.activeMatchId = null
    this.activeRoundId = null
    this.roundEndsAt = null
    this.setState({
      matchMode: 'ghost',
      isPrivateMatch: false,
      oppName: ghost.name,
      oppHandle: ghost.handle,
    })
    this.beginLocalFoundCountdown()
  }

  /** Shared face-off countdown used by offline, online, and ghost matches. */
  private beginLocalFoundCountdown(): void {
    const found = 1800 + Math.random() * 1200
    this.t(() => {
      this.setState({ searchStep: 'found' })
      this.audio.sfx('match')
    }, found)
    this.t(() => {
      this.setState({ matchCount: 5 })
      this.audio.sfx('count')
    }, found + 1200)
    this.t(() => {
      this.setState({ matchCount: 4 })
      this.audio.sfx('count')
    }, found + 2000)
    this.t(() => {
      this.setState({ matchCount: 3 })
      this.audio.sfx('count')
    }, found + 2800)
    this.t(() => {
      this.setState({ matchCount: 2 })
      this.audio.sfx('count')
    }, found + 3600)
    this.t(() => {
      this.setState({ matchCount: 1 })
      this.audio.sfx('count')
    }, found + 4400)
    this.t(() => {
      if (this.state.phase === 'searching') this.startRound()
    }, found + 5200)
    if (!this.isOnlineMatch()) {
      this.t(() => this.botChat(rand(this.BOT_GREETINGS)), found + 6200)
    }
  }

  cancelSearch(): void {
    this.searchEpoch += 1
    const queueId = this.queueEntryId
    this.queueEntryId = null
    this.clearMatchFoundSub()
    this.clearGhostTimer()
    this.privateMatchPending = false
    if (queueId && this.transport) {
      void this.transport.cancelQueue(queueId).catch(() => undefined)
    }
    if (this.state.privateInviteCode && this.transport) {
      void this.transport.cancelPrivateLobby().catch(() => undefined)
    }
    this.clearAll()
    this.setState({
      phase: 'menu',
      tutorMode: false,
      coachRect: null,
      matchMode: this.transport ? 'online' : 'offline',
      oppName: 'DOOM_BOT',
      oppHandle: '@doom_bot',
      privateInviteCode: '',
      privateError: '',
      isPrivateMatch: false,
      chatDraft: '',
    })
  }

  toMenu(): void {
    this.searchEpoch += 1
    this.clearMatchFoundSub()
    this.clearGhostTimer()
    this.privateMatchPending = false
    const endingMatchId = this.activeMatchId
    const wasActiveOnline =
      this.state.matchMode === 'online' &&
      !!endingMatchId &&
      this.state.phase !== 'end' &&
      this.state.phase !== 'menu'
    const wasEndedOnline =
      this.state.matchMode === 'online' && !!endingMatchId && this.state.phase === 'end'
    this.queueEntryId = null
    this.activeMatchId = null
    this.activeRoundId = null
    this.roundEndsAt = null
    this.useWallClock = false
    this.onlineClockArmed = false
    this.pendingNextRound = null
    this.matchCompletedInfo = null
    this.scoresFromServer = false
    this.pendingAiVerdict = null
    this.aiJudging = false
    this.playerSide = null
    this.clearAll()
    this.audio.sfx('click')
    if (this.transport) {
      if (wasActiveOnline && endingMatchId) {
        void this.transport.endMatch(endingMatchId).catch(() => undefined)
      } else if (wasEndedOnline && endingMatchId) {
        void this.transport.declineRematch(endingMatchId).catch(() => undefined)
      }
      if (this.state.privateInviteCode) {
        void this.transport.cancelPrivateLobby().catch(() => undefined)
      }
    }
    this.setState({
      phase: 'menu',
      showExitConfirm: false,
      round: 1,
      youScore: 0,
      oppScore: 0,
      history: [],
      confetti: null,
      outcome: '',
      matchCount: 0,
      chantDone: false,
      tutorMode: false,
      coachRect: null,
      forfeitWin: false,
      rematchWaiting: false,
      rematchNotice: '',
      privateInviteCode: '',
      privateError: '',
      isPrivateMatch: false,
      chatDraft: '',
      overlay: null,
      // Keep last known live presence; only mock when offline.
      playersOnline: this.transport
        ? this.state.playersOnline
        : 940 + Math.floor(Math.random() * 300),
      matchMode: this.transport ? 'online' : 'offline',
      oppName: 'DOOM_BOT',
      oppHandle: '@doom_bot',
    })
  }

  startRound(): void {
    this.clearAll()
    this.onlineClockArmed = false
    this.useWallClock = false
    this.roundEndsAt = null
    this.scoresFromServer = false
    this.pendingAiVerdict = null
    this.aiJudging = false
    this.submittingOnline = false
    if (this.pendingNextRound && this.isOnlineMatch()) {
      this.activeRoundId = this.pendingNextRound.roundId
      this.serverRoundLimit =
        this.pendingNextRound.roundTimeLimitSeconds || this.serverRoundLimit
      this.setState({ round: this.pendingNextRound.roundNumber })
      this.pendingNextRound = null
    }
    const used = this.state.history.map((h) => h.you.toLowerCase())
    const ideas = IDEAS.filter((w) => !used.includes(w.toLowerCase()))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const first = !this.state.chantDone
    this.setState({
      phase: first ? 'intro' : 'banner',
      chantDone: true,
      count: 0,
      verdictCount: 0,
      input: '',
      error: '',
      youLocked: false,
      oppLocked: false,
      yourThrow: '',
      oppThrow: '',
      shards: [],
      barShards: [],
      burst: [],
      suggestions: ideas,
      clashStep: 'break',
      oppDots: 3,
      outcome: '',
      headline: '',
      flavor: '',
      pane: makeBarrierPane(),
      secondsLeft: this.isOnlineMatch() ? this.serverRoundLimit : this.roundSecs(),
    })
    if (first) {
      this.t(() => {
        this.setState({ count: 3 })
        this.audio.sfx('beat1')
      }, 550)
      this.t(() => {
        this.setState({ count: 2 })
        this.audio.sfx('beat2')
      }, 1330)
      this.t(() => {
        this.setState({ count: 1 })
        this.audio.sfx('beat3')
      }, 2110)
      this.t(() => {
        this.setState({ count: 99 })
        this.audio.sfx('anything')
      }, 2890)
      this.t(() => this.startTyping(), 4050)
    } else {
      this.audio.sfx('banner')
      this.t(() => this.startTyping(), 2000)
    }
  }

  startTyping(): void {
    const secs = this.isOnlineMatch() ? this.serverRoundLimit : this.roundSecs()
    this.setState({ phase: 'typing', secondsLeft: secs, crackLevel: 0.14 })
    if (this.state.tutorMode) {
      this.setState({ coachStep: 0, coachRect: null })
      return
    }
    if (this.isOnlineMatch()) {
      void this.armOnlineRoundClock()
      return
    }
    this.startTypingEngine()
  }

  private async armOnlineRoundClock(): Promise<void> {
    if (!this.transport || !this.activeMatchId || !this.activeRoundId) return
    if (this.onlineClockArmed && this.roundEndsAt) {
      this.startTypingEngine()
      return
    }
    try {
      const result = await this.transport.startRound(this.activeMatchId, this.activeRoundId)
      this.activeRoundId = result.roundId
      this.applyRoundClock(result.roundEndsAt, result.roundTimeLimitSeconds)
      if (this.state.phase === 'typing') this.startTypingEngine()
    } catch (err) {
      console.warn('[online] failed to arm round clock', err)
      // Soft fallback so the UI isn't stuck if start fails mid-match.
      this.useWallClock = false
      this.onlineClockArmed = false
      if (this.state.phase === 'typing') this.startTypingEngine()
    }
  }

  private startTypingEngine(): void {
    if (this.tickRAF) return
    const online = this.isOnlineMatch() && this.useWallClock && !!this.roundEndsAt
    const dur = online ? this.serverRoundLimit : this.roundSecs()
    if (online) {
      this.deadline = Date.parse(this.roundEndsAt!)
    } else {
      this.deadline = performance.now() + dur * 1000
      this.useWallClock = false
    }
    this.lastWhole = dur
    const loop = () => {
      if (this.state.phase !== 'typing') {
        this.tickRAF = null
        return
      }
      const s = this.state
      const remain = this.useWallClock
        ? (this.deadline - Date.now()) / 1000
        : (this.deadline - performance.now()) / 1000
      const whole = Math.max(0, Math.ceil(remain))
      if (!(s.youLocked && s.oppLocked)) {
        const target = 0.16 + 0.82 * Math.max(0, Math.min(1, 1 - remain / dur))
        if (target > s.crackLevel + 0.004)
          this.setState({ crackLevel: Math.min(target, s.crackLevel + 0.03) })
      }
      if (whole !== this.lastWhole) {
        this.lastWhole = whole
        if (whole <= 0) {
          this.tickRAF = null
          this.setState({ secondsLeft: 0 })
          this.onTimeUp()
          return
        }
        if (!s.youLocked) this.audio.sfx('glassTick')
        if (whole <= 3 && !s.youLocked) this.audio.sfx('tick')
        this.setState((st) => ({
          secondsLeft: whole,
          crackTick: st.crackTick + 1,
          oppDots: st.oppLocked ? st.oppDots : Math.min(16, st.oppDots + 1 + Math.floor(Math.random() * 3)),
        }))
      }
      this.tickRAF = requestAnimationFrame(loop)
    }
    this.tickRAF = requestAnimationFrame(loop)
    if (!this.isOnlineMatch()) {
      const dms = dur * 1000
      const botDelay = Math.min(dms - 700, 1600 + Math.random() * (dms * 0.6))
      this.t(() => this.botLock(), botDelay)
    }
  }

  private botLock(): void {
    if (this.state.phase !== 'typing' || this.state.oppLocked) return
    this.audio.sfx('oppLock')
    this.audio.sfx('crack')
    const usedOpp = this.state.history.map((h) => h.opp.toLowerCase())
    const pool = BOT_THROWS.filter((w) => !usedOpp.includes(w.toLowerCase()))
    this.setState((s) => ({
      oppLocked: true,
      oppThrow: rand(pool.length ? pool : BOT_THROWS),
      crackLevel: Math.min(0.92, s.crackLevel + 0.2),
    }))
    if (this.state.youLocked) {
      this.t(() => this.beginClash(), 750)
    }
  }

  private validate(raw: string): string | null {
    const v = raw.trim()
    if (!v) return 'Type a throw first!'
    if (!/^[A-Za-z0-9'’\- ]+$/.test(v)) return 'Letters and numbers only'
    if (v.length > 24) return 'Too long — max 24 characters'
    if (v.length < 2) return 'A bit more effort than that…'
    if (v.split(/\s+/).length > 3) return 'Max 3 words — keep it punchy'
    const clean = v.replace(/\s+/g, ' ').toLowerCase()
    if (this.state.history.some((h) => h.you.toLowerCase() === clean)) return 'Already burned — no repeats!'
    return null
  }

  setInput(v: string): void {
    this.setState({ input: v, error: '' })
  }

  submit(): void {
    if (this.state.phase !== 'typing' || this.state.youLocked || this.submittingOnline) return
    const err = this.validate(this.state.input)
    if (err) {
      this.setState({ error: err })
      this.audio.sfx('error')
      return
    }
    this.audio.sfx('lock')
    this.audio.sfx('crack')
    const word = this.state.input.trim().replace(/\s+/g, ' ')
    this.setState((s) => ({
      youLocked: true,
      yourThrow: word,
      error: '',
      crackLevel: Math.min(0.92, s.crackLevel + 0.24),
    }))
    if (this.state.tutorMode) {
      this.setState({ coachStep: 3 })
      this.botLock()
      return
    }
    if (this.isOnlineMatch()) {
      void this.submitOnline(word)
      return
    }
    if (this.state.oppLocked) {
      this.t(() => this.beginClash(), 750)
    }
  }

  private async submitOnline(word: string): Promise<void> {
    if (!this.transport || !this.activeMatchId || !this.activeRoundId) return
    this.submittingOnline = true
    try {
      await this.transport.submitThrow(this.activeMatchId, this.activeRoundId, word)
      // Clash begins only when battle_resolved arrives for both clients.
    } catch (err) {
      console.warn('[online] submit failed', err)
      this.submittingOnline = false
      this.setState({
        youLocked: false,
        yourThrow: '',
        error: 'Could not lock in — try again',
      })
      this.audio.sfx('error')
    }
  }

  onTimeUp(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    if (this.tickRAF) {
      cancelAnimationFrame(this.tickRAF)
      this.tickRAF = null
    }
    if (this.state.youLocked) return

    if (this.isOnlineMatch()) {
      const err = this.validate(this.state.input)
      const word = err ? 'Hesitation' : this.state.input.trim().replace(/\s+/g, ' ')
      if (err) this.audio.sfx('alarm')
      this.setState((s) => ({
        youLocked: true,
        yourThrow: word,
        outcome: err ? 'timeout' : s.outcome,
        crackLevel: Math.min(0.92, s.crackLevel + 0.24),
      }))
      void this.submitOnline(word)
      return
    }

    const err = this.validate(this.state.input)
    if (!err) {
      const word = this.state.input.trim().replace(/\s+/g, ' ')
      this.setState({
        youLocked: true,
        yourThrow: word,
        oppLocked: true,
        oppThrow: this.state.oppThrow || rand(BOT_THROWS),
      })
      this.beginClash()
    } else {
      this.audio.sfx('alarm')
      this.setState({
        youLocked: true,
        yourThrow: 'Hesitation',
        oppLocked: true,
        oppThrow: this.state.oppThrow || rand(BOT_THROWS),
        outcome: 'timeout',
      })
      this.beginClash()
    }
  }

  private handleBattleResolved(info: BattleResolvedInfo): void {
    if (!this.isOnlineMatch()) return
    if (this.activeRoundId && info.roundId !== this.activeRoundId) return
    if (this.state.phase === 'end') return

    const youAreP1 = this.playerSide === 'player_1'
    const yourThrow = youAreP1 ? info.player1Input : info.player2Input
    const oppThrow = youAreP1 ? info.player2Input : info.player1Input
    const youScore = youAreP1 ? info.player1Score : info.player2Score
    const oppScore = youAreP1 ? info.player2Score : info.player1Score
    const isTie = info.isTie || !info.winnerUserId
    const youWon = !isTie && !!this.selfUserId && info.winnerUserId === this.selfUserId
    const outcome: RoundOutcome = isTie ? 'tie' : youWon ? 'you' : 'opp'
    const winnerThrow = youWon ? yourThrow : oppThrow
    const loserThrow = youWon ? oppThrow : yourThrow
    const aiFlavor = (info.battleDescription || '').trim()
    const headline =
      (info.headline || '').trim() ||
      (isTie
        ? 'EQUAL MATCH'
        : winnerThrow.toUpperCase() + ' beats ' + loserThrow.toUpperCase())

    this.submittingOnline = false
    this.scoresFromServer = true
    if (this.tickRAF) {
      cancelAnimationFrame(this.tickRAF)
      this.tickRAF = null
    }

    // Always stamp the AI judge text — even if a local clash already started
    // (which would otherwise leave funnyFlavor templates on screen).
    this.setState({
      youLocked: true,
      oppLocked: true,
      yourThrow: yourThrow || this.state.yourThrow,
      oppThrow: oppThrow || this.state.oppThrow,
      youScore,
      oppScore,
      outcome,
      headline,
      flavor: aiFlavor,
    })

    if (this.state.phase === 'clash') {
      return
    }
    this.beginClash()
  }

  /**
   * Online: server battle_resolved. Offline/ghost: pending Groq verdict, else resolveThrow.
   */
  private decideOutcome(): { outcome: RoundOutcome; headline: string; flavor: string } {
    if (this.pendingAiVerdict) {
      const verdict = this.pendingAiVerdict
      this.pendingAiVerdict = null
      return verdict
    }
    if (this.scoresFromServer || this.isOnlineMatch()) {
      const outcome = (this.state.outcome || 'tie') as RoundOutcome
      return {
        outcome: outcome === 'timeout' ? 'opp' : outcome,
        headline: this.state.headline || 'VERDICT',
        flavor: this.state.flavor,
      }
    }
    const { yourThrow, oppThrow, outcome } = this.state
    if (outcome === 'timeout') {
      return {
        outcome: 'opp',
        headline: oppThrow.toUpperCase() + ' punishes HESITATION',
        flavor: 'You never threw a throw. Hesitation, famously, is not a throw.',
      }
    }
    return resolveThrow(yourThrow, oppThrow)
  }

  private beginClash(): void {
    if (this.state.phase === 'clash' || this.aiJudging) return
    if (this.isOnlineMatch() && !this.scoresFromServer) {
      return
    }
    if (!this.isOnlineMatch() && this.transport?.resolveDuel && !this.pendingAiVerdict) {
      void this.beginBotClashWithAi()
      return
    }
    this.runClashAnimation()
  }

  private async beginBotClashWithAi(): Promise<void> {
    if (this.aiJudging || this.state.phase === 'clash') return
    const transport = this.transport
    if (!transport?.resolveDuel) {
      this.runClashAnimation()
      return
    }

    this.aiJudging = true
    const you = this.state.yourThrow
    const opp = this.state.oppThrow
    try {
      const judged = await transport.resolveDuel(you, opp)
      if (
        this.state.phase === 'clash' ||
        this.state.phase === 'end' ||
        this.state.phase === 'menu' ||
        this.state.phase === 'searching'
      ) {
        return
      }
      const outcome: RoundOutcome =
        judged.winnerSlot === 'tie'
          ? 'tie'
          : judged.winnerSlot === 'first'
            ? 'you'
            : 'opp'
      const headline =
        judged.headline.trim() ||
        (outcome === 'tie'
          ? 'EQUAL MATCH'
          : outcome === 'you'
            ? `${you.toUpperCase()} BEATS ${opp.toUpperCase()}`
            : `${opp.toUpperCase()} BEATS ${you.toUpperCase()}`)
      const flavor = judged.battleDescription.trim()
      this.pendingAiVerdict = { outcome, headline, flavor }
      this.setState({ outcome, headline, flavor })
    } catch (err) {
      console.warn('[judge] bot AI resolve failed — local fallback', err)
      this.pendingAiVerdict = null
    } finally {
      this.aiJudging = false
    }

    if (
      this.state.phase === 'clash' ||
      this.state.phase === 'end' ||
      this.state.phase === 'menu' ||
      this.state.phase === 'searching'
    ) {
      return
    }
    this.runClashAnimation()
  }

  private runClashAnimation(): void {
    if (this.state.phase === 'clash') return
    this.clearAll()
    const verdict = this.decideOutcome()
    const anims: ClashAnim[] = ['rush', 'sky', 'cyclone', 'upper']
    const pool = anims.filter((a) => a !== this.lastClashAnim)
    const clashAnim = rand(pool)
    this.lastClashAnim = clashAnim
    const diePool = (['launch', 'drop', 'spin', 'blast'] as DieAnim[]).filter(
      (a) => a !== this.lastDieAnim,
    )
    const dieAnim = rand(diePool)
    this.lastDieAnim = dieAnim
    this.setState({
      phase: 'clash',
      clashStep: 'fight',
      clashAnim,
      dieAnim,
      shards: makeShards(2.75),
      barShards: makeBarrierShards(),
      clashWord: rand(['BOOM!', 'SMASH!', 'KAPOW!', 'WHAM!', 'CRUNCH!', 'ZAM!']),
      ...verdict,
    })
    this.audio.sfx('crack')
    this.t(() => this.audio.sfx('crack'), 150)
    this.t(() => this.audio.sfx('shatter'), 380)
    this.t(() => this.audio.sfx('tinkle'), 720)
    this.t(() => this.audio.sfx('tinkle'), 1050)
    this.t(() => this.audio.sfx('flip'), 1200)
    this.t(() => this.audio.sfx('clash'), 2420)
    this.t(() => this.showVerdict(), 4200)
  }

  private showVerdict(): void {
    const { outcome, yourThrow, oppThrow, round } = this.state
    const burst =
      outcome === 'you'
        ? makeBurst(emojiFor(yourThrow))
        : outcome === 'opp'
          ? makeBurst(emojiFor(oppThrow))
          : []
    this.audio.sfx(outcome === 'you' ? 'winRound' : outcome === 'tie' ? 'tieRound' : 'loseRound')
    if (!this.isOnlineMatch()) {
      this.t(
        () =>
          this.botChat(
            rand(outcome === 'you' ? this.BOT_LOSE : outcome === 'opp' ? this.BOT_WIN : this.BOT_TIE),
          ),
        1400,
      )
    }
    this.setState((s) => ({
      clashStep: 'verdict',
      burst,
      youScore: this.scoresFromServer ? s.youScore : s.youScore + (outcome === 'you' ? 1 : 0),
      oppScore: this.scoresFromServer ? s.oppScore : s.oppScore + (outcome === 'opp' ? 1 : 0),
      history: [...s.history, { round, you: yourThrow, opp: oppThrow, outcome: outcome as RoundOutcome }],
    }))
    if (this.state.tutorMode && this.state.coachStep === 3) this.setState({ coachStep: 4 })
    if (this.state.tutorMode) return

    if (this.isOnlineMatch()) {
      if (this.matchCompletedInfo) {
        this.t(() => this.endMatch(), 3800)
        return
      }
      const N = 10
      for (let n = N; n >= 1; n--) {
        this.t(() => {
          this.setState({ verdictCount: n })
          if (n <= 3) this.audio.sfx('count')
        }, 300 + (N - n) * 1000)
      }
      this.t(() => this.advanceAfterOnlineVerdict(), 300 + N * 1000)
      return
    }

    const { youScore, oppScore } = this.state
    const done = youScore >= this.winTarget || oppScore >= this.winTarget
    if (done) {
      this.t(() => this.endMatch(), 3800)
      return
    }
    const N = 10
    for (let n = N; n >= 1; n--) {
      this.t(() => {
        this.setState({ verdictCount: n })
        if (n <= 3) this.audio.sfx('count')
      }, 300 + (N - n) * 1000)
    }
    this.t(() => {
      if (outcome !== 'tie') this.setState((s) => ({ round: s.round + 1 }))
      this.setState({ verdictCount: 0 })
      this.startRound()
    }, 300 + N * 1000)
  }

  private advanceAfterOnlineVerdict(): void {
    this.setState({ verdictCount: 0 })
    if (this.matchCompletedInfo) {
      this.endMatch()
      return
    }
    if (this.pendingNextRound) {
      this.startRound()
      return
    }
    // Socket may lag a beat behind the verdict countdown — wait briefly.
    this.t(() => {
      if (this.matchCompletedInfo) {
        this.endMatch()
      } else if (this.pendingNextRound) {
        this.startRound()
      } else {
        console.warn('[online] missing next_round_started / match_completed')
        this.toMenu()
      }
    }, 600)
  }

  private endMatch(): void {
    this.matchAccepted = false
    const win =
      this.state.forfeitWin ||
      (this.matchCompletedInfo && this.selfUserId
        ? this.matchCompletedInfo.winnerUserId === this.selfUserId
        : this.state.youScore >= this.winTarget)
    const colors = ['#ff4d6d', '#ffd233', '#00c9b8', '#8b6cf2', '#ff8a6e']
    const winEmojis = this.state.history
      .filter((h) => h.outcome === 'you')
      .map((h) => emojiFor(h.you))
    const confetti = win
      ? Array.from({ length: 80 }, (_, i) => {
          const isEmoji = i % 5 === 0 && winEmojis.length > 0
          const style: CSSProperties = isEmoji
            ? {
                position: 'absolute',
                top: '-10vh',
                left: Math.random() * 100 + '%',
                fontSize: 22 + Math.random() * 16 + 'px',
                animation:
                  'emojiRain ' + (3 + Math.random() * 2.5) + 's linear ' + Math.random() * 2 + 's infinite',
                zIndex: 0,
                pointerEvents: 'none',
              }
            : {
                position: 'absolute',
                top: '-8vh',
                left: Math.random() * 100 + '%',
                width: 6 + Math.random() * 8 + 'px',
                height: 10 + Math.random() * 10 + 'px',
                background: colors[i % colors.length],
                borderRadius: '2px',
                animation:
                  'confettiFall ' +
                  (2.6 + Math.random() * 2.4) +
                  's linear ' +
                  Math.random() * 1.8 +
                  's infinite',
                zIndex: 0,
                pointerEvents: 'none',
              }
          return { emoji: isEmoji ? winEmojis[i % winEmojis.length] : '', style }
        })
      : []
    this.audio.sfx(win ? 'victory' : 'defeat')
    this.setState({ phase: 'end', confetti })
  }

  rematch(): void {
    this.audio.sfx('click')
    if (this.transport && this.state.matchMode === 'online' && this.activeMatchId) {
      if (this.state.rematchWaiting) return
      this.setState({
        rematchWaiting: true,
        rematchNotice: 'Waiting for opponent…',
      })
      void this.transport
        .requestRematch(this.activeMatchId)
        .then((result) => {
          if (result.status === 'matched') {
            // match_found socket will start the face-off.
            this.setState({ rematchWaiting: false, rematchNotice: '' })
          }
        })
        .catch((err) => {
          console.warn('[rematch] failed', err)
          this.setState({
            rematchWaiting: false,
            rematchNotice: 'Could not request rematch',
          })
        })
      return
    }
    this.clearAll()
    this.setState({
      round: 1,
      youScore: 0,
      oppScore: 0,
      history: [],
      confetti: null,
      outcome: '',
      chantDone: false,
      chatMsgs: [],
      chatUnread: 0,
      chatToast: null,
      forfeitWin: false,
      rematchWaiting: false,
      rematchNotice: '',
    })
    this.startRound()
  }

  setPrivateJoinDraft(v: string): void {
    this.setState({
      privateJoinDraft: v.toUpperCase().replace(/[^A-F0-9]/gi, '').slice(0, 6),
      privateError: '',
    })
  }

  createPrivateLobby(): void {
    if (!this.transport) {
      this.setState({ privateError: 'Online connection required' })
      return
    }
    this.audio.sfx('click')
    this.setState({ privateError: '' })
      void this.transport
      .createPrivateLobby()
      .then((info) => {
        this.searchEpoch += 1
        this.matchAccepted = false
        this.privateMatchPending = true
        this.setState({
          privateInviteCode: info.inviteCode,
          privateError: '',
          isPrivateMatch: true,
        })
      })
      .catch((err) => {
        console.warn('[private] create failed', err)
        this.privateMatchPending = false
        this.setState({ privateError: 'Could not create room' })
      })
  }

  joinPrivateLobby(): void {
    if (!this.transport) {
      this.setState({ privateError: 'Online connection required' })
      return
    }
    const code = this.state.privateJoinDraft.trim().toUpperCase()
    if (code.length !== 6) {
      this.setState({ privateError: 'Enter the 6-character room code' })
      return
    }
    this.audio.sfx('click')
    this.searchEpoch += 1
    this.matchAccepted = false
    this.privateMatchPending = true
    void this.transport
      .joinPrivateLobby(code)
      .then(() => {
        this.setState({ privateError: '', isPrivateMatch: true })
      })
      .catch((err) => {
        console.warn('[private] join failed', err)
        this.privateMatchPending = false
        this.setState({ privateError: 'Room not found or unavailable', isPrivateMatch: false })
      })
  }

  cancelPrivateLobby(): void {
    this.audio.sfx('click')
    if (this.transport && this.state.privateInviteCode) {
      void this.transport.cancelPrivateLobby().catch(() => undefined)
    }
    this.privateMatchPending = false
    this.setState({
      privateInviteCode: '',
      privateError: '',
      isPrivateMatch: false,
    })
  }

  copyPrivateCode(): void {
    const code = this.state.privateInviteCode
    if (!code) return
    this.audio.sfx('click')
    try {
      void navigator.clipboard.writeText(code)
      this.setState({ privateError: 'Code copied!' })
      this.t(() => {
        if (this.state.privateError === 'Code copied!') {
          this.setState({ privateError: '' })
        }
      }, 1600)
    } catch {
      this.setState({ privateError: 'Could not copy code' })
    }
  }
}
