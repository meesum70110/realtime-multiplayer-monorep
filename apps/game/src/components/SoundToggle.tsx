import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Fixed bottom-left sound toggle (design lines 127–134). The button lift on
 *  hover is the design's `style-hover` transform, so it goes through Pressable.
 *  Two mutually-exclusive SVG states render on/off; SVG attrs are camelCased. */
export function SoundToggle() {
  const vm = useView()
  return (
    <Pressable
      as="button"
      aria-label="Toggle sound"
      onClick={vm.onToggleSound}
      baseStyle={css(
        'position: fixed; left: 22px; bottom: 22px; z-index: 55; width: 52px; height: 52px; border-radius: 999px; background: #fffdfa; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(34,36,42,0.06), 0 12px 28px rgba(34,36,42,0.12); display: flex; align-items: center; justify-content: center; transition: transform 0.12s ease;',
      )}
      hoverStyle={css('transform: translateY(-2px) scale(1.05);')}
    >
      {vm.soundOn && (
        <svg
          viewBox="0 0 24 24"
          style={css('width: 22px; height: 22px;')}
          fill="none"
          stroke="#22242a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
          <path d="M16 9a5 5 0 0 1 0 6"></path>
          <path d="M19.364 18.364a9 9 0 0 0 0-12.728"></path>
        </svg>
      )}
      {vm.soundOff && (
        <svg
          viewBox="0 0 24 24"
          style={css('width: 22px; height: 22px;')}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"></path>
          <line x1="22" x2="16" y1="9" y2="15"></line>
          <line x1="16" x2="22" y1="9" y2="15"></line>
        </svg>
      )}
    </Pressable>
  )
}
