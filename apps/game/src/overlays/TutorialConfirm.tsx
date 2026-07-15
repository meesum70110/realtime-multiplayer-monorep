import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Tutorial confirmation (design lines 411–433): offers a guided practice match against
 *  a training bot, with maybe-later / start-tutorial actions. */
export function TutorialConfirm() {
  const vm = useView()
  if (!vm.showTutorialConfirm) return null
  return (
    <div
      onClick={vm.onCloseOverlay}
      style={css(
        'position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(34,36,42,0.45); backdrop-filter: blur(6px); animation: overlayFade 0.25s ease both;',
      )}
    >
      <div
        onClick={vm.stopProp}
        style={css(
          'background: #fffdfa; border-radius: 32px; padding: 34px 40px 30px; box-shadow: 0 30px 80px rgba(34,36,42,0.35); display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; max-width: 440px; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both; position: relative;',
        )}
      >
        <Pressable
          as="button"
          onClick={vm.onCloseOverlay}
          aria-label="Close"
          baseStyle={css(
            'position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 999px; background: #fbf1e4; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s ease; z-index: 2;',
          )}
          hoverStyle={css('background: rgba(230,57,70,0.12);')}
        >
          <svg viewBox="0 0 24 24" style={css('width: 17px; height: 17px;')} fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </Pressable>
        <div style={css('width: 92px; height: 92px; border-radius: 26px; background: rgba(87,201,79,0.14); display: flex; align-items: center; justify-content: center; font-size: 48px; animation: modalPop 0.4s cubic-bezier(0.22,1.4,0.36,1) both;')}>
          🎓
        </div>
        <span style={css('font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #57c94f;')}>
          Interactive Tutorial
        </span>
        <h3 style={css('margin: 0; font-size: 25px; font-weight: 900; letter-spacing: -0.01em; color: #22242a; text-align: center;')}>
          Learn by playing
        </h3>
        <p style={css('margin: 0; font-size: 14.5px; font-weight: 600; color: #6b7280; line-height: 1.55; text-align: center; max-width: 350px;')}>
          We'll drop you into a friendly practice match against a training bot and guide you through every step —
          picking a weapon, locking in, and reading the clash. Take as long as you like.
        </p>
        <div style={css('display: flex; align-items: center; gap: 10px; background: #fbf5ec; border-radius: 14px; padding: 11px 16px; width: 100%; box-sizing: border-box;')}>
          <span style={css('font-size: 18px;')}>🤖</span>
          <span style={css('font-size: 13px; font-weight: 700; color: #6b7280; line-height: 1.4;')}>
            No pressure — the timer is paused while you're learning.
          </span>
        </div>
        <div style={css('display: flex; gap: 10px; width: 100%; margin-top: 4px;')}>
          <Pressable
            as="button"
            onClick={vm.onCloseOverlay}
            baseStyle={css(
              "background: #fbf1e4; color: #6b7280; border: none; border-radius: 999px; padding: 14px 22px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.15s ease;",
            )}
            hoverStyle={css('background: #f2e6d3;')}
          >
            Maybe later
          </Pressable>
          <Pressable
            as="button"
            onClick={vm.onStartTutorial}
            baseStyle={css(
              "flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(90deg, #4fb84a, #3fa03b); color: #fff; border: none; border-radius: 999px; padding: 14px 26px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 22px rgba(87,201,79,0.4); transition: transform 0.12s ease;",
            )}
            hoverStyle={css('transform: translateY(-2px) scale(1.02);')}
            activeStyle={css('transform: scale(0.97);')}
          >
            <svg viewBox="0 0 24 24" style={css('width: 18px; height: 18px;')} fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
            Start Tutorial
          </Pressable>
        </div>
      </div>
    </div>
  )
}
