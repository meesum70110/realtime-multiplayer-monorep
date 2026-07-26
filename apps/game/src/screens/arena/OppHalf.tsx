import { css } from '@/lib/css'
import { MOBILE_CARD_SCALE_CSS } from '@/lib/fabDock'
import type { ViewModel } from '@rpsa/game-core'
import type { CSSProperties } from 'react'

/** The opponent's half of the arena (design lines 967–1011): greyed until the battle
 *  starts, then a face-down card, a masked "typing" indicator, and a lock-in badge.
 *  `stacked` drops absolute side positioning for the mobile vertical arena. */
export function OppHalf({ vm, stacked = false }: { vm: ViewModel; stacked?: boolean }) {
  const halfStyle: CSSProperties = stacked
    ? {
        ...vm.oppHalfStyle,
        position: 'relative',
        right: 'auto',
        top: 'auto',
        width: '100%',
        maxWidth: '100%',
        gap: '6px',
      }
    : vm.oppHalfStyle

  const cardScale = stacked ? MOBILE_CARD_SCALE_CSS : null

  return (
    <div
      data-tut="opp"
      style={
        stacked
          ? {
              ...halfStyle,
              gap: 'clamp(4px, 1vh, 8px)',
              flexShrink: 1,
              minHeight: 0,
              alignItems: 'center',
            }
          : halfStyle
      }
    >
      <div
        style={
          stacked && cardScale
            ? {
                width: `calc(250px * ${cardScale})`,
                height: `calc(330px * ${cardScale})`,
                maxHeight: '22vh',
                position: 'relative',
                flexShrink: 0,
              }
            : css('width: 250px; height: 330px; position: relative;')
        }
      >
        <div
          style={
            stacked && cardScale
              ? {
                  width: 250,
                  height: 330,
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  marginLeft: -125,
                  transform: `scale(${cardScale})`,
                  transformOrigin: 'top center',
                }
              : { width: '100%', height: '100%', position: 'relative' }
          }
        >
          {vm.oppModeSil && (
            <div
              style={css(
                'position: absolute; inset: 0; border-radius: 24px; background: linear-gradient(160deg, #ece0cc, #dccdb2); border: 3px solid #f5e6d3; box-shadow: 0 8px 16px rgba(34,36,42,0.05), 0 20px 40px rgba(34,36,42,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: wobble 2.4s ease-in-out infinite;',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                style={css('width: 150px; height: 150px; opacity: 0.25; filter: blur(2px);')}
                fill="none"
                stroke="#22242a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8"></path>
                <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                <path d="M2 14h2"></path>
                <path d="M20 14h2"></path>
                <path d="M15 13v2"></path>
                <path d="M9 13v2"></path>
              </svg>
              <span style={css('position: absolute; right: 16px; bottom: 14px; font-size: 34px; font-weight: 900; color: rgba(34,36,42,0.35);')}>
                ?
              </span>
            </div>
          )}
          {vm.oppModeCardBack && (
            <div style={vm.lockedBackOpp}>
              <div style={vm.cardBackPat}></div>
              <span style={vm.qOppSm}>?</span>
              {vm.oppLockedFlag && (
                <span
                  style={css(
                    'position: absolute; left: 50%; top: 50%; width: 186px; margin: -22px 0 0 -93px; box-sizing: border-box; text-align: center; background: #22242a; color: #ff8a6e; border: 3px solid #fffdfa; border-radius: 14px; padding: 10px 0; font-size: 15px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 5px 6px 0 rgba(34,36,42,0.22); animation: lockSlam 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) 0.1s both; z-index: 2;',
                  )}
                >
                  Locked ✓
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {vm.oppTyping && (
        <>
          {vm.oppModeDots && !stacked && (
            <div style={css('width: 250px; display: flex; gap: 10px; align-items: center;')}>
              <div
                style={css(
                  'flex: 1; height: 56px; box-sizing: border-box; border-radius: 999px; background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.1); display: flex; align-items: center; padding: 0 24px; gap: 6px; overflow: hidden;',
                )}
              >
                <span style={css('font-size: 12px; letter-spacing: 4px; color: #6b7280; font-weight: 900; white-space: nowrap;')}>
                  {vm.oppDots}
                </span>
                <span
                  style={css(
                    'width: 2px; height: 20px; background: #9ca3af; border-radius: 2px; animation: caretBlink 0.8s step-end infinite; flex-shrink: 0;',
                  )}
                ></span>
              </div>
              <div
                style={css(
                  'width: 56px; height: 56px; box-sizing: border-box; flex-shrink: 0; border-radius: 999px; background: #e8dcc8; color: #8a7a62; border: 3px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.1); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900;',
                )}
              >
                GO
              </div>
            </div>
          )}
          {(vm.oppModeTypingPill || (stacked && vm.oppModeDots)) && (
            <span
              style={css(
                stacked
                  ? 'display: inline-flex; align-items: center; gap: clamp(4px, 1.5vw, 8px); background: #fffdfa; border: 2px solid #22242a; border-radius: 999px; padding: clamp(5px, 1.2vh, 8px) clamp(12px, 4vw, 20px); font-weight: 700; font-size: clamp(11px, 3vw, 14px); color: #6b7280; box-shadow: 2px 3px 0 rgba(34,36,42,0.1); flex-shrink: 0;'
                  : 'display: inline-flex; align-items: center; gap: 8px; background: #fffdfa; border: 2px solid #22242a; border-radius: 999px; padding: 8px 20px; font-weight: 700; font-size: 14px; color: #6b7280; box-shadow: 2px 3px 0 rgba(34,36,42,0.1);',
              )}
            >
              DOOM_BOT is typing
              <span style={css('display: inline-flex; gap: 3px;')}>
                <span style={css('width: 5px; height: 5px; border-radius: 999px; background: #ff6b57; animation: dotBounce 1.1s ease-in-out infinite;')}></span>
                <span style={css('width: 5px; height: 5px; border-radius: 999px; background: #ff6b57; animation: dotBounce 1.1s ease-in-out 0.15s infinite;')}></span>
                <span style={css('width: 5px; height: 5px; border-radius: 999px; background: #ff6b57; animation: dotBounce 1.1s ease-in-out 0.3s infinite;')}></span>
              </span>
            </span>
          )}
        </>
      )}
      {vm.oppLockedFlag && (
        <span
          style={css(
            stacked
              ? 'background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12); color: #e63946; border-radius: 999px; padding: clamp(5px, 1.2vh, 9px) clamp(14px, 4vw, 24px); font-weight: 900; font-size: clamp(10px, 2.8vw, 14px); letter-spacing: 0.12em; text-transform: uppercase; animation: popIn 0.4s ease both; flex-shrink: 0;'
              : 'background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12); color: #e63946; border-radius: 999px; padding: 9px 24px; font-weight: 900; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; animation: popIn 0.4s ease both;',
          )}
        >
          Locked in
        </span>
      )}
    </div>
  )
}
