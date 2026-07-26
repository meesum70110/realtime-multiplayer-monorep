import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { useIsDesktop } from '@/lib/useBreakpoint'

/** Round-1 chant (design lines 795–852): "Type anything · Best throw wins" over a
 *  cycling reveal of Rock → Paper → Scissors → the morphing "ANYTHING!" card. */
export function RoundIntro() {
  const vm = useView()
  const isDesktop = useIsDesktop()
  return (
    <div
      data-screen-label="Round Intro"
      style={css(
        isDesktop
          ? 'display: flex; flex-direction: column; align-items: center; gap: 18px;'
          : 'display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; max-width: 100vw; min-height: 100%; height: 100%; flex: 1; box-sizing: border-box; padding: 20px 16px; gap: 14px; overflow-x: hidden;',
      )}
    >
      <p
        style={css(
          isDesktop
            ? 'margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: #9ca3af; animation: riseFade 0.5s ease 0.15s both; text-align: center;'
            : 'margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #9ca3af; animation: riseFade 0.5s ease 0.15s both; text-align: center; max-width: 100%; padding: 0 8px;',
        )}
      >
        Type anything · Best throw wins
      </p>
      <div
        style={css(
          isDesktop
            ? 'height: 350px; display: flex; align-items: center; justify-content: center; margin-top: 4px;'
            : 'min-height: 280px; display: flex; align-items: center; justify-content: center; margin-top: 4px; width: 100%;',
        )}
      >
        {vm.beatRock && (
          <div style={css('display: flex; flex-direction: column; align-items: center; gap: 26px;')}>
            <div style={css('transform: rotate(-6deg);')}>
              <div
                style={css(
                  'width: 150px; height: 150px; border-radius: 30px; background: #ff4d6d; box-shadow: 0 24px 50px rgba(255,77,109,0.4); display: flex; align-items: center; justify-content: center; animation: beatDrop 0.6s cubic-bezier(0.25, 1.2, 0.4, 1) both;',
                )}
              >
                <svg viewBox="0 0 48 48" style={css('width: 86px; height: 86px;')}>
                  <path
                    d="M10 30 C8 24 12 16 20 14 C24 10 32 12 36 18 C40 24 38 32 30 36 C22 40 12 38 10 30 Z"
                    fill="#1a1a1a"
                  ></path>
                  <path
                    d="M18 22 C19 20 22 19 24 21 C26 19 29 20 30 22 C31 24 29 27 26 27 C23 27 17 25 18 22 Z"
                    fill="#333"
                    opacity="0.5"
                  ></path>
                </svg>
              </div>
            </div>
            <span
              style={css(
                'font-size: 62px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #e63946; animation: stampIn 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) 0.12s both;',
              )}
            >
              Rock
            </span>
          </div>
        )}

        {vm.beatPaper && (
          <div style={css('display: flex; flex-direction: column; align-items: center; gap: 26px;')}>
            <div style={css('transform: rotate(5deg);')}>
              <div
                style={css(
                  'width: 150px; height: 150px; border-radius: 30px; background: #ffd233; box-shadow: 0 24px 50px rgba(238,181,47,0.4); display: flex; align-items: center; justify-content: center; animation: beatDrop 0.6s cubic-bezier(0.25, 1.2, 0.4, 1) both;',
                )}
              >
                <svg viewBox="0 0 48 48" style={css('width: 86px; height: 86px;')}>
                  <rect x="10" y="8" width="28" height="34" rx="3" fill="#fff" stroke="#1a1a1a" strokeWidth="2"></rect>
                  <line x1="15" y1="16" x2="33" y2="16" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="15" y1="22" x2="33" y2="22" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="15" y1="28" x2="28" y2="28" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"></line>
                </svg>
              </div>
            </div>
            <span
              style={css(
                'font-size: 62px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #e5a800; animation: stampIn 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) 0.12s both;',
              )}
            >
              Paper
            </span>
          </div>
        )}

        {vm.beatScissors && (
          <div style={css('display: flex; flex-direction: column; align-items: center; gap: 26px;')}>
            <div style={css('transform: rotate(-5deg);')}>
              <div
                style={css(
                  'width: 150px; height: 150px; border-radius: 30px; background: #00c9b8; box-shadow: 0 24px 50px rgba(0,201,184,0.4); display: flex; align-items: center; justify-content: center; animation: beatDrop 0.6s cubic-bezier(0.25, 1.2, 0.4, 1) both;',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  style={css('width: 80px; height: 80px;')}
                  fill="none"
                  stroke="#22242a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="6" r="3"></circle>
                  <path d="M8.12 8.12 12 12"></path>
                  <path d="M20 4 8.12 15.88"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <path d="M14.8 14.8 20 20"></path>
                </svg>
              </div>
            </div>
            <span
              style={css(
                'font-size: 62px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #00b8a9; animation: stampIn 0.45s cubic-bezier(0.2, 1.1, 0.4, 1) 0.12s both;',
              )}
            >
              Scissors
            </span>
          </div>
        )}

        {vm.beatAnything && (
          <div
            style={css(
              isDesktop
                ? 'position: relative; display: flex; flex-direction: column; align-items: center; gap: 30px;'
                : 'position: relative; display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 90vw; width: 100%; box-sizing: border-box;',
            )}
          >
            <div
              style={css(
                'position: absolute; left: 50%; top: 28%; width: 250px; height: 250px; margin: -125px 0 0 -125px; border-radius: 999px; border: 4px solid rgba(0,184,169,0.4); animation: glowRing 0.8s ease-out 0.32s both; pointer-events: none;',
              )}
            ></div>
            <div style={css('transform: rotate(4deg);')}>
              <div
                style={css(
                  'width: 150px; height: 150px; border-radius: 32px; background: #fffdfa; border: 4px solid #22242a; box-shadow: 8px 12px 0 rgba(34,36,42,0.16); display: flex; align-items: center; justify-content: center; animation: beatDrop 0.6s cubic-bezier(0.25, 1.2, 0.4, 1) both; position: relative; overflow: hidden;',
                )}
              >
                <div style={css('position: absolute; inset: 0; overflow: hidden; pointer-events: none;')}>
                  <div
                    style={css(
                      'position: absolute; top: 0; bottom: 0; width: 55%; background: linear-gradient(90deg, transparent, rgba(0,184,169,0.16), transparent); animation: sheenSweep 1.7s ease-in-out 0.5s infinite;',
                    )}
                  ></div>
                </div>
                <span style={css('position: absolute; right: 20px; top: 16px; color: #ffd233; font-size: 20px;')}>✦</span>
                <span style={css('font-size: 96px; font-weight: 900; color: #22242a; line-height: 1;')}>?</span>
              </div>
            </div>
            <div
              style={css(
                isDesktop
                  ? 'display: flex; gap: 3px;'
                  : 'display: flex; justify-content: center; align-items: baseline; flex-wrap: nowrap; gap: 1px; max-width: 90vw; width: 100%; box-sizing: border-box; text-align: center; overflow: hidden;',
              )}
            >
              {vm.anyLetters.map((L, i) => (
                <span
                  key={i}
                  style={
                    isDesktop
                      ? L.style
                      : {
                          ...L.style,
                          fontSize: 'clamp(2rem, 12vw, 5rem)',
                          maxWidth: '90vw',
                          textAlign: 'center',
                          lineHeight: 1,
                        }
                  }
                >
                  {L.ch}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
