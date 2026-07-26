import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import { useIsWideDesktop } from '@/lib/useBreakpoint'
import { MenuLeaderboard } from './menu/MenuLeaderboard'
import { MenuLogo } from './menu/MenuLogo'
import { MenuActions } from './menu/MenuActions'
import { MenuLiveClashes } from './menu/MenuLiveClashes'

/** Main menu (design lines 552–717).
 *
 *  Wide desktop (>= 1100px): three-column hub inside FitStage(1280).
 *  Phone + mid widths: stacked column; sizes use clamp() so they grow/shrink
 *  smoothly between phone and tablet before the wide desktop layout kicks in. */
export function MenuScreen() {
  const vm = useView()
  const isWideDesktop = useIsWideDesktop()

  const centerColumn = (
    <div
      style={css(
        isWideDesktop
          ? 'flex: 1 1 380px; max-width: 452px; display: flex; flex-direction: column; align-items: center; gap: 26px;'
          : 'width: 100%; max-width: min(100%, 520px); margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: clamp(18px, 4vw, 28px);',
      )}
    >
      <MenuLogo vm={vm} />
      <MenuActions vm={vm} />
    </div>
  )

  return (
    <div
      data-screen-label="Main Menu"
      style={css(
        isWideDesktop
          ? 'width: 100%; max-width: 1280px; display: flex; flex-direction: column; align-items: center; gap: 30px; animation: riseFade 0.5s ease both;'
          : 'width: 100%; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: stretch; gap: clamp(18px, 3.5vw, 32px); padding: 4px clamp(0px, 1vw, 8px) clamp(20px, 4vw, 36px); animation: riseFade 0.5s ease both;',
      )}
    >
      <div
        style={css(
          isWideDesktop
            ? 'width: 100%; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; animation: riseFade 0.45s ease both;'
            : 'display: flex; justify-content: space-between; align-items: stretch; width: 100%; gap: clamp(8px, 2.5vw, 16px); box-sizing: border-box; animation: riseFade 0.45s ease both;',
        )}
      >
        <div
          style={css(
            isWideDesktop
              ? 'background: #fffdfa; border-radius: 20px; padding: 12px 20px; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: 12px;'
              : 'background: #fffdfa; border-radius: clamp(14px, 3vw, 18px); padding: clamp(7px, 1.8vw, 12px) clamp(10px, 2.5vw, 16px); box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: clamp(6px, 1.5vw, 10px); flex: 0 1 auto; max-width: min(58%, 280px); min-width: 0; box-sizing: border-box;',
          )}
        >
          <span
            style={css(
              'width: 11px; height: 11px; border-radius: 999px; background: #2ecc71; animation: pulseDot 1.8s ease-out infinite; flex-shrink: 0;',
            )}
          ></span>
          <div style={css('display: flex; flex-direction: column; gap: 2px; min-width: 0;')}>
            <span
              style={css(
                isWideDesktop
                  ? 'font-weight: 800; font-size: 14px;'
                  : 'font-weight: 800; font-size: clamp(11px, 3.2vw, 14px); white-space: nowrap;',
              )}
            >
              {vm.playersOnline} playing now
            </span>
            <span
              style={css(
                isWideDesktop
                  ? 'font-size: 10px; letter-spacing: 0.18em; color: #9ca3af; font-weight: 800; text-transform: uppercase;'
                  : 'font-size: clamp(8px, 2.2vw, 10px); letter-spacing: 0.14em; color: #9ca3af; font-weight: 800; text-transform: uppercase;',
              )}
            >
              Live arena
            </span>
          </div>
        </div>
        <Pressable
          as="div"
          onClick={vm.onProfileYou}
          baseStyle={css(
            isWideDesktop
              ? 'background: #fffdfa; border-radius: 20px; padding: 10px 18px; cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: 12px;'
              : 'background: #fffdfa; border-radius: clamp(14px, 3vw, 18px); padding: clamp(7px, 1.8vw, 12px) clamp(10px, 2.5vw, 16px); cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: clamp(6px, 1.5vw, 10px); flex: 0 1 auto; max-width: min(42%, 240px); min-width: 0; box-sizing: border-box;',
          )}
          hoverStyle={css(
            'transform: translateY(-3px); box-shadow: 0 4px 10px rgba(34,36,42,0.08), 0 16px 34px rgba(34,36,42,0.12), 0 0 0 2.5px rgba(0,184,169,0.4);',
          )}
        >
          <span
            style={css(
              isWideDesktop
                ? 'width: 44px; height: 44px; border-radius: 999px; background: #fbf1e4; display: flex; align-items: center; justify-content: center; flex-shrink: 0;'
                : 'width: clamp(32px, 8vw, 42px); height: clamp(32px, 8vw, 42px); border-radius: 999px; background: #fbf1e4; display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
            )}
          >
            <svg
              viewBox="0 0 64 64"
              style={css(
                isWideDesktop
                  ? 'width: 30px; height: 30px;'
                  : 'width: clamp(20px, 5.5vw, 28px); height: clamp(20px, 5.5vw, 28px);',
              )}
              aria-label="Guest avatar"
            >
              <defs>
                <linearGradient id="skinM" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4"></stop>
                  <stop offset="100%" stopColor="#14b8a6"></stop>
                </linearGradient>
              </defs>
              <line x1="22" y1="14" x2="18" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <line x1="42" y1="14" x2="46" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <circle cx="18" cy="4" r="3" fill="#f472b6"></circle>
              <circle cx="46" cy="4" r="3" fill="#f472b6"></circle>
              <ellipse cx="32" cy="34" rx="22" ry="24" fill="url(#skinM)"></ellipse>
              <ellipse cx="24" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <ellipse cx="40" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <circle cx="25" cy="33" r="4" fill="#1e293b"></circle>
              <circle cx="41" cy="33" r="4" fill="#1e293b"></circle>
              <path d="M 24 44 Q 32 50 40 44" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          </span>
          <div style={css('display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1 1 auto;')}>
            <span
              style={css(
                isWideDesktop
                  ? 'font-weight: 900; font-size: 14px; color: #22242a;'
                  : 'font-weight: 900; font-size: clamp(11px, 3vw, 14px); color: #22242a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
              )}
            >
              Alex Rivera
            </span>
            <span
              style={css(
                isWideDesktop
                  ? 'font-size: 12px; font-weight: 700; color: #9ca3af;'
                  : 'font-size: clamp(9px, 2.4vw, 12px); font-weight: 700; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
              )}
            >
              @alexr
            </span>
          </div>
          {isWideDesktop && (
            <span
              style={css(
                'display: inline-flex; align-items: center; gap: 6px; background: #fbf1e4; border-radius: 999px; padding: 6px 13px; font-weight: 800; font-size: 12px; color: #22242a;',
              )}
            >
              <span style={css('font-size: 15px;')}>🇺🇸</span>USA
            </span>
          )}
        </Pressable>
      </div>

      {isWideDesktop ? (
        <div
          style={css(
            'width: 100%; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: 30px;',
          )}
        >
          <MenuLeaderboard vm={vm} style={css('flex: 1 1 320px; max-width: 268px;')} />
          {centerColumn}
          <MenuLiveClashes vm={vm} style={css('flex: 1 1 320px; max-width: 268px;')} />
        </div>
      ) : (
        <div
          style={css(
            'width: 100%; display: flex; flex-direction: column; align-items: stretch; gap: clamp(22px, 4vw, 36px);',
          )}
        >
          {centerColumn}
          <MenuLiveClashes vm={vm} style={css('width: 100%; max-width: min(100%, 560px); margin: 0 auto;')} />
          <MenuLeaderboard vm={vm} style={css('width: 100%; max-width: min(100%, 560px); margin: 0 auto;')} />
        </div>
      )}
    </div>
  )
}
