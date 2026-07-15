import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Forfeit control, pinned to the bottom-center of the screen during a live match
 *  (moved out of the scoreboard header). Opens the exit-confirm dialog. */
export function ExitMatchButton() {
  const vm = useView()
  // Only during active typing — hidden through the clash so it can't collide with the verdict card.
  if (!vm.showTyping) return null
  return (
    <Pressable
      as="button"
      onClick={vm.onExit}
      baseStyle={css(
        "position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 55; display: inline-flex; align-items: center; gap: 7px; background: #fbf1e4; border: none; border-radius: 999px; padding: 9px 18px 9px 11px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #8a7a62; cursor: pointer; box-shadow: 0 2px 8px rgba(34,36,42,0.05), 0 12px 28px rgba(34,36,42,0.1); transition: all 0.15s ease;",
      )}
      hoverStyle={css('color: #e63946; background: rgba(230,57,70,0.12); transform: translateX(-50%) translateY(-2px);')}
    >
      <span style={css('width: 22px; height: 22px; border-radius: 999px; background: rgba(230,57,70,0.14); display: inline-flex; align-items: center; justify-content: center;')}>
        <svg viewBox="0 0 24 24" style={css('width: 12px; height: 12px;')} fill="none" stroke="#e63946" strokeWidth="3.2" strokeLinecap="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </span>
      Exit match
    </Pressable>
  )
}
