import { useEffect, useState } from 'react'
import { DESKTOP_MIN } from '@/lib/useBreakpoint'

/** Shared default dock for mute (left) + chat (right). Same bottom + edge on each side. */
export const FAB_DOCK = {
  edgeMobile: 8,
  edgeDesktop: 22,
  /** Mobile: raised above forge + suggestion chips. */
  bottomMobile: 176,
  /** Desktop: a little above the viewport edge (clears shadow). */
  bottomDesktop: 28,
  sizeDesktop: 52,
} as const

/** Clear legacy FAB coords that caused random start positions. */
export function clearLegacyFabStorage() {
  try {
    for (const k of [
      'rpsa-fab-mute',
      'rpsa-fab-chat',
      'rpsa-fab-mute-v2',
      'rpsa-fab-chat-v2',
      'rpsa-fab-mute-v3',
      'rpsa-fab-chat-v3',
      'rpsa-fab-mute-v4',
      'rpsa-fab-chat-v4',
      'rpsa-fab-mute-v5',
      'rpsa-fab-chat-v5',
      'rpsa-fab-mute-v6',
      'rpsa-fab-chat-v6',
      'rpsa-fab-mute-v7',
      'rpsa-fab-chat-v7',
      'rpsa-fab-mute-v8',
      'rpsa-fab-chat-v8',
    ]) {
      localStorage.removeItem(k)
    }
  } catch {
    /* ignore */
  }
}

/** Mobile FAB size scales with viewport; desktop stays fixed. */
export function getFabSize(viewportWidth: number): number {
  if (viewportWidth >= DESKTOP_MIN) return FAB_DOCK.sizeDesktop
  return Math.round(Math.min(48, Math.max(34, viewportWidth * 0.11)))
}

/** Live FAB pixel size — mute + chat always share one value. */
export function useFabSize(): number {
  const [size, setSize] = useState(() =>
    typeof window === 'undefined' ? FAB_DOCK.sizeDesktop : getFabSize(window.innerWidth),
  )
  useEffect(() => {
    clearLegacyFabStorage()
    const sync = () => setSize(getFabSize(window.innerWidth))
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])
  return size
}

/** Mobile weapon-card scale (<768 only). */
export const MOBILE_CARD_SCALE_CSS = 'min(0.75, 22vh / 330px)'
