import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { ThrowCard } from '@/components/ThrowCard'
import { Timer } from './Timer'
import { ForgeInput } from './ForgeInput'
import { ArenaBarrier } from './arena/ArenaBarrier'
import { OppHalf } from './arena/OppHalf'

/** The typing phase (design lines 881–1014): a glass barrier splits your half — the live
 *  throw card, forge input and idea chips — from the opponent's, with the countdown timer
 *  perched on the divide. */
export function ArenaScreen() {
  const vm = useView()
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
