import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { useIsDesktop } from '@/lib/useBreakpoint'

/** Between-round banner for rounds 2+ (design lines 855–877): the round title/tag,
 *  the running you–bot score, and a "get ready" bounce. */
export function RoundBanner() {
  const vm = useView()
  const isDesktop = useIsDesktop()
  return (
    <div
      data-screen-label="Round Banner"
      style={css(
        isDesktop
          ? 'display: flex; flex-direction: column; align-items: center; gap: 22px;'
          : 'display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 18px; width: 100%; max-width: 100vw; box-sizing: border-box; padding: 16px; flex: 1; min-height: 0;',
      )}
    >
      <div
        style={css(
          isDesktop
            ? 'position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 34px; padding: 42px 70px 30px; box-shadow: 7px 10px 0 rgba(34,36,42,0.14); display: flex; flex-direction: column; align-items: center; gap: 12px; animation: stampIn 0.4s cubic-bezier(0.2, 1.1, 0.4, 1) both;'
            : 'position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 28px; padding: 52px 20px 24px; box-shadow: 7px 10px 0 rgba(34,36,42,0.14); display: flex; flex-direction: column; align-items: center; gap: 12px; animation: stampIn 0.4s cubic-bezier(0.2, 1.1, 0.4, 1) both; width: 100%; max-width: 95vw; box-sizing: border-box;',
        )}
      >
        <span
          style={css(
            isDesktop
              ? 'position: absolute; top: -18px; left: 50%; transform: translateX(-50%) rotate(-2.5deg); background: #ffd233; border: 3px solid #22242a; border-radius: 12px; padding: 6px 16px; font-size: 11.5px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); white-space: nowrap;'
              : 'position: absolute; top: -18px; left: 50%; transform: translateX(-50%) rotate(-2.5deg); background: #ffd233; border: 3px solid #22242a; border-radius: 12px; padding: 6px 16px; font-size: 11.5px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); white-space: nowrap; margin-bottom: 14px; z-index: 2;',
          )}
        >
          {vm.bannerTag}
        </span>
        <span
          style={css(
            isDesktop
              ? 'font-size: 96px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #22242a; line-height: 1;'
              : 'font-size: clamp(3rem, 12vw, 8rem); font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #22242a; line-height: 1; max-width: 95vw; text-align: center; box-sizing: border-box; margin-top: 6px;',
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
