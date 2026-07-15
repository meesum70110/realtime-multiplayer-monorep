import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** In-game scoreboard header (design lines 468–546): the two player cards with their
 *  round pips and used-throw chips flanking the round label, format, and exit button. */
export function Scoreboard() {
  const vm = useView()
  return (
    <header
      style={css(
        'display: flex; align-items: center; justify-content: space-between; padding: 20px 40px 8px; gap: 24px; position: relative; z-index: 6;',
      )}
    >
      <div style={css('flex: 1; display: flex; justify-content: flex-start;')}>
        <Pressable
          as="div"
          onClick={vm.onProfileYou}
          baseStyle={css(
            'display: flex; align-items: center; gap: 12px; background: #fffdfa; border-radius: 18px; padding: 8px 18px 8px 9px; cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.07);',
          )}
          hoverStyle={css(
            'transform: translateY(-3px); box-shadow: 0 4px 10px rgba(34,36,42,0.08), 0 16px 34px rgba(34,36,42,0.12), 0 0 0 2.5px rgba(0,184,169,0.4);',
          )}
        >
          <span
            style={css(
              'width: 46px; height: 46px; border-radius: 999px; background: #fbf1e4; box-shadow: 0 2px 8px rgba(34,36,42,0.06), 0 0 0 3px rgba(0,184,169,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
            )}
          >
            <svg viewBox="0 0 64 64" style={css('width: 30px; height: 30px;')} aria-label="Your avatar">
              <defs>
                <linearGradient id="skinA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5eead4"></stop>
                  <stop offset="100%" stopColor="#14b8a6"></stop>
                </linearGradient>
              </defs>
              <line x1="22" y1="14" x2="18" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <line x1="42" y1="14" x2="46" y2="4" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round"></line>
              <circle cx="18" cy="4" r="3" fill="#f472b6"></circle>
              <circle cx="46" cy="4" r="3" fill="#f472b6"></circle>
              <ellipse cx="32" cy="34" rx="22" ry="24" fill="url(#skinA)"></ellipse>
              <ellipse cx="24" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <ellipse cx="40" cy="32" rx="7" ry="9" fill="#fff"></ellipse>
              <circle cx="25" cy="33" r="4" fill="#1e293b"></circle>
              <circle cx="41" cy="33" r="4" fill="#1e293b"></circle>
              <path d="M 24 44 Q 32 50 40 44" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          </span>
          <div style={css('display: flex; flex-direction: column; gap: 5px;')}>
            <div style={css('display: flex; align-items: center; gap: 8px;')}>
              <span style={css('font-weight: 900; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase;')}>
                {vm.playerName}
              </span>
              <span style={css('font-size: 15px;')}>{vm.youFlag}</span>
            </div>
            <div style={css('display: flex; align-items: flex-start; gap: 12px;')}>
              <div style={css('display: flex; gap: 7px; padding-top: 5px;')}>
                {vm.youPips.map((pip, i) => (
                  <span key={i} style={pip.style}></span>
                ))}
              </div>
              <div style={css('display: flex; gap: 8px;')}>
                {vm.youUsed.map((u, i) => (
                  <Pressable
                    key={i}
                    as="span"
                    baseStyle={u.style}
                    hoverStyle={css('transform: translateY(-2px) scale(1.1);')}
                    data-tip={u.word}
                  >
                    <span style={css('font-size: 15px; line-height: 1;')}>{u.emoji}</span>
                    <span style={u.markStyle}>{u.mark}</span>
                  </Pressable>
                ))}
              </div>
            </div>
          </div>
        </Pressable>
      </div>

      <div data-tut="score" style={css('display: flex; flex-direction: column; align-items: center; gap: 9px; min-width: 180px;')}>
        <span
          style={css(
            'display: inline-flex; align-items: center; gap: 8px; background: #fffdfa; border: 2.5px solid #22242a; border-radius: 999px; padding: 8px 22px; font-weight: 900; font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; color: #22242a; box-shadow: 3px 4px 0 rgba(34,36,42,0.12);',
          )}
        >
          {vm.roundLabel}
        </span>
        <span style={css('font-size: 10.5px; font-weight: 800; letter-spacing: 0.18em; color: #9ca3af; text-transform: uppercase;')}>
          {vm.formatLabel}
        </span>
        <Pressable
          as="button"
          onClick={vm.onExit}
          baseStyle={css(
            "display: inline-flex; align-items: center; gap: 7px; background: #fbf1e4; border: none; border-radius: 999px; padding: 7px 15px 7px 9px; font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #8a7a62; cursor: pointer; transition: all 0.15s ease; margin-top: 3px;",
          )}
          hoverStyle={css('color: #e63946; background: rgba(230,57,70,0.1); transform: translateY(-1px);')}
        >
          <span
            style={css(
              'width: 20px; height: 20px; border-radius: 999px; background: rgba(230,57,70,0.14); display: inline-flex; align-items: center; justify-content: center;',
            )}
          >
            <svg viewBox="0 0 24 24" style={css('width: 11px; height: 11px;')} fill="none" stroke="#e63946" strokeWidth="3.2" strokeLinecap="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </span>
          Exit match
        </Pressable>
      </div>

      <div style={css('flex: 1; display: flex; justify-content: flex-end;')}>
        <Pressable
          as="div"
          onClick={vm.onProfileOpp}
          baseStyle={css(
            'display: flex; align-items: center; gap: 12px; flex-direction: row-reverse; background: #fffdfa; border-radius: 18px; padding: 8px 9px 8px 18px; cursor: pointer; transition: transform 0.14s ease, box-shadow 0.14s ease; box-shadow: 0 2px 8px rgba(34,36,42,0.04), 0 12px 28px rgba(34,36,42,0.07);',
          )}
          hoverStyle={css(
            'transform: translateY(-3px); box-shadow: 0 4px 10px rgba(34,36,42,0.08), 0 16px 34px rgba(34,36,42,0.12), 0 0 0 2.5px rgba(255,77,109,0.4);',
          )}
        >
          <span
            style={css(
              'width: 46px; height: 46px; border-radius: 999px; background: #fbf1e4; box-shadow: 0 2px 8px rgba(34,36,42,0.06), 0 0 0 3px rgba(255,77,109,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
            )}
          >
            <svg
              viewBox="0 0 24 24"
              style={css('width: 24px; height: 24px;')}
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
          <div style={css('display: flex; flex-direction: column; gap: 5px; align-items: flex-end;')}>
            <div style={css('display: flex; align-items: center; gap: 8px;')}>
              <span style={css('font-size: 15px;')}>{vm.oppFlag}</span>
              <span style={css('font-weight: 900; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase;')}>
                DOOM_BOT
              </span>
            </div>
            <div style={css('display: flex; align-items: flex-start; gap: 12px; flex-direction: row-reverse;')}>
              <div style={css('display: flex; gap: 7px; flex-direction: row-reverse; padding-top: 5px;')}>
                {vm.oppPips.map((pip, i) => (
                  <span key={i} style={pip.style}></span>
                ))}
              </div>
              <div style={css('display: flex; gap: 8px; flex-direction: row-reverse;')}>
                {vm.oppUsed.map((u, i) => (
                  <Pressable
                    key={i}
                    as="span"
                    baseStyle={u.style}
                    hoverStyle={css('transform: translateY(-2px) scale(1.1);')}
                    data-tip={u.word}
                  >
                    <span style={css('font-size: 15px; line-height: 1;')}>{u.emoji}</span>
                    <span style={u.markStyle}>{u.mark}</span>
                  </Pressable>
                ))}
              </div>
            </div>
          </div>
        </Pressable>
      </div>
    </header>
  )
}
