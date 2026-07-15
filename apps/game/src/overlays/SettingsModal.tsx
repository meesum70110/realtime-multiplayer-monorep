import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Game settings (design lines 269–297): toggle rows for sound, music, and panic FX,
 *  each with a track/knob switch computed in the view-model. */
export function SettingsModal() {
  const vm = useView()
  if (!vm.showSettings) return null
  return (
    <div
      onClick={vm.onCloseOverlay}
      style={css(
        'position: fixed; inset: 0; z-index: 61; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'width: 100%; max-width: 420px; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); padding: 26px 26px 22px; display: flex; flex-direction: column; gap: 14px; position: relative; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onCloseOverlay}
          aria-label="Close"
          baseStyle={css(
            'position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 999px; background: #fbf1e4; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease;',
          )}
          hoverStyle={css('background: rgba(230,57,70,0.12);')}
        >
          <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </Pressable>
        <div style={css('display: flex; align-items: center; gap: 11px;')}>
          <span style={css('width: 44px; height: 44px; border-radius: 13px; background: #00c9b8; display: inline-flex; align-items: center; justify-content: center; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); transform: rotate(-4deg);')}>
            <svg viewBox="0 0 24 24" style={css('width: 24px; height: 24px;')} fill="none" stroke="#06312d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
            <span style={css('font-size: 20px; font-weight: 900; letter-spacing: 0.02em; color: #22242a;')}>Settings</span>
            <span style={css('font-size: 12px; font-weight: 700; color: #9ca3af;')}>Tune the arena to your taste</span>
          </div>
        </div>
        <div style={css('display: flex; flex-direction: column; gap: 8px;')}>
          {vm.settingsRows.map((row, i) => (
            <div key={i} style={css('display: flex; align-items: center; justify-content: space-between; gap: 14px; background: #fbf5ec; border-radius: 16px; padding: 13px 16px;')}>
              <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
                <span style={css('font-size: 14.5px; font-weight: 800; color: #22242a;')}>{row.label}</span>
                <span style={css('font-size: 11.5px; font-weight: 600; color: #9ca3af;')}>{row.desc}</span>
              </div>
              <button onClick={row.toggle} aria-label="Toggle" style={row.trackStyle}>
                <span style={row.knobStyle}></span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
