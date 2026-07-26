import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { useIsDesktop } from '@/lib/useBreakpoint'
import { useDraggableFab } from '@/lib/useDraggableFab'
import { FAB_DOCK, useFabSize } from '@/lib/fabDock'

/** Fixed sound toggle (design lines 127–134). Draggable — users can park it
 *  anywhere; position is remembered. Tap still toggles mute. */
export function SoundToggle() {
  const vm = useView()
  const isDesktop = useIsDesktop()
  const size = useFabSize()
  const drag = useDraggableFab({
    storageKey: 'rpsa-fab-mute',
    defaultLeft: isDesktop ? FAB_DOCK.edgeDesktop : FAB_DOCK.edgeMobile,
    defaultBottom: isDesktop ? FAB_DOCK.bottomDesktop : FAB_DOCK.bottomMobile,
    width: size,
    height: size,
    zIndex: isDesktop ? 55 : 999,
    onTap: vm.onToggleSound,
  })

  if (!drag.ready || !drag.shellStyle) return null

  return (
    <button
      type="button"
      aria-label="Toggle sound"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: '#fffdfa',
        border: 'none',
        boxShadow: isDesktop
          ? '0 2px 8px rgba(34,36,42,0.06), 0 12px 28px rgba(34,36,42,0.12)'
          : '0 2px 8px rgba(34,36,42,0.06), 0 10px 22px rgba(34,36,42,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        // shellStyle last so position:fixed + shared dock always wins
        ...drag.shellStyle,
      }}
      {...drag.handlers}
    >
      {vm.soundOn && (
        <svg
          viewBox="0 0 24 24"
          style={css(
            isDesktop
              ? 'width: 22px; height: 22px; pointer-events: none;'
              : 'width: 18px; height: 18px; pointer-events: none;',
          )}
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
          style={css(
            isDesktop
              ? 'width: 22px; height: 22px; pointer-events: none;'
              : 'width: 18px; height: 18px; pointer-events: none;',
          )}
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
    </button>
  )
}
