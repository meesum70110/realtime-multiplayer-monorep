import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import { MenuLeaderboard } from './menu/MenuLeaderboard'
import { MenuLogo } from './menu/MenuLogo'
import { MenuActions } from './menu/MenuActions'
import { MenuLiveClashes } from './menu/MenuLiveClashes'

/** Main menu (design lines 552–717): a live-players + profile top bar over a three-column
 *  hub — Top Weapons leaderboard, the logo/CTA/nav center, and the live clashes feed. */
export function MenuScreen() {
  const vm = useView()
  return (
    <div
      data-screen-label="Main Menu"
      style={css(
        'width: 100%; max-width: 1280px; display: flex; flex-direction: column; align-items: center; gap: 30px; animation: riseFade 0.5s ease both;',
      )}
    >
      <div
        style={css(
          'width: 100%; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; animation: riseFade 0.45s ease both;',
        )}
      >
        <div
          style={css(
            'background: #fffdfa; border-radius: 20px; padding: 12px 20px; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: 12px;',
          )}
        >
          <span
            style={css(
              'width: 11px; height: 11px; border-radius: 999px; background: #2ecc71; animation: pulseDot 1.8s ease-out infinite; flex-shrink: 0;',
            )}
          ></span>
          <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
            <span style={css('font-weight: 800; font-size: 14px;')}>{vm.playersOnline} playing now</span>
            <span
              style={css(
                'font-size: 10px; letter-spacing: 0.18em; color: #9ca3af; font-weight: 800; text-transform: uppercase;',
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
            'background: #fffdfa; border-radius: 20px; padding: 10px 18px; cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.06); display: flex; align-items: center; gap: 12px;',
          )}
          hoverStyle={css(
            'transform: translateY(-3px); box-shadow: 0 4px 10px rgba(34,36,42,0.08), 0 16px 34px rgba(34,36,42,0.12), 0 0 0 2.5px rgba(0,184,169,0.4);',
          )}
        >
          <span
            style={css(
              'width: 44px; height: 44px; border-radius: 999px; background: #fbf1e4; display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
            )}
          >
            <svg viewBox="0 0 64 64" style={css('width: 30px; height: 30px;')} aria-label="Guest avatar">
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
          <div style={css('display: flex; flex-direction: column; gap: 2px;')}>
            <span style={css('font-weight: 900; font-size: 14px; color: #22242a;')}>Alex Rivera</span>
            <span style={css('font-size: 12px; font-weight: 700; color: #9ca3af;')}>@alexr</span>
          </div>
          <span
            style={css(
              'display: inline-flex; align-items: center; gap: 6px; background: #fbf1e4; border-radius: 999px; padding: 6px 13px; font-weight: 800; font-size: 12px; color: #22242a;',
            )}
          >
            <span style={css('font-size: 15px;')}>🇺🇸</span>USA
          </span>
        </Pressable>
      </div>

      <div
        style={css(
          'width: 100%; display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 30px;',
        )}
      >
        <MenuLeaderboard vm={vm} />
        <div
          style={css(
            'flex: 1 1 380px; min-width: 380px; max-width: 452px; display: flex; flex-direction: column; align-items: center; gap: 26px;',
          )}
        >
          <MenuLogo vm={vm} />
          <MenuActions vm={vm} />
        </div>
        <MenuLiveClashes vm={vm} />
      </div>
    </div>
  )
}
