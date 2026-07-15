import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'

/** Between-round banner for rounds 2+ (design lines 855–877): the round title/tag,
 *  the running you–bot score, and a "get ready" bounce. */
export function RoundBanner() {
  const vm = useView()
  return (
    <div
      data-screen-label="Round Banner"
      style={css('display: flex; flex-direction: column; align-items: center; gap: 22px;')}
    >
      <div
        style={css(
          'position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 34px; padding: 42px 70px 30px; box-shadow: 7px 10px 0 rgba(34,36,42,0.14); display: flex; flex-direction: column; align-items: center; gap: 12px; animation: stampIn 0.4s cubic-bezier(0.2, 1.1, 0.4, 1) both;',
        )}
      >
        <span
          style={css(
            'position: absolute; top: -18px; left: 50%; transform: translateX(-50%) rotate(-2.5deg); background: #ffd233; border: 3px solid #22242a; border-radius: 12px; padding: 6px 16px; font-size: 11.5px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); white-space: nowrap;',
          )}
        >
          {vm.bannerTag}
        </span>
        <span
          style={css(
            'font-size: 96px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #22242a; line-height: 1;',
          )}
        >
          {vm.bannerTitle}
        </span>
        <div style={css('display: flex; align-items: center; gap: 14px; font-size: 32px; font-weight: 900;')}>
          <span style={css('font-size: 11px; letter-spacing: 0.18em; color: #9ca3af; font-weight: 800;')}>YOU</span>
          <span style={css('color: #00b8a9;')}>{vm.youScore}</span>
          <span style={css('color: #d8cbb8; font-size: 22px;')}>–</span>
          <span style={css('color: #e63946;')}>{vm.oppScore}</span>
          <span style={css('font-size: 11px; letter-spacing: 0.18em; color: #9ca3af; font-weight: 800;')}>BOT</span>
        </div>
      </div>
      <div
        style={css(
          'height: 58px; display: flex; align-items: center; justify-content: center; gap: 11px; animation: riseFade 0.35s ease 0.15s both;',
        )}
      >
        <span
          style={css(
            'font-size: 13px; font-weight: 900; letter-spacing: 0.24em; text-transform: uppercase; color: #9ca3af;',
          )}
        >
          Get ready
        </span>
        <span style={css('display: inline-flex; gap: 6px;')}>
          <span style={css('width: 8px; height: 8px; border-radius: 999px; background: #ff6b57; animation: dotBounce 1s ease-in-out infinite;')}></span>
          <span style={css('width: 8px; height: 8px; border-radius: 999px; background: #eeb52f; animation: dotBounce 1s ease-in-out 0.13s infinite;')}></span>
          <span style={css('width: 8px; height: 8px; border-radius: 999px; background: #00c9b8; animation: dotBounce 1s ease-in-out 0.26s infinite;')}></span>
        </span>
      </div>
    </div>
  )
}
