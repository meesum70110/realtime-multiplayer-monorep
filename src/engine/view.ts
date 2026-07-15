import type { CSSProperties } from 'react'
import { COUNTRIES, DEFAULT_PROPS, FRIENDS, TOP_WORDS } from './constants'
import { clashWrap, facetStyle, fragStyle, paneWrap, type ClashRole } from './geometry'
import { emojiFor } from './throws'
import type { GameEngine } from './GameEngine'
import type { AnyLetter, HeadlineWord, PaneLineView, ViewModel } from './types'

/** Pure selector — turns the engine's current state into the render contract.
 *  Ported from the design's `renderVals()` (lines 2341–2653). Per Ruleset #6, the
 *  design's embedded `React.createElement` bindings (`menuMorphEl`, `menuCardFill`,
 *  `menuCardSpark`, `matchCountEl`, `crackFlashEl`, `verdictCountEl`) are replaced
 *  with plain data + styles that the consuming components render. */
export function buildView(engine: GameEngine): ViewModel {
  const s = engine.state

  const panicOn =
    s.phase === 'typing' &&
    s.secondsLeft <= 5 &&
    !s.youLocked &&
    DEFAULT_PROPS.panicFx &&
    s.panicPref
  const arenaMode = s.phase !== 'menu' && s.phase !== 'searching'
  const bgMenuStyle: CSSProperties = {
    position: 'absolute',
    inset: '0',
    background: "url('arena-bg.png') center / cover no-repeat",
    opacity: arenaMode ? 0 : 1,
    transition: 'opacity 0.7s ease',
  }
  const bgArenaStyle: CSSProperties = {
    position: 'absolute',
    inset: '0',
    background:
      'radial-gradient(ellipse 68% 52% at 50% 26%, rgba(0,184,169,0.12), transparent 62%), radial-gradient(ellipse 60% 48% at 50% 104%, rgba(139,108,242,0.12), transparent 60%), linear-gradient(168deg, #eef5f4 0%, #f1eef7 55%, #eff3f6 100%)',
    opacity: arenaMode ? 1 : 0,
    transition: 'opacity 0.7s ease',
  }
  const total = engine.timerSecs
  const circ = 226.2

  const youWon = s.outcome === 'you'
  const oppWon = s.outcome === 'opp'
  const isTie = s.outcome === 'tie'

  const forgeWord = s.input.trim() ? s.input.trim() : '…'
  const flen = forgeWord.length

  const headlineWords: HeadlineWord[] = (s.headline || '').split(' ').map((text, i) => ({
    text,
    style: {
      animation: 'wordPop 0.45s cubic-bezier(0.3, 1.2, 0.4, 1) ' + (0.35 + i * 0.09) + 's both',
      display: 'inline-block',
    },
  }))

  const oppSide: string = DEFAULT_PROPS.oppSide
  const bothLocked = s.youLocked && s.oppLocked
  const role: ClashRole = isTie ? 'tie' : youWon ? 'win' : 'lose'
  const oppRole: ClashRole = isTie ? 'tie' : oppWon ? 'win' : 'lose'
  const youWonMatch = s.youScore >= engine.winTarget
  const chrome = engine.cardChrome()

  const matchCountStyle: CSSProperties = {
    position: 'absolute',
    fontSize: '62px',
    fontWeight: 900,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: s.matchCount >= 4 ? '#00b8a9' : s.matchCount === 3 ? '#e5a800' : '#e63946',
    animation: 'countPunch 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) both',
  }
  const crackFlashStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '150px',
    width: '170px',
    height: '170px',
    margin: '-85px 0 0 -85px',
    borderRadius: '999px',
    background:
      'radial-gradient(circle, rgba(255,255,255,0.75), rgba(0,201,184,0.22) 42%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 3,
    animation: 'flashOut 0.55s ease both',
  }
  const verdictCountStyle: CSSProperties = {
    position: 'absolute',
    fontSize: '28px',
    fontWeight: 900,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    color: s.verdictCount <= 3 ? '#e63946' : '#22242a',
    animation: 'countPunch 0.4s cubic-bezier(0.2, 1.1, 0.4, 1) both',
  }

  const anyLetters: AnyLetter[] = 'ANYTHING!'.split('').map((ch, i) => ({
    ch,
    style: {
      fontSize: '66px',
      fontWeight: 900,
      textTransform: 'uppercase',
      color: ch === '!' ? '#ef4f3c' : '#22242a',
      display: 'inline-block',
      animation: 'letterPop 0.4s cubic-bezier(0.25, 1.3, 0.4, 1) ' + (0.22 + i * 0.045) + 's both',
    },
  }))

  const paneLines: PaneLineView[] = s.pane.lines
    .map((l): PaneLineView | null => {
      const fade = Math.max(0, Math.min(1, (s.crackLevel - (l.t0 || 0)) / 0.12))
      return fade <= 0.02
        ? null
        : { pts: l.pts, style: { ...l.style, opacity: (l.style.opacity || 0.5) * fade } }
    })
    .filter((l): l is PaneLineView => l !== null)

  return {
    cardTex: chrome.tex,
    cardGloss: chrome.gloss,
    cardTab: chrome.tab,
    cardMedal: chrome.medal,
    cardPlate: chrome.plate,
    cardSpark: chrome.spark,
    cardBackYou: engine.cardBack(engine.youColor),
    cardBackOpp: engine.cardBack(engine.oppColor),
    cardBackPat: {
      position: 'absolute',
      inset: '0px',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 13px), radial-gradient(circle at 50% 42%, rgba(255,255,255,0.09), transparent 60%)',
      pointerEvents: 'none',
      borderRadius: '25px',
    },
    lockedBackYou: {
      position: 'absolute',
      inset: '0px',
      borderRadius: '24px',
      background: 'linear-gradient(150deg, #2b2e37, #1a1c22)',
      border: '3px solid #3a3d47',
      boxShadow:
        'inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 40px rgba(0,0,0,0.45), 0 8px 16px rgba(34,36,42,0.06), 0 20px 40px rgba(34,36,42,0.14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      animation: 'popIn 0.45s ease both',
    },
    lockedBackOpp: {
      position: 'absolute',
      inset: '0px',
      borderRadius: '24px',
      background: 'linear-gradient(150deg, #2b2e37, #1a1c22)',
      border: '3px solid #3a3d47',
      boxShadow:
        'inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 40px rgba(0,0,0,0.45), 0 8px 16px rgba(34,36,42,0.06), 0 20px 40px rgba(34,36,42,0.14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      animation: 'wobble 2.4s ease-in-out infinite',
    },
    morphSym: s.morphSym,
    morphColor: engine.morphColor(s.morphSym),
    morphInk: engine.morphInk(s.morphSym),
    morphK: s.morphK,
    inGame: s.phase !== 'menu' && s.phase !== 'searching' && s.phase !== 'end',
    showMenu: s.phase === 'menu',
    champ: TOP_WORDS[0],
    topRest: TOP_WORDS.slice(1).map((w, i) => ({
      ...w,
      rank: i + 2,
      badgeStyle: engine.rankBadge(i + 1),
      wrStyle: {
        background: w.wrBg,
        color: w.wrC,
        borderRadius: '999px',
        padding: '4px 9px',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.02em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      },
    })),
    clashes: s.clashes.map((c, i) => ({
      ...c,
      ago: ['now', '4s', '9s', '16s', '24s'][i] || i * 8 + 's',
      rowStyle: {
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '5px 8px 5px 6px',
        borderRadius: '14px',
        border: '2px solid ' + (c.id === s.flashId ? '#22242a' : 'rgba(34,36,42,0.07)'),
        background: c.id === s.flashId ? 'rgba(255,210,51,0.3)' : '#fbf5ec',
        transition: 'background 0.6s ease, border-color 0.6s ease',
        animation:
          c.id === s.flashId ? 'popIn 0.45s cubic-bezier(0.22, 1.4, 0.36, 1) both' : 'none',
      },
    })),
    showSearching: s.phase === 'searching',
    searchIsSearching: s.searchStep === 'searching',
    searchIsFound: s.searchStep === 'found',
    playersOnline: s.playersOnline.toLocaleString(),
    onFindMatch: () => engine.findMatch(),
    onCancelSearch: () => engine.cancelSearch(),
    showHowTo: s.overlay === 'howto',
    showSettings: s.overlay === 'settings',
    showInvite: s.overlay === 'invite',
    onOpenSettings: () => engine.openOverlay('settings'),
    onOpenInvite: () => engine.openOverlay('invite'),
    settingsRows: [
      { key: 'sound', label: 'Sound Effects', desc: 'Clicks, clashes & crackles', on: s.soundOn, toggle: () => engine.toggleSound() },
      { key: 'music', label: 'Background Music', desc: 'The arena groove', on: s.musicOn, toggle: () => engine.setSetting('musicOn', 'rpa-music-on', !s.musicOn) },
      { key: 'panic', label: 'Panic FX', desc: 'Red pulse when the clock is low', on: s.panicPref, toggle: () => engine.setSetting('panicPref', 'rpa-panic-on', !s.panicPref) },
    ].map((r) => ({
      label: r.label,
      desc: r.desc,
      toggle: r.toggle,
      trackStyle: engine.switchTrack(r.on),
      knobStyle: engine.switchKnob(r.on),
    })),
    inviteCodeStr: engine.inviteCode(),
    inviteCopied: s.inviteCopied,
    inviteCopyLabel: s.inviteCopied ? 'Copied!' : 'Copy link',
    onCopyInvite: () => engine.copyInvite(),
    friendsList: FRIENDS.map((fr) => ({
      name: fr.name,
      country: fr.country,
      initial: fr.name[0],
      invited: s.invitedFriends.includes(fr.name),
      notInvited: !s.invitedFriends.includes(fr.name),
      onInvite: (e) => {
        if (e) e.stopPropagation()
        engine.inviteFriend(fr.name)
      },
      onOpen: () => engine.openProfile('friend', fr),
      avatarStyle: {
        width: '40px',
        height: '40px',
        flexShrink: 0,
        borderRadius: '12px',
        background: fr.color,
        border: '2px solid #22242a',
        boxShadow: '2px 2px 0 rgba(34,36,42,0.14)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '17px',
        fontWeight: 900,
      },
      dotStyle: {
        width: '9px',
        height: '9px',
        borderRadius: '999px',
        flexShrink: 0,
        background: fr.online ? '#2ecc71' : '#c9bda8',
        boxShadow: fr.online ? '0 0 0 3px rgba(46,204,113,0.2)' : 'none',
      },
      statusLabel: fr.online ? 'Online' : 'Offline',
    })),
    showTutorialConfirm: s.overlay === 'tutorialConfirm',
    stopProp: (e) => e.stopPropagation(),
    onHowToPlay: () => engine.openHowTo(),
    onTutorial: () => engine.openOverlay('tutorialConfirm'),
    onCloseOverlay: () => engine.closeOverlay(),
    onStartTutorial: () => engine.startTutorial(),
    ...engine.howVals(s),
    ...engine.coachVals(s),
    onMenu: () => engine.toMenu(),
    onExit: () => engine.setExitConfirm(true),
    showExitConfirm: s.showExitConfirm,
    onExitConfirm: () => engine.toMenu(),
    onExitCancel: () => engine.setExitConfirm(false),
    soundOn: s.soundOn,
    soundOff: !s.soundOn,
    onToggleSound: () => engine.toggleSound(),
    showChat: arenaMode && !s.tutorMode,
    chatOpen: s.chatOpen,
    chatHasUnread: s.chatUnread > 0,
    chatUnread: s.chatUnread > 9 ? '9+' : String(s.chatUnread),
    chatEmpty: s.chatMsgs.length === 0,
    onToggleChat: () => engine.toggleChat(),
    chatToast: s.chatToast || '',
    chatShowToast: arenaMode && !s.tutorMode && !s.chatOpen && !!s.chatToast,
    chatFabStyle: {
      position: 'relative',
      width: '56px',
      height: '56px',
      borderRadius: '18px',
      background: '#22242a',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '4px 6px 0 rgba(34,36,42,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.12s ease',
      animation: s.chatUnread > 0 ? 'chatNudge 2.2s ease-in-out infinite' : 'none',
    },
    showProfile: !!s.profileView,
    profileIsYou: s.profileView === 'you',
    profileIsBot: s.profileView === 'opp',
    profileIsFriend: s.profileView === 'friend',
    profileNotYou: !!s.profileView && s.profileView !== 'you',
    profileName:
      s.profileView === 'you'
        ? s.playerName
        : s.profileView === 'friend'
          ? s.profileFriend
            ? s.profileFriend.name
            : ''
          : 'DOOM_BOT',
    profileHandle:
      s.profileView === 'you'
        ? '@guest_123'
        : s.profileView === 'friend'
          ? s.profileFriend
            ? s.profileFriend.handle
            : ''
          : '@doom_bot',
    profileFlag:
      s.profileView === 'friend'
        ? s.profileFriend
          ? s.profileFriend.flag
          : ''
        : s.profileView === 'opp'
          ? s.oppCountry[0]
          : s.youCountry[0],
    profileCountry:
      s.profileView === 'friend'
        ? s.profileFriend
          ? s.profileFriend.country
          : ''
        : s.profileView === 'opp'
          ? s.oppCountry[1]
          : s.youCountry[1],
    profileTag:
      s.profileView === 'you' ? 'Guest Player' : s.profileView === 'friend' ? 'Friend' : 'AI Opponent',
    profileTagStyle: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background:
        s.profileView === 'opp'
          ? 'rgba(255,77,109,0.14)'
          : s.profileView === 'friend'
            ? 'rgba(139,108,242,0.14)'
            : 'rgba(0,201,184,0.14)',
      color:
        s.profileView === 'opp'
          ? '#c2264a'
          : s.profileView === 'friend'
            ? '#6a4fd8'
            : '#00857a',
      borderRadius: '999px',
      padding: '5px 14px',
      fontSize: '11px',
      fontWeight: 900,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    profileRingStyle: {
      width: '96px',
      height: '96px',
      borderRadius: '999px',
      background: '#fbf1e4',
      border: '3px solid #22242a',
      boxShadow: '3px 4px 0 rgba(34,36,42,0.14)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '46px',
    },
    profileStats:
      s.profileView === 'you'
        ? [
            { label: 'Matches', value: '128' },
            { label: 'Win rate', value: '61%' },
            { label: 'Fav weapon', value: 'Volcano' },
            { label: 'Member since', value: '2024' },
          ]
        : s.profileView === 'friend'
          ? [
              { label: 'Matches', value: (s.profileFriend && s.profileFriend.matches) || '—' },
              { label: 'Win rate', value: (s.profileFriend && s.profileFriend.wr) || '—' },
              { label: 'Fav weapon', value: (s.profileFriend && s.profileFriend.fav) || '—' },
              { label: 'Status', value: s.profileFriend && s.profileFriend.online ? 'Online' : 'Offline' },
            ]
          : [
              { label: 'Matches', value: '9,999' },
              { label: 'Win rate', value: '88%' },
              { label: 'Signature', value: 'Black Hole' },
              { label: 'Core model', value: 'v3.1' },
            ],
    profileNotice: s.profileNotice,
    profileHasNotice: !!s.profileNotice,
    onCloseProfile: () => engine.closeProfile(),
    onProfileYou: () => engine.openProfile('you'),
    onProfileOpp: () => engine.openProfile('opp'),
    onProfileFriend: () => engine.profileAction('friend'),
    onProfileReport: () => engine.profileAction('report'),
    onProfileBlock: () => engine.profileAction('block'),
    onProfileShare: () => engine.profileAction('share'),
    onProfileSettings: () => engine.openProfileSettings(),
    showProfileSettings: s.overlay === 'profileSettings',
    nameDraft: s.nameDraft,
    onNameDraft: (e) => engine.setNameDraft(e.target.value),
    nameDraftRef: (el) => {
      const marked = el as (HTMLInputElement & { _did?: boolean }) | null
      if (marked && !marked._did) {
        marked._did = true
        marked.focus()
        marked.select()
      }
    },
    onSaveProfile: () => engine.saveProfile(),
    onOpenGameSettings: () => engine.openOverlay('settings'),
    playerName: s.playerName,
    countryOptions: COUNTRIES.map((cc) => ({
      flag: cc[0],
      name: cc[1],
      selStyle: {
        width: '40px',
        height: '40px',
        flexShrink: 0,
        borderRadius: '11px',
        border: cc[1] === s.playerCountry[1] ? '2.5px solid #22242a' : '2.5px solid transparent',
        background: cc[1] === s.playerCountry[1] ? '#fffdfa' : '#fbf5ec',
        boxShadow: cc[1] === s.playerCountry[1] ? '2px 3px 0 rgba(34,36,42,0.16)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
      },
      pick: () => engine.pickCountry(cc),
    })),
    chatScrollRef: (el) => engine.setChatScroll(el),
    chatList: s.chatMsgs.map((m) => ({
      text: m.text,
      rowStyle: {
        display: 'flex',
        justifyContent: m.from === 'you' ? 'flex-end' : 'flex-start',
        animation: 'riseFade 0.3s ease both',
      },
      bubbleStyle:
        m.from === 'you'
          ? {
              maxWidth: '80%',
              background: engine.grad(engine.youColor),
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              lineHeight: 1.35,
              padding: '8px 12px',
              borderRadius: '15px 15px 4px 15px',
              boxShadow: '0 2px 6px rgba(34,36,42,0.14)',
              wordBreak: 'break-word',
            }
          : {
              maxWidth: '80%',
              background: '#2b2e37',
              color: '#fffdfa',
              fontWeight: 700,
              fontSize: '13px',
              lineHeight: 1.35,
              padding: '8px 12px',
              borderRadius: '15px 15px 15px 4px',
              boxShadow: '0 2px 6px rgba(34,36,42,0.14)',
              wordBreak: 'break-word',
            },
    })),
    quickChats: engine.QUICK_CHATS.map((q) => ({
      text: q.text,
      emoji: q.emoji,
      send: () => engine.sendChat(q.emoji + ' ' + q.text),
    })),
    showIntro: s.phase === 'intro',
    showBanner: s.phase === 'banner',
    showTyping: s.phase === 'typing',
    showClash: s.phase === 'clash',
    showEnd: s.phase === 'end',

    youFlag: s.youCountry[0],
    youCountryName: s.youCountry[1],
    oppFlag: s.oppCountry[0],
    oppCountryName: s.oppCountry[1],
    showMatchCount: s.matchCount > 0,
    matchCount: s.matchCount,
    matchCountStyle,

    roundLabel: s.phase === 'end' ? 'Final' : 'Round ' + s.round,
    formatLabel: 'Best of ' + (engine.winTarget * 2 - 1) + ' · First to ' + engine.winTarget,
    bannerTitle: 'Round ' + s.round,
    bannerTag:
      s.youScore === engine.winTarget - 1 || s.oppScore === engine.winTarget - 1
        ? '⚡ Match point'
        : 'Score so far',
    showBannerCount: s.phase === 'banner' && s.count > 0,
    bc3: s.phase === 'banner' && s.count === 3,
    bc2: s.phase === 'banner' && s.count === 2,
    bc1: s.phase === 'banner' && s.count === 1,
    beatRock: s.count === 3,
    beatPaper: s.count === 2,
    beatScissors: s.count === 1,
    beatAnything: s.count === 99,
    anyLetters,

    secondsLeft: s.secondsLeft,
    ringColor: panicOn ? '#e63946' : engine.youColor,
    ringOffset: circ * (1 - s.secondsLeft / total),
    timerWrapStyle: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: panicOn ? 'panicBeat 0.85s ease-in-out infinite' : 'none',
      filter: panicOn ? 'drop-shadow(0 0 14px rgba(230,57,70,0.45))' : 'none',
      transition: 'filter 0.4s ease',
    },
    timerNumStyle: {
      position: 'absolute',
      fontSize: panicOn ? '36px' : '32px',
      fontWeight: 900,
      color: panicOn ? '#e63946' : '#22242a',
      fontVariantNumeric: 'tabular-nums',
      animation: panicOn
        ? 'timerPunch' + (s.secondsLeft % 2 ? 'A' : 'B') + ' 0.45s cubic-bezier(0.2, 1.2, 0.4, 1)'
        : 'none',
    },
    panicOn,
    bgMenuStyle,
    bgArenaStyle,

    youPips: Array.from({ length: engine.winTarget }, (_, i) => ({
      style: engine.pip(s.youScore > i, engine.youColor),
    })),
    oppPips: Array.from({ length: engine.winTarget }, (_, i) => ({
      style: engine.pip(s.oppScore > i, engine.oppColor),
    })),
    youUsed: engine.usedList(true),
    oppUsed: engine.usedList(false),
    qYouSm: engine.qBadge(engine.youColor, 74, 40),
    qOppSm: engine.qBadge(engine.oppColor, 64, 34),
    previewCardStyle: {
      ...engine.face(engine.youColor),
      borderRadius: '24px',
      animation: 'floatIdle 3.4s ease-in-out infinite',
    },

    paneWrapStyle: {
      ...paneWrap('typing'),
      filter:
        'drop-shadow(0 6px ' +
        Math.round(16 + s.crackLevel * 26) +
        'px rgba(0,201,184,' +
        (0.4 + s.crackLevel * 0.35).toFixed(2) +
        ')) drop-shadow(0 2px 4px rgba(34,36,42,0.14))',
    },
    crackFlashOn: s.phase === 'typing' && s.crackTick > 0,
    crackTick: s.crackTick,
    crackFlashStyle,
    paneOverlayStyle: {
      position: 'absolute',
      inset: '0px',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      filter:
        'drop-shadow(0 0 1.4px rgba(9,74,79,0.95)) drop-shadow(0 0 6px rgba(255,255,255,0.5))',
      animation: bothLocked ? 'crackFlicker 0.3s ease-in-out infinite' : 'none',
    },
    paneOutlinePts: s.pane.outline,
    paneCrackPts: s.pane.crack,
    paneLines,
    paneFacetsStatic: s.pane.facets.map((f) => ({ style: facetStyle(f, false) })),
    paneFragsStatic: s.pane.frags.map((fr) => ({ style: fragStyle(fr, false) })),
    paneFrostStyle: {
      position: 'absolute',
      inset: '0px',
      clipPath: s.pane.outlineClip,
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      background:
        'linear-gradient(118deg, rgba(255,255,255,0.42), rgba(0,201,184,0.26) 46%, rgba(120,232,222,0.3) 74%, rgba(255,255,255,0.34))',
      boxShadow: 'inset 0 0 34px rgba(0,201,184,0.28), inset 0 2px 0 rgba(255,255,255,0.6)',
      animation: 'barrierHum 2.6s ease-in-out infinite',
    },
    paneFrostBreakStyle: {
      position: 'absolute',
      inset: '0px',
      clipPath: s.pane.outlineClip,
      background:
        'linear-gradient(115deg, rgba(255,255,255,0.42), rgba(0,201,184,0.24) 50%, rgba(255,255,255,0.34))',
      animation: 'paneFlash 0.5s ease 0.36s both',
    },
    paneGlintClipStyle: {
      position: 'absolute',
      inset: '0px',
      clipPath: s.pane.outlineClip,
      overflow: 'hidden',
      pointerEvents: 'none',
    },
    paneGlintStyle: {
      position: 'absolute',
      left: '-30%',
      right: '-30%',
      top: '0px',
      height: '90px',
      background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.45), transparent)',
      animation: 'paneGlint 4.2s ease-in-out 1s infinite',
    },
    oppHalfStyle: {
      position: 'absolute',
      right: '20px',
      top: '0px',
      width: '360px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      animation: 'riseFade 0.4s ease 0.08s both',
      filter: 'grayscale(1) brightness(0.86)',
      opacity: bothLocked ? 0.75 : 0.58,
      transition: 'opacity 0.6s ease',
    },
    oppModeSil: oppSide === 'silhouette',
    oppModeCardBack: oppSide !== 'silhouette',
    oppModeDots: oppSide === 'masked typing',
    oppModeTypingPill: oppSide !== 'masked typing',
    oppDots: '●'.repeat(Math.max(1, s.oppDots)),

    input: s.input,
    onInput: (e) => engine.setInput(e.target.value),
    onKey: (e) => {
      if (e.key === 'Enter') engine.submit()
    },
    onSubmit: () => engine.submit(),
    inputRef: (el) => {
      if (el) el.focus()
    },
    inputShakeStyle: {
      width: '250px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      animation: s.error ? 'shakeX 0.45s ease' : 'none',
    },
    hasError: !!s.error,
    error: s.error,
    suggestions: s.suggestions.map((w) => ({
      word: w,
      emoji: emojiFor(w),
      pick: () => engine.setInput(w),
    })),

    liveEmoji: emojiFor(s.input),
    liveEmojiStyle: {
      display: 'inline-block',
      fontSize: '82px',
      lineHeight: 1,
      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))',
      animation: s.input
        ? 'typePop' + (s.input.length % 2 ? 'A' : 'B') + ' 0.24s cubic-bezier(0.3, 1.3, 0.4, 1)'
        : 'none',
    },
    forgeWord,
    forgeWordStyle: {
      fontSize: (flen > 14 ? 20 : flen > 9 ? 24 : 28) + 'px',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      textAlign: 'center',
      lineHeight: 1.15,
      overflowWrap: 'anywhere',
      minHeight: '30px',
    },

    youLocked: s.youLocked,
    youUnlocked: !s.youLocked,
    oppTyping: !s.oppLocked,
    oppLockedFlag: s.oppLocked,

    clashStageStyle: {
      position: 'relative',
      width: '1000px',
      height: '490px',
      animation:
        s.clashStep === 'break' ? 'impactShakeZoom 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) 2.85s' : 'none',
    },
    clashWord: s.clashWord,
    streakLStyle: engine.streakStyle(true, s.clashAnim),
    streakRStyle: engine.streakStyle(false, s.clashAnim),
    barrierBreaking: s.clashStep === 'break',
    paneWrapBreakStyle: paneWrap('break'),
    paneOverlayBreakStyle: {
      position: 'absolute',
      inset: '0px',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      filter: 'drop-shadow(0 0 1.2px rgba(9,74,79,0.85))',
      animation: 'crackFlare 0.42s ease both, paneFlash 0.5s ease 0.42s both',
    },
    paneFacetsBreak: s.pane.facets.map((f) => ({ style: facetStyle(f, true) })),
    paneFragsBreak: s.pane.frags.map((fr) => ({ style: fragStyle(fr, true) })),
    barShards: s.barShards,
    verdictShown: s.clashStep === 'verdict',
    showVerdictCount: s.clashStep === 'verdict' && s.verdictCount > 0,
    verdictNextLabel:
      s.youScore === engine.winTarget - 1 || s.oppScore === engine.winTarget - 1
        ? 'Match point · next in'
        : 'Next round in',
    verdictCount: s.verdictCount,
    verdictCountStyle,
    yourClashWrapStyle: clashWrap(true, s.clashStep, role, s.clashAnim, s.dieAnim),
    oppClashWrapStyle: clashWrap(false, s.clashStep, oppRole, s.clashAnim, s.dieAnim),
    yourBraceStyle: {
      perspective: '1200px',
      animation:
        s.clashStep === 'break'
          ? 'cardBraceL 1.1s ease 0.15s both, cardCharge 0.85s ease-in-out 1.5s both'
          : 'none',
    },
    oppBraceStyle: {
      perspective: '1200px',
      animation:
        s.clashStep === 'break'
          ? 'cardBraceR 1.1s ease 0.15s both, cardCharge 0.85s ease-in-out 1.62s both'
          : 'none',
    },
    yourFlipStyle: {
      width: '250px',
      height: '330px',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transform: 'rotateY(180deg)',
      animation: 'flipReveal 0.62s cubic-bezier(0.4, 0.85, 0.35, 1) 1.2s both',
    },
    oppFlipStyle: {
      width: '250px',
      height: '330px',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transform: 'rotateY(180deg)',
      animation:
        'flipReveal 0.62s cubic-bezier(0.4, 0.85, 0.35, 1) 1.32s both, cardUngrey 0.6s ease 1.28s both',
    },
    yourFaceStyle: engine.face(engine.youColor),
    oppFaceStyle: engine.face(engine.oppColor),

    shards: s.shards,
    yourWord: s.yourThrow,
    oppWord: s.oppThrow,
    yourEmoji: emojiFor(s.yourThrow),
    oppEmoji: emojiFor(s.oppThrow),
    yourWordStyle: engine.wordStyle(s.yourThrow),
    oppWordStyle: engine.wordStyle(s.oppThrow),

    notTie: !isTie,
    headlineWords,
    flavor: s.flavor,
    burst: s.burst,
    verdictBadge: isTie
      ? 'Draw — round replays'
      : youWon
        ? 'You take the round'
        : 'DOOM_BOT takes the round',
    verdictBadgeStyle: {
      marginTop: '6px',
      borderRadius: '999px',
      padding: '9px 24px',
      fontWeight: 800,
      fontSize: '14px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      background: isTie
        ? 'rgba(238,181,47,0.18)'
        : youWon
          ? 'rgba(0,184,169,0.14)'
          : 'rgba(230,57,70,0.12)',
      color: isTie ? '#b8860b' : youWon ? '#00857a' : '#e63946',
      animation: 'popIn 0.45s ease 1.1s both',
    },

    endMedalEmoji: youWonMatch ? '🏆' : '💀',
    endMedalStyle: {
      width: '92px',
      height: '92px',
      borderRadius: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '50px',
      background: youWonMatch
        ? 'linear-gradient(160deg, #ffe07a, #f6c945)'
        : 'linear-gradient(160deg, #e9e4db, #cbc4b6)',
      border: '4px solid #22242a',
      boxShadow: '5px 8px 0 rgba(34,36,42,0.16)',
      transform: 'rotate(-5deg)',
      position: 'relative',
      zIndex: 2,
      animation: 'beatDrop 0.6s cubic-bezier(0.25,1.2,0.4,1) both, floatIdle 3.2s ease-in-out 0.7s infinite',
    },
    endTitle: youWonMatch ? 'Victory' : 'Defeat',
    endTitleStyle: {
      margin: 0,
      fontSize: '78px',
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      lineHeight: 1,
      color: youWonMatch ? '#00b8a9' : '#22242a',
      textShadow: youWonMatch ? '0 10px 40px rgba(0,184,169,0.35)' : 'none',
      animation: 'slamIn 0.6s cubic-bezier(0.22, 1.4, 0.36, 1) both',
      position: 'relative',
      zIndex: 2,
    },
    endSub: youWonMatch ? 'The AI referee bows to your creativity.' : 'DOOM_BOT reigns. For now.',
    youScore: s.youScore,
    oppScore: s.oppScore,
    confetti: s.confetti || [],
    history: s.history.map((h) => ({
      label: 'R' + h.round,
      you: h.you,
      opp: h.opp,
      youEmoji: emojiFor(h.you),
      oppEmoji: emojiFor(h.opp),
      resultMark: h.outcome === 'you' ? '✓' : h.outcome === 'opp' ? '✗' : '=',
      resultChipStyle: {
        width: '30px',
        height: '30px',
        flexShrink: 0,
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: 900,
        color: '#fff',
        background: h.outcome === 'you' ? '#2ecc71' : h.outcome === 'opp' ? '#e63946' : '#c9bda8',
        boxShadow: '0 2px 6px rgba(34,36,42,0.16)',
      },
      youStyle: {
        fontWeight: 800,
        fontSize: '15px',
        textAlign: 'right',
        color: h.outcome === 'you' ? '#00857a' : h.outcome === 'tie' ? '#9ca3af' : '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
      oppStyle: {
        fontWeight: 800,
        fontSize: '15px',
        textAlign: 'left',
        color: h.outcome === 'opp' ? '#e63946' : h.outcome === 'tie' ? '#9ca3af' : '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
    })),
    onRematch: () => engine.rematch(),
  }
}
