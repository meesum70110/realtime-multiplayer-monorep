import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { useIsDesktop } from '@/lib/useBreakpoint'
import { ThrowCard } from '@/components/ThrowCard'
import { Timer } from './Timer'
import { ForgeInput } from './ForgeInput'
import { ArenaBarrier } from './arena/ArenaBarrier'
import { OppHalf } from './arena/OppHalf'

/** The typing phase (design lines 881–1014): a glass barrier splits your half — the live
 *  throw card, forge input and idea chips — from the opponent's, with the countdown timer
 *  perched on the divide.
 *
 *  Mobile (< 768px): opponent on top, compact timer (~160px) in the middle, your throw
 *  card below the timer, and a single ForgeInput pinned at the bottom (no scrollbars). */
export function ArenaScreen() {
  const vm = useView()
  const isDesktop = useIsDesktop()

  if (!isDesktop) {
    return (
      <div
        data-screen-label="Typing Phase"
        style={css(
          'display: flex; flex-direction: column; width: 100%; height: 100%; max-height: 100%; min-height: 0; box-sizing: border-box; overflow: hidden;',
        )}
      >
        <div
          style={css(
            'flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; gap: clamp(4px, 1.2vh, 10px); padding: clamp(2px, 0.8vh, 6px) 0; box-sizing: border-box;',
          )}
        >
          <OppHalf vm={vm} stacked />
          <Timer vm={vm} stacked />
          <ThrowCard vm={vm} compact />
        </div>

        {vm.youUnlocked && (
          <div
            style={css(
              'flex-shrink: 0; width: 100%; box-sizing: border-box; padding: clamp(6px, 1.5vh, 10px) clamp(10px, 3vw, 14px) clamp(4px, 1vh, 8px); background: #fdf3e5; display: flex; flex-direction: column; align-items: stretch; justify-content: flex-end; gap: 0; z-index: 6;',
            )}
          >
            <ForgeInput vm={vm} />
          </div>
        )}

        {vm.youLocked && (
          <div
            style={css(
              'flex-shrink: 0; width: 100%; box-sizing: border-box; padding: clamp(8px, 1.8vh, 14px) clamp(12px, 4vw, 20px) clamp(10px, 2vh, 16px); background: #fdf3e5; display: flex; align-items: center; justify-content: center; z-index: 6;',
            )}
          >
            <span
              style={css(
                'background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12); color: #00857a; border-radius: 999px; padding: clamp(7px, 1.6vh, 10px) clamp(16px, 5vw, 28px); font-weight: 900; font-size: clamp(11px, 3.2vw, 14px); letter-spacing: 0.12em; text-transform: uppercase; animation: popIn 0.4s ease both; text-align: center; max-width: 100%; box-sizing: border-box;',
              )}
            >
              Locked in — waiting…
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div data-screen-label="Typing Phase" style={css('display: flex; flex-direction: column; align-items: center; width: 100%;')}>
      <div style={css('position: relative; width: 1000px; height: 490px;')}>
        <div
          style={css(
            'position: absolute; left: 50%; bottom: -22px; width: 700px; height: 36px; margin-left: -350px; border-radius: 999px; background: radial-gradient(ellipse, rgba(34,36,42,0.15) 0%, rgba(34,36,42,0) 70%);',
          )}
        ></div>

        <ArenaBarrier vm={vm} />

        {vm.crackFlashOn && <div key={vm.crackTick} style={vm.crackFlashStyle}></div>}
        <Timer vm={vm} />

        <div
          style={css(
            'position: absolute; left: 20px; top: 0; width: 360px; display: flex; flex-direction: column; align-items: center; gap: 15px; animation: riseFade 0.4s ease both;',
          )}
        >
          <ThrowCard vm={vm} />
          {vm.youUnlocked && <ForgeInput vm={vm} />}
          {vm.youLocked && (
            <span
              style={css(
                'background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12); color: #00857a; border-radius: 999px; padding: 9px 24px; font-weight: 900; font-size: 14px; letter-spacing: 0.12em; text-transform: uppercase; animation: popIn 0.4s ease both;',
              )}
            >
              Locked in — waiting…
            </span>
          )}
        </div>

        <OppHalf vm={vm} />
      </div>
      <div style={css('height: 110px;')}></div>
    </div>
  )
}
