import { css } from '@/lib/css'
import type { ViewModel } from '@rpsa/game-core'

/** Center countdown timer that sits on the glass barrier (design lines 906–917):
 *  a progress ring whose color and dash-offset track the seconds remaining. */
export function Timer({ vm }: { vm: ViewModel }) {
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
