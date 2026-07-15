import { rand } from '@/lib/random'
import { DEFAULT_PROPS, EMOJI_MAP, FALLBACKS, TIE_FLAVORS, VERBS } from './constants'
import type { RoundOutcome } from './types'

export function emojiFor(word: string): string {
  const w = (word || '').toLowerCase().trim()
  if (!w) return '❔'
  let best: string | null = null
  let bestLen = 0
  for (const [k, e] of EMOJI_MAP) {
    if (w.includes(k) && k.length > bestLen) {
      best = e
      bestLen = k.length
    }
  }
  if (best) return best
  let h = 0
  for (let i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0
  return FALLBACKS[h % FALLBACKS.length]
}

export function funnyFlavor(winner: string, loser: string): string {
  const w = winner
  const l = loser
  const t = [
    l + ' never stood a chance and honestly, it knew it.',
    'Scientists confirm: ' + w + ' beats ' + l + ' ten times out of nine.',
    l + ' has left the chat.',
    l + ' filed a complaint. ' + w + ' filed it under "destroyed".',
    'Somewhere out there, a ' + l + ' support group just gained a member.',
    w + ' didn’t even break a sweat.',
    'That’s the last time ' + l + ' picks a fight with ' + w + '.',
    w + ' wins on style points alone — the judges wept.',
    l + ' was last seen demanding a rematch it will also lose.',
    'The ' + l + ' union is furious. ' + w + ' remains unbothered.',
    'History books will call this the ' + l + ' incident.',
    w + ' would like to thank ' + l + ' for participating.',
  ]
  return rand(t)
}

export interface ClashVerdict {
  outcome: RoundOutcome
  headline: string
  flavor: string
}

/** Pure you-vs-opp comparison core extracted from the design's decideOutcome (lines ~2120–2138).
 *  The 'timeout' special case and score mutation stay in GameEngine (Task 7). */
export function resolveClash(you: string, opp: string): ClashVerdict {
  if (you.toLowerCase() === opp.toLowerCase()) {
    return {
      outcome: 'tie',
      headline: you.toUpperCase() + ' cancels out ' + opp.toUpperCase(),
      flavor: rand(TIE_FLAVORS),
    }
  }
  if (Math.random() < 0.08) {
    return {
      outcome: 'tie',
      headline: you.toUpperCase() + ' and ' + opp.toUpperCase() + ' annihilate each other',
      flavor: rand(TIE_FLAVORS),
    }
  }
  const skill = DEFAULT_PROPS.botSkill
  const youWinP = skill === 'easy' ? 0.68 : skill === 'brutal' ? 0.35 : 0.52
  const youWin = Math.random() < youWinP
  const w = youWin ? you : opp
  const l = youWin ? opp : you
  return {
    outcome: youWin ? 'you' : 'opp',
    headline: w.toUpperCase() + ' ' + rand(VERBS) + ' ' + l.toUpperCase(),
    flavor: funnyFlavor(w, l),
  }
}

export type ValidationResult = { ok: true; word: string } | { ok: false; error: string }

export function validate(raw: string): ValidationResult {
  const v = raw.trim()
  if (!v) return { ok: false, error: 'Type a weapon first!' }
  if (!/^[A-Za-z0-9'’\- ]+$/.test(v)) return { ok: false, error: 'Letters and numbers only' }
  if (v.length > 24) return { ok: false, error: 'Too long — max 24 characters' }
  if (v.length < 2) return { ok: false, error: 'A bit more effort than that…' }
  if (v.split(/\s+/).length > 3) return { ok: false, error: 'Max 3 words — keep it punchy' }
  return { ok: true, word: v.replace(/\s+/g, ' ') }
}
