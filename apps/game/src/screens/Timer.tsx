import { css } from '@/lib/css'
import { MOBILE_CARD_SCALE_CSS } from '@/lib/fabDock'
import type { ViewModel } from '@rpsa/game-core'

/** Center countdown timer that sits on the glass barrier (design lines 906–917):
 *  a progress ring whose color and dash-offset track the seconds remaining.
 *  `stacked` places it in flow for the mobile arena; shares mobile card scale. */
export function Timer({ vm, stacked = false }: { vm: ViewModel; stacked?: boolean }) {
  const mobileScale = MOBILE_CARD_SCALE_CSS

  if (stacked) {
    return (
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: `calc(118px * ${mobileScale})`,
          maxHeight: 'min(14vh, calc(118px * 0.75))',
          flexShrink: 0,
          animation: 'popIn 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) 0.15s both',
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            transform: `scale(${mobileScale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
          }}
        >
          <div style={vm.timerWrapStyle}>
            <svg viewBox="0 0 84 84" style={css('width: 118px; height: 118px; transform: rotate(-90deg);')}>
              <circle cx="42" cy="42" r="40.5" fill="#fffdfa" stroke="#22242a" strokeWidth="2.5"></circle>
              <circle cx="42" cy="42" r="36" fill="#fffdfa" stroke="#f5e6d3" strokeWidth="7"></circle>
              <circle
                cx="42"
                cy="42"
                r="36"
                fill="none"
                stroke={vm.ringColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="226.2"
                strokeDashoffset={vm.ringOffset}
                style={css('transition: stroke-dashoffset 1s linear, stroke 0.4s ease;')}
              ></circle>
            </svg>
            <span style={vm.timerNumStyle}>{vm.secondsLeft}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={css(
        'position: absolute; left: 50%; top: 106px; margin-left: -59px; z-index: 4; animation: popIn 0.4s cubic-bezier(0.22, 1.4, 0.36, 1) 0.15s both;',
      )}
    >
      <div style={vm.timerWrapStyle}>
        <svg viewBox="0 0 84 84" style={css('width: 118px; height: 118px; transform: rotate(-90deg);')}>
          <circle cx="42" cy="42" r="40.5" fill="#fffdfa" stroke="#22242a" strokeWidth="2.5"></circle>
          <circle cx="42" cy="42" r="36" fill="#fffdfa" stroke="#f5e6d3" strokeWidth="7"></circle>
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke={vm.ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="226.2"
            strokeDashoffset={vm.ringOffset}
            style={css('transition: stroke-dashoffset 1s linear, stroke 0.4s ease;')}
          ></circle>
        </svg>
        <span style={vm.timerNumStyle}>{vm.secondsLeft}</span>
      </div>
    </div>
  )
}
