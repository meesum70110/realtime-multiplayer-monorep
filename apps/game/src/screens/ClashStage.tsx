import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { FitStage } from '@/lib/FitStage'
import { VerdictBanner } from '@/overlays/VerdictBanner'

/** The clash scene (design lines 1017–1147): one continuous sequence where the glass
 *  barrier shatters, both cards flip and collide in a burst of shards and starbursts,
 *  and the winner is crowned — resolving into the verdict panel. */
export function ClashStage() {
  const vm = useView()
  return (
    <div data-screen-label="Clash" style={css('display: flex; flex-direction: column; align-items: center; gap: 0; width: 100%;')}>
      <div
        style={css(
          'position: fixed; inset: 0; background: #fffdfa; pointer-events: none; z-index: 41; opacity: 0; animation: flashOut 0.4s ease 2.82s both;',
        )}
      ></div>
      <div
        style={css(
          'position: fixed; inset: 0; pointer-events: none; z-index: 39; background: radial-gradient(ellipse 85% 75% at 50% 46%, transparent 42%, rgba(24,26,32,0.5) 100%); opacity: 0; animation: clashFocus 1.5s ease 1.75s both;',
        )}
      ></div>
      <div
        style={css(
          'position: fixed; inset: 0; pointer-events: none; z-index: 40; background: radial-gradient(circle at 50% 46%, rgba(255,138,110,0.55) 0%, rgba(230,57,70,0.3) 40%, transparent 72%); opacity: 0; animation: flashOut 0.35s ease 2.78s both;',
        )}
      ></div>

      <FitStage width={1000}>
      <div style={vm.clashStageStyle}>
        <div
          style={css(
            'position: absolute; left: 50%; bottom: -22px; width: 700px; height: 36px; margin-left: -350px; border-radius: 999px; background: radial-gradient(ellipse, rgba(34,36,42,0.15) 0%, rgba(34,36,42,0) 70%);',
          )}
        ></div>

        {vm.barrierBreaking && (
          <>
            <div style={vm.paneWrapBreakStyle}>
              <div style={vm.paneFrostBreakStyle}></div>
              {vm.paneFacetsBreak.map((f, i) => (
                <div key={i} style={f.style}></div>
              ))}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={vm.paneOverlayBreakStyle}>
                <polygon
                  points={vm.paneOutlinePts}
                  fill="none"
                  stroke="rgba(255,255,255,0.98)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                ></polygon>
                <polyline
                  points={vm.paneCrackPts}
                  fill="none"
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></polyline>
                {vm.paneLines.map((b, i) => (
                  <polyline
                    key={i}
                    points={b.pts}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="0.9"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={b.style}
                  ></polyline>
                ))}
              </svg>
              {vm.paneFragsBreak.map((fr, i) => (
                <div key={i} style={fr.style}></div>
              ))}
            </div>
            {vm.barShards.map((bs, i) => (
              <span key={i} style={bs.style}></span>
            ))}
            <div style={css('position: absolute; left: 0; right: 0; top: 92px; text-align: center; z-index: 6; pointer-events: none;')}>
              <span
                style={css(
                  'display: inline-block; font-size: 88px; font-weight: 900; font-style: italic; color: #ffd233; text-shadow: -4px -4px 0 #22242a, 4px -4px 0 #22242a, -4px 4px 0 #22242a, 4px 4px 0 #22242a, 0 -4px 0 #22242a, 0 4px 0 #22242a, -4px 0 0 #22242a, 4px 0 0 #22242a, 8px 10px 0 rgba(34,36,42,0.25); animation: slamWord 0.55s cubic-bezier(0.2, 1.2, 0.4, 1) 2.9s both;',
                )}
              >
                {vm.clashWord}
              </span>
            </div>
          </>
        )}

        {vm.verdictShown && vm.notTie && (
          <>
            <div
              style={css(
                'position: absolute; left: 50%; top: 205px; width: 300px; height: 300px; margin: -150px 0 0 -150px; border-radius: 999px; border: 4px solid rgba(246,201,69,0.6); opacity: 0; animation: glowRing 1.4s ease-out 0.5s infinite both; pointer-events: none;',
              )}
            ></div>
            <div
              style={css(
                'position: absolute; left: 50%; top: 205px; width: 300px; height: 300px; margin: -150px 0 0 -150px; border-radius: 999px; border: 4px solid rgba(246,201,69,0.4); opacity: 0; animation: glowRing 1.4s ease-out 1.1s infinite both; pointer-events: none;',
              )}
            ></div>
            <span style={css('position: absolute; left: 50%; top: 4px; margin-left: -26px; z-index: 6; transform: rotate(-12deg); pointer-events: none;')}>
              <span
                style={css(
                  'display: inline-block; font-size: 50px; line-height: 1; animation: beatDrop 0.55s cubic-bezier(0.25, 1.2, 0.4, 1) 0.75s both; filter: drop-shadow(0 8px 14px rgba(34,36,42,0.25));',
                )}
              >
                👑
              </span>
            </span>
          </>
        )}

        <div style={vm.yourClashWrapStyle}>
          <div style={vm.yourBraceStyle}>
            <div style={vm.yourFlipStyle}>
              <div style={vm.yourFaceStyle}>
                <div style={vm.cardTex}></div>
                <div style={vm.cardGloss}></div>
                <div style={css('position: absolute; inset: 0; overflow: hidden; pointer-events: none;')}>
                  <div
                    style={css(
                      'position: absolute; top: 0; bottom: 0; width: 55%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: sheenSweep 2.4s ease-in-out 1.6s infinite;',
                    )}
                  ></div>
                </div>
                <span style={vm.cardSpark}>✦</span>
                <span style={vm.cardTab}>{vm.playerName}</span>
                <span style={vm.cardMedal}>
                  <span style={css('font-size: 84px; line-height: 1;')}>{vm.yourEmoji}</span>
                </span>
                <span style={vm.cardPlate}>
                  <span style={vm.yourWordStyle}>{vm.yourWord}</span>
                </span>
              </div>
              <div style={vm.cardBackYou}>
                <div style={vm.cardBackPat}></div>
                <span style={vm.qYouSm}>?</span>
                <span
                  style={css(
                    'position: absolute; left: 50%; top: 50%; width: 186px; margin: -22px 0 0 -93px; box-sizing: border-box; text-align: center; background: #22242a; color: #ffd233; border: 3px solid #fffdfa; border-radius: 14px; padding: 10px 0; font-size: 15px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 5px 6px 0 rgba(34,36,42,0.22); z-index: 2;',
                  )}
                >
                  Locked ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={vm.streakLStyle}></div>
        <div style={vm.streakRStyle}></div>

        <div
          style={css(
            'position: absolute; left: 50%; top: 165px; width: 170px; height: 170px; margin: -85px 0 0 -85px; border-radius: 999px; background: radial-gradient(circle, rgba(246,201,69,0.95) 0%, rgba(246,201,69,0) 70%); animation: sparkBurst 0.5s ease 2.75s both; pointer-events: none; z-index: 3;',
          )}
        ></div>
        <div
          style={css(
            'position: absolute; left: 50%; top: 165px; width: 220px; height: 220px; margin: -110px 0 0 -110px; border-radius: 999px; border: 4px solid rgba(246,201,69,0.7); animation: glowRing 0.6s ease-out 2.8s both; pointer-events: none; z-index: 3;',
          )}
        ></div>
        <div
          style={css(
            'position: absolute; left: 50%; top: 165px; width: 250px; height: 250px; margin: -125px 0 0 -125px; clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%); background: #ffd233; animation: starburstA 0.5s cubic-bezier(0.2, 0.8, 0.4, 1) 2.78s both; pointer-events: none; z-index: 3;',
          )}
        ></div>
        <div
          style={css(
            'position: absolute; left: 50%; top: 165px; width: 160px; height: 160px; margin: -80px 0 0 -80px; clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%); background: #fffdfa; animation: starburstB 0.45s cubic-bezier(0.2, 0.8, 0.4, 1) 2.82s both; pointer-events: none; z-index: 3;',
          )}
        ></div>
        {vm.shards.map((sh, i) => (
          <span key={i} style={sh.style}></span>
        ))}

        <div style={vm.oppClashWrapStyle}>
          <div style={vm.oppBraceStyle}>
            <div style={vm.oppFlipStyle}>
              <div style={vm.oppFaceStyle}>
                <div style={vm.cardTex}></div>
                <div style={vm.cardGloss}></div>
                <div style={css('position: absolute; inset: 0; overflow: hidden; pointer-events: none;')}>
                  <div
                    style={css(
                      'position: absolute; top: 0; bottom: 0; width: 55%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: sheenSweep 2.4s ease-in-out 1.9s infinite;',
                    )}
                  ></div>
                </div>
                <span style={vm.cardSpark}>✦</span>
                <span style={vm.cardTab}>DOOM_BOT</span>
                <span style={vm.cardMedal}>
                  <span style={css('font-size: 84px; line-height: 1;')}>{vm.oppEmoji}</span>
                </span>
                <span style={vm.cardPlate}>
                  <span style={vm.oppWordStyle}>{vm.oppWord}</span>
                </span>
              </div>
              <div style={vm.cardBackOpp}>
                <div style={vm.cardBackPat}></div>
                <span style={vm.qOppSm}>?</span>
                <span
                  style={css(
                    'position: absolute; left: 50%; top: 50%; width: 186px; margin: -22px 0 0 -93px; box-sizing: border-box; text-align: center; background: #22242a; color: #ff8a6e; border: 3px solid #fffdfa; border-radius: 14px; padding: 10px 0; font-size: 15px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; box-shadow: 5px 6px 0 rgba(34,36,42,0.22); z-index: 2;',
                  )}
                >
                  Locked ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {vm.burst.map((b, i) => (
          <span key={i} style={b.style}>
            {b.emoji}
          </span>
        ))}
      </div>

      <div style={css('min-height: 110px; display: flex; justify-content: center; align-items: flex-start;')}>
        {vm.verdictShown && <VerdictBanner vm={vm} />}
      </div>
      </FitStage>
    </div>
  )
}
