import { useSyncExternalStore } from 'react'

/** Below this: fluid mobile/tablet column layouts (no 1280 FitStage lobby). */
export const DESKTOP_MIN = 768

/** Wide enough for the authored 3-column lobby inside FitStage. */
export const WIDE_DESKTOP_MIN = 1100

const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN}px)`
const WIDE_QUERY = `(min-width: ${WIDE_DESKTOP_MIN}px)`

function subscribeMq(query: string, onChange: () => void) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** True when viewport >= 768px (FitStage scale for in-game stages, non-mobile chrome). */
export function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => subscribeMq(DESKTOP_QUERY, cb),
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
}

/** True when viewport >= 1100px — full 3-column lobby + FitStage(1280). */
export function useIsWideDesktop() {
  return useSyncExternalStore(
    (cb) => subscribeMq(WIDE_QUERY, cb),
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  )
}
