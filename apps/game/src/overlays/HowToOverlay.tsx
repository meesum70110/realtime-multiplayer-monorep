import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** How to Play (design lines 377–407): a paged explainer with an emoji, title, body,
 *  progress dots, back/next controls, and a shortcut into the interactive tutorial. */
export function HowToOverlay() {
  const vm = useView()
  if (!vm.showHowTo) return null
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
          'background: #fffdfa; border-radius: 32px; padding: 30px 36px 28px; box-shadow: 0 30px 80px rgba(34,36,42,0.35); display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; max-width: 460px; animation: modalPop 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) both; position: relative;',
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
        <span style={css('font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #4c8dff;')}>
          How to Play · {vm.howStepLabel}
        </span>
        <div style={vm.howEmojiWrapStyle}>{vm.howEmoji}</div>
        <h3 style={css('margin: 0; font-size: 25px; font-weight: 900; letter-spacing: -0.01em; color: #22242a; text-align: center;')}>
          {vm.howTitle}
        </h3>
        <p style={css('margin: 0; font-size: 14.5px; font-weight: 600; color: #6b7280; line-height: 1.55; text-align: center; min-height: 84px; max-width: 360px;')}>
          {vm.howBody}
        </p>
        <div style={css('display: flex; gap: 7px;')}>
          {vm.howDots.map((dot, i) => (
            <span
              key={i}
              style={{
                width: dot.w,
                height: '7px',
                borderRadius: '999px',
                background: dot.color,
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
            ></span>
          ))}
        </div>
        <div style={css('display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 6px;')}>
          <button onClick={vm.onHowBack} style={vm.howBackStyle}>
            <svg viewBox="0 0 24 24" style={css('width: 16px; height: 16px;')} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
            Back
          </button>
          <Pressable
            as="button"
            onClick={vm.onHowNext}
            baseStyle={css(
              "flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: none; border-radius: 999px; padding: 14px 26px; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 22px rgba(239,79,60,0.4); transition: transform 0.12s ease;",
            )}
            hoverStyle={css('transform: translateY(-2px) scale(1.02);')}
            activeStyle={css('transform: scale(0.97);')}
          >
            {vm.howNextLabel}
            <svg viewBox="0 0 24 24" style={css('width: 17px; height: 17px;')} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </Pressable>
        </div>
        <Pressable
          as="button"
          onClick={vm.onSwitchToTutorial}
          baseStyle={css(
            "display: inline-flex; align-items: center; gap: 8px; background: rgba(87,201,79,0.1); border: none; border-radius: 999px; color: #3fa03b; font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 800; cursor: pointer; padding: 9px 16px; margin-top: 2px; transition: all 0.15s ease;",
          )}
          hoverStyle={css('background: rgba(87,201,79,0.18); transform: translateY(-1px);')}
        >
          <svg viewBox="0 0 24 24" style={css('width: 15px; height: 15px;')} fill="currentColor">
            <polygon points="6 3 20 12 6 21 6 3"></polygon>
          </svg>
          Prefer to learn by doing? Try the tutorial
        </Pressable>
      </div>
    </div>
  )
}
