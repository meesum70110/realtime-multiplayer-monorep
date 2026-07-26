import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Forfeit confirmation dialog (design lines 254–267): keep fighting or forfeit the
 *  match and drop back to the menu. */
export function ExitConfirm() {
  const vm = useView()
  if (!vm.showExitConfirm) return null
  return (
    <div
      style={css(
        'position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        style={css(
          'background: #fffdfa; border: 3px solid #22242a; border-radius: 30px; padding: 34px 40px 28px; box-shadow: 8px 12px 0 rgba(34,36,42,0.18); display: flex; flex-direction: column; align-items: center; gap: 12px; max-width: 440px; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
        )}
      >
        <div
          style={css(
            'width: 88px; height: 88px; border-radius: 24px; background: linear-gradient(160deg, #ff6b57, #e63946); border: 3px solid #22242a; box-shadow: 4px 6px 0 rgba(34,36,42,0.18); display: flex; align-items: center; justify-content: center; transform: rotate(-6deg); animation: wobble 2.6s ease-in-out infinite;',
          )}
        >
          <svg viewBox="0 0 24 24" style={css('width: 44px; height: 44px;')} fill="none" stroke="#fffdfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
        <h3 style={css('margin: 8px 0 0; font-size: 27px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; color: #22242a; text-align: center;')}>
          Forfeit the battle?
        </h3>
        <p style={css('margin: 0; font-size: 14.5px; font-weight: 600; color: #6b7280; text-align: center; line-height: 1.5; max-width: 320px;')}>
          {vm.oppName} instantly claims the win and this match vanishes. No takebacks.
        </p>
        <div style={css('display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 12px;')}>
          <Pressable
            as="button"
            onClick={vm.onExitCancel}
            baseStyle={css(
              "width: 100%; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 9px; background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: 3px solid #22242a; border-radius: 999px; padding: 15px 32px; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; box-shadow: 4px 5px 0 rgba(34,36,42,0.2); transition: transform 0.12s ease;",
            )}
            hoverStyle={css('transform: translateY(-2px);')}
            activeStyle={css('transform: scale(0.97);')}
          >
            <svg viewBox="0 0 24 24" style={css('width: 20px; height: 20px;')} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
              <line x1="13" y1="19" x2="19" y2="13"></line>
              <line x1="16" y1="16" x2="20" y2="20"></line>
              <line x1="19" y1="21" x2="21" y2="19"></line>
              <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline>
              <line x1="5" y1="14" x2="9" y2="18"></line>
              <line x1="7" y1="17" x2="4" y2="20"></line>
              <line x1="3" y1="19" x2="5" y2="21"></line>
            </svg>
            Keep Fighting
          </Pressable>
          <Pressable
            as="button"
            onClick={vm.onExitConfirm}
            baseStyle={css(
              "width: 100%; box-sizing: border-box; background: transparent; color: #b6a58c; border: none; border-radius: 999px; padding: 10px; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer; transition: all 0.15s ease;",
            )}
            hoverStyle={css('color: #e63946;')}
          >
            Forfeit &amp; exit to menu
          </Pressable>
        </div>
      </div>
    </div>
  )
}
