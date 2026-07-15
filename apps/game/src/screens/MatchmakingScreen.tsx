import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Matchmaking (design lines 719–792): a spinner "finding an opponent" state that
 *  resolves into the you-vs-DOOM_BOT face-off with a match-start countdown. */
export function MatchmakingScreen() {
  const vm = useView()
  return (
    <div
      data-screen-label="Matchmaking"
      style={css('display: flex; flex-direction: column; align-items: center; gap: 24px;')}
    >
      {vm.searchIsSearching && (
        <div
          style={css(
            'display: flex; flex-direction: column; align-items: center; gap: 24px; animation: riseFade 0.4s ease both;',
          )}
        >
          <div
            style={css(
              'width: 78px; height: 78px; border-radius: 999px; border: 6px solid #f5e6d3; border-top-color: #ef4f3c; animation: spin 0.8s linear infinite;',
            )}
          ></div>
          <h2
            style={css(
              'margin: 0; font-size: 34px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em;',
            )}
          >
            Finding an opponent…
          </h2>
          <p style={css('margin: 0; font-size: 15px; font-weight: 700; color: #6b7280;')}>
            {vm.playersOnline} players in the arena
          </p>
          <Pressable
            as="button"
            onClick={vm.onCancelSearch}
            baseStyle={css(
              "background: #fffdfa; color: #22242a; border: none; border-radius: 999px; padding: 12px 30px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(34,36,42,0.05), 0 12px 28px rgba(34,36,42,0.08); transition: transform 0.12s ease;",
            )}
            hoverStyle={css('transform: translateY(-2px);')}
          >
            Cancel
          </Pressable>
        </div>
      )}

      {vm.searchIsFound && (
        <div
          data-screen-label="Face-off"
          style={css('display: flex; flex-direction: column; align-items: center; gap: 22px;')}
        >
          <div
            style={css(
              'display: inline-flex; align-items: center; gap: 11px; background: #22242a; color: #fffdfa; border-radius: 999px; padding: 11px 30px; font-weight: 900; font-size: 16px; letter-spacing: 0.2em; text-transform: uppercase; box-shadow: 4px 6px 0 rgba(34,36,42,0.16); animation: slamIn 0.5s cubic-bezier(0.22, 1.4, 0.36, 1) both;',
            )}
          >
            <span
              style={css(
                'width: 10px; height: 10px; border-radius: 999px; background: #57c94f; animation: pulseDot 1.6s ease-out infinite;',
              )}
            ></span>
            Match Found
          </div>

          <div style={css('display: flex; align-items: center; justify-content: center; gap: 28px;')}>
            <div
              style={css(
                'position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 30px; padding: 28px 22px 20px; box-shadow: 6px 9px 0 rgba(34,36,42,0.14); display: flex; flex-direction: column; align-items: center; gap: 11px; width: 246px; box-sizing: border-box; animation: faceoffL 0.55s cubic-bezier(0.25, 1.1, 0.4, 1) both;',
              )}
            >
              <span
                style={css(
                  'position: absolute; top: -15px; left: 50%; transform: translateX(-50%) rotate(-2.5deg); background: #00c9b8; border: 3px solid #22242a; border-radius: 11px; padding: 5px 16px; font-size: 11px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: #06312d; box-shadow: 2px 3px 0 rgba(34,36,42,0.16); white-space: nowrap;',
                )}
              >
                You
              </span>
              <span
                style={css(
                  'width: 96px; height: 96px; border-radius: 999px; background: #fbf1e4; border: 3px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.14); display: flex; align-items: center; justify-content: center; margin-top: 6px;',
                )}
              >
                <svg viewBox="0 0 64 64" style={css('width: 58px; height: 58px;')} aria-label="Your avatar">
                  <defs>
                    <linearGradient id="skinF" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5eead4"></stop>
                      <stop offset="100%" stopColor="#14b8a6"></stop>
                    </linearGradient>
                  </defs>
                  <line x1="22" y1="14" x2="18" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
                  <line x1="42" y1="14" x2="46" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
                  <circle cx="18" cy="4" r="3" fill="#f472b6"></circle>
                  <circle cx="46" cy="4" r="3" fill="#f472b6"></circle>
                  <ellipse cx="32" cy="34" rx="22" ry="24" fill="url(#skinF)"></ellipse>
                  <ellipse cx="24" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
                  <ellipse cx="40" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
                  <circle cx="25" cy="33" r="4" fill="#1e293b"></circle>
                  <circle cx="41" cy="33" r="4" fill="#1e293b"></circle>
                  <path d="M 24 44 Q 32 50 40 44" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
              </span>
              <span
                style={css(
                  'font-weight: 900; font-size: 21px; letter-spacing: 0.05em; text-transform: uppercase; color: #22242a;',
                )}
              >
                {vm.playerName}
              </span>
              <div style={css('display: flex; align-items: center; gap: 8px; background: #fbf5ec; border-radius: 999px; padding: 5px 14px;')}>
                <span style={css('font-size: 22px; line-height: 1;')}>{vm.youFlag}</span>
                <span style={css('font-size: 13px; font-weight: 800; color: #6b7280;')}>{vm.youCountryName}</span>
              </div>
            </div>

            <div style={css('position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 96px;')}>
              <div
                style={css(
                  'position: absolute; left: 50%; top: 50%; width: 128px; height: 128px; margin: -64px 0 0 -64px; border-radius: 999px; border: 3px solid rgba(255,210,51,0.5); animation: glowRing 1.6s ease-out 0.5s infinite both; pointer-events: none;',
                )}
              ></div>
              <div
                style={css(
                  'position: relative; z-index: 2; width: 90px; height: 90px; border-radius: 24px; background: #ffd233; border: 3.5px solid #22242a; box-shadow: 4px 6px 0 rgba(34,36,42,0.18); display: flex; align-items: center; justify-content: center; transform: rotate(-7deg); animation: slamIn 0.5s cubic-bezier(0.22, 1.4, 0.36, 1) 0.26s both;',
                )}
              >
                <span style={css('font-size: 38px; font-weight: 900; color: #22242a; line-height: 1; display: block; text-align: center;')}>
                  VS
                </span>
              </div>
            </div>

            <div
              style={css(
                'position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 30px; padding: 28px 22px 20px; box-shadow: 6px 9px 0 rgba(34,36,42,0.14); display: flex; flex-direction: column; align-items: center; gap: 11px; width: 246px; box-sizing: border-box; animation: faceoffR 0.55s cubic-bezier(0.25, 1.1, 0.4, 1) both;',
              )}
            >
              <span
                style={css(
                  'position: absolute; top: -15px; left: 50%; transform: translateX(-50%) rotate(2.5deg); background: #ff4d6d; border: 3px solid #22242a; border-radius: 11px; padding: 5px 16px; font-size: 11px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: #fffdfa; box-shadow: 2px 3px 0 rgba(34,36,42,0.16); white-space: nowrap;',
                )}
              >
                Rival
              </span>
              <span
                style={css(
                  'width: 96px; height: 96px; border-radius: 999px; background: #fbf1e4; border: 3px solid #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.14); display: flex; align-items: center; justify-content: center; margin-top: 6px;',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  style={css('width: 48px; height: 48px;')}
                  fill="none"
                  stroke="#22242a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Bot avatar"
                >
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
              </span>
              <span
                style={css(
                  'font-weight: 900; font-size: 21px; letter-spacing: 0.05em; text-transform: uppercase; color: #22242a;',
                )}
              >
                DOOM_BOT
              </span>
              <div style={css('display: flex; align-items: center; gap: 8px; background: #fbf5ec; border-radius: 999px; padding: 5px 14px;')}>
                <span style={css('font-size: 22px; line-height: 1;')}>{vm.oppFlag}</span>
                <span style={css('font-size: 13px; font-weight: 800; color: #6b7280;')}>{vm.oppCountryName}</span>
              </div>
            </div>
          </div>

          <div style={css('height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 4px;')}>
            {vm.showMatchCount && (
              <>
                <span style={css('font-size: 12px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; color: #9ca3af;')}>
                  Match begins in
                </span>
                <span style={css('position: relative; width: 76px; height: 76px; display: inline-flex; align-items: center; justify-content: center;')}>
                  <span key={vm.matchCount} style={vm.matchCountStyle}>
                    {vm.matchCount}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
