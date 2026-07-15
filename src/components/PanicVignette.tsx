import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'

/** Double-heartbeat red vignette shown when the timer is in panic range
 *  (design lines 122–126). Two panicPulse layers offset by 0.42s. */
export function PanicVignette() {
  const vm = useView()
  if (!vm.panicOn) return null
  return (
    <>
      <div
        style={css(
          'position: fixed; inset: 0; pointer-events: none; z-index: 50; box-shadow: inset 0 0 200px rgba(230, 57, 70, 0.55); animation: panicPulse 0.85s ease-in-out infinite;',
        )}
      ></div>
      <div
        style={css(
          'position: fixed; inset: 0; pointer-events: none; z-index: 50; background: radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(230,57,70,0.26) 100%); animation: panicPulse 0.85s ease-in-out 0.42s infinite;',
        )}
      ></div>
    </>
  )
}
