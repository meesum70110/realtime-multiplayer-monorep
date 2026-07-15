import { css } from '@/lib/css'
import type { ViewModel } from '@rpsa/game-core'

/** The verdict panel that resolves a clash (design lines 1130–1144): the animated
 *  headline, the funny flavor line, an outcome badge, and — mid-match — a countdown to
 *  the next round. Rendered inside the clash scene's fixed verdict slot. */
export function VerdictBanner({ vm }: { vm: ViewModel }) {
  return (
    <div
      style={css(
        'display: flex; flex-direction: column; align-items: center; gap: 9px; background: #fffdfa; border: 3px solid #22242a; border-radius: 26px; padding: 18px 34px 16px; margin-top: -26px; position: relative; z-index: 5; box-shadow: 7px 9px 0 rgba(34,36,42,0.14); animation: verdictPop 0.5s cubic-bezier(0.22, 1.2, 0.36, 1) 0.15s both;',
      )}
    >
      <h2
        style={css(
          'margin: 0; font-size: 30px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; text-align: center; max-width: 820px; display: flex; flex-wrap: wrap; justify-content: center; gap: 0 10px;',
        )}
      >
        {vm.headlineWords.map((w, i) => (
          <span key={i} style={w.style}>
            {w.text}
          </span>
        ))}
      </h2>
      <p
        style={css(
          'margin: 0; font-size: 14.5px; font-weight: 700; color: #6b7280; max-width: 600px; text-align: center; line-height: 1.4; animation: riseFade 0.5s ease 0.9s both;',
        )}
      >
        {vm.flavor}
      </p>
      <span style={vm.verdictBadgeStyle}>{vm.verdictBadge}</span>
      {vm.showVerdictCount && (
        <div
          style={css(
            'display: flex; align-items: center; gap: 11px; margin-top: 8px; padding-top: 12px; border-top: 2px dashed #f0e2cd; width: 100%; justify-content: center; animation: riseFade 0.3s ease both;',
          )}
        >
          <span style={css('font-size: 11px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af;')}>
            {vm.verdictNextLabel}
          </span>
          <span style={css('position: relative; width: 46px; height: 34px; display: inline-flex; align-items: center; justify-content: center;')}>
            <span key={vm.verdictCount} style={vm.verdictCountStyle}>
              {vm.verdictCount}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
