import { css } from '@/lib/css'
import { MOBILE_CARD_SCALE_CSS } from '@/lib/fabDock'
import type { ViewModel } from '@rpsa/game-core'

/** Your throw card slot (design lines 921–940): a face-down "Locked ✓" back once you've
 *  committed, or the live preview card that mirrors what you're typing (emoji + word).
 *  `compact` scales for the mobile arena column (max ~22vh, cap 0.75). */
export function ThrowCard({ vm, compact = false }: { vm: ViewModel; compact?: boolean }) {
  const scale = MOBILE_CARD_SCALE_CSS

  return (
    <div
      style={
        compact
          ? {
              width: `calc(250px * ${scale})`,
              height: `calc(330px * ${scale})`,
              maxHeight: '22vh',
              position: 'relative',
              flexShrink: 0,
            }
          : css('width: 250px; height: 330px; position: relative;')
      }
    >
      <div
        style={
          compact
            ? {
                width: 250,
                height: 330,
                position: 'absolute',
                left: '50%',
                top: 0,
                marginLeft: -125,
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
              }
            : { width: '100%', height: '100%', position: 'relative' }
        }
      >
        {vm.youLocked && (
          <div style={vm.lockedBackYou}>
            <div style={vm.cardBackPat}></div>
            <span style={vm.qYouSm}>?</span>
            <span
              style={css(
                'position: absolute; left: 50%; top: 50%; width: 186px; margin: -22px 0 0 -93px; box-sizing: border-box; text-align: center; background: #22242a; color: #ffd233; border: 3px solid #fffdfa; border-radius: 14px; padding: 10px 0; font-size: 15px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 5px 6px 0 rgba(34,36,42,0.22); animation: lockSlam 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) 0.1s both; z-index: 2;',
              )}
            >
              Locked ✓
            </span>
          </div>
        )}
        {vm.youUnlocked && (
          <div style={vm.previewCardStyle}>
            <div style={vm.cardTex}></div>
            <div style={vm.cardGloss}></div>
            <div style={css('position: absolute; inset: 0; overflow: hidden; border-radius: 24px; pointer-events: none;')}>
              <div
                style={css(
                  'position: absolute; top: 0; bottom: 0; width: 55%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: sheenSweep 3.2s ease-in-out infinite;',
                )}
              ></div>
            </div>
            <span style={vm.cardSpark}>✦</span>
            <span style={vm.cardTab}>Your throw</span>
            <span style={vm.cardMedal}>
              <span style={css('display: inline-block; animation: emojiBob 2.6s ease-in-out infinite;')}>
                <span style={vm.liveEmojiStyle}>{vm.liveEmoji}</span>
              </span>
            </span>
            <span style={vm.cardPlate}>
              <span style={vm.forgeWordStyle}>{vm.forgeWord}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
