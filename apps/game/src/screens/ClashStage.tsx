import type { CSSProperties } from 'react'
import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { FitStage } from '@/lib/FitStage'
import { useIsDesktop } from '@/lib/useBreakpoint'
import { MOBILE_CARD_SCALE_CSS } from '@/lib/fabDock'
import { VerdictBanner } from '@/overlays/VerdictBanner'

/** Completely replace desktop horizontal clash animations with pure Y-axis motion. */
function mobileClashAnimation(mine: boolean, base: CSSProperties, verdictShown: boolean): string {
  const anim = String(base.animation ?? '')
  if (/arenaLunge|skySlam|cyclone|upper/.test(anim)) {
    return mine
      ? 'clashVertRushBot 0.85s cubic-bezier(0.55, -0.2, 0.35, 1.15) 0.15s both'
      : 'clashVertRushTop 0.85s cubic-bezier(0.55, -0.2, 0.35, 1.15) 0.15s both'
  }
  /* Verdict: winner on midline; loser knocks out vertically off-screen. */
  if (verdictShown && /winArena/.test(anim)) {
    return 'clashVertWinCenter 0.85s cubic-bezier(0.3, 1.1, 0.4, 1) both'
  }
  if (verdictShown && /loseArena|dieDrop|dieSpin|dieBlast/.test(anim)) {
    // Top card (opponent) flies up; bottom card (player) flies down.
    return mine
      ? 'clashVertKnockoutBot 0.95s cubic-bezier(0.45, 0, 0.75, 0.35) both'
      : 'clashVertKnockoutTop 0.95s cubic-bezier(0.45, 0, 0.75, 0.35) both'
  }
  if (/tieArena/.test(anim)) {
    return mine
      ? 'clashVertTieBot 0.7s cubic-bezier(0.3, 1, 0.4, 1) both'
      : 'clashVertTieTop 0.7s cubic-bezier(0.3, 1, 0.4, 1) both'
  }
  return 'clashVertShake 0.55s ease both'
}

/** The clash scene (design lines 1017–1147): one continuous sequence where the glass
 *  barrier shatters, both cards flip and collide in a burst of shards and starbursts,
 *  and the winner is crowned — resolving into the verdict panel.
 *
 *  Desktop keeps the authored 1000px horizontal stage via FitStage.
 *  Mobile stacks cards in a column and uses vertical impact + knockout animations. */
export function ClashStage() {
  const vm = useView()
  const isDesktop = useIsDesktop()
  const scale = MOBILE_CARD_SCALE_CSS

  const mobileCardWrap = (mine: boolean, base: CSSProperties): CSSProperties => {
    const anim = String(base.animation ?? '')
    const isWin = /winArena/.test(anim)
    const isLose = /loseArena|dieDrop|dieSpin|dieBlast/.test(anim)
    const isTie = /tieArena/.test(anim)
    const box: CSSProperties = {
      width: `calc(250px * ${scale})`,
      height: `calc(330px * ${scale})`,
      maxHeight: '22vh',
      borderRadius: 26,
      flexShrink: 0,
      willChange: 'transform, opacity',
      overflow: 'visible',
      pointerEvents: 'none',
    }

    /* After impact: park both on the midline — winner stays, loser flies off Y-axis. */
    if (vm.verdictShown && (isWin || isLose || isTie)) {
      return {
        ...box,
        position: 'absolute',
        left: '50%',
        top: isTie ? (mine ? '58%' : '28%') : isWin ? '28%' : mine ? '55%' : '22%',
        marginLeft: `calc(-125px * ${scale})`,
        marginTop: `calc(-165px * ${scale})`,
        zIndex: isWin ? 12 : isLose ? 4 : 8,
        filter: isWin ? base.filter : isLose ? 'none' : base.filter,
        opacity: base.opacity,
        animation: mobileClashAnimation(mine, base, true),
        clipPath: 'none',
      }
    }

    /* Break / rush: stacked column, Y-axis only. */
    return {
      ...box,
      position: 'relative',
      left: 'auto',
      right: 'auto',
      top: 'auto',
      margin: '0 auto',
      willChange: 'transform',
      zIndex: typeof base.zIndex === 'number' ? base.zIndex : 2,
      filter: base.filter,
      opacity: base.opacity,
      animation: mobileClashAnimation(mine, base, false),
      clipPath: 'none',
      transform: 'translateX(0)',
      alignSelf: 'center',
    }
  }

  const mobileBrace = (): CSSProperties => ({
    perspective: '1200px',
    animation: vm.barrierBreaking ? 'cardCharge 0.85s ease-in-out 0.25s both' : 'none',
    position: 'absolute',
    left: '50%',
    top: 0,
    width: 250,
    height: 330,
    marginLeft: -125,
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  })

  const flashLayers = (
    <>
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
    </>
  )

  const yourCard = (
    <div style={isDesktop ? vm.yourClashWrapStyle : mobileCardWrap(true, vm.yourClashWrapStyle)}>
      <div style={isDesktop ? vm.yourBraceStyle : mobileBrace()}>
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
  )

  const oppCard = (
    <div style={isDesktop ? vm.oppClashWrapStyle : mobileCardWrap(false, vm.oppClashWrapStyle)}>
      <div style={isDesktop ? vm.oppBraceStyle : mobileBrace()}>
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
            <span style={vm.cardTab}>{vm.oppName}</span>
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
  )

  if (!isDesktop) {
    return (
      <div
        data-screen-label="Clash"
        style={css(
          'display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0; width: 100%; max-width: 100%; height: 100%; min-height: 0; flex: 1; overflow: visible; box-sizing: border-box; padding: clamp(6px, 1.5vh, 12px) 12px; position: relative;',
        )}
      >
        {flashLayers}
        <div
          style={css(
            vm.verdictShown
              ? 'position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: clamp(6px, 1.5vh, 12px); width: 100%; max-width: 90vw; height: 100%; min-height: 0; flex: 1; box-sizing: border-box; margin-left: auto; margin-right: auto; overflow: visible;'
              : 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(6px, 1.5vh, 10px); width: 100%; max-width: 90vw; box-sizing: border-box; margin-left: auto; margin-right: auto; overflow: visible;',
          )}
        >
          {oppCard}
          {!vm.verdictShown && (
            <div
              style={css(
                'position: relative; z-index: 50; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 52px; flex-shrink: 0; text-align: center; pointer-events: none;',
              )}
            >
              {vm.barrierBreaking && (
                <span
                  style={css(
                    'position: relative; z-index: 50; display: inline-block; font-size: clamp(2.5rem, 14vw, 4.5rem); font-weight: 900; font-style: italic; color: #ffd233; text-align: center; max-width: 90vw; text-shadow: -3px -3px 0 #22242a, 3px -3px 0 #22242a, -3px 3px 0 #22242a, 3px 3px 0 #22242a; animation: slamWord 0.55s cubic-bezier(0.2, 1.2, 0.4, 1) 0.15s both; line-height: 1;',
                  )}
                >
                  {vm.clashWord}
                </span>
              )}
            </div>
          )}
          {yourCard}
          {vm.verdictShown && vm.notTie && (
            <span
              style={css(
                'position: absolute; left: 50%; top: 10%; transform: translateX(-50%); z-index: 20; font-size: 40px; line-height: 1; animation: beatDrop 0.55s cubic-bezier(0.25, 1.2, 0.4, 1) both; pointer-events: none;',
              )}
            >
              👑
            </span>
          )}
          {vm.verdictShown && <VerdictBanner vm={vm} />}
        </div>
      </div>
    )
  }

  return (
    <div
      data-screen-label="Clash"
      style={css(
        'display: flex; flex-direction: column; align-items: stretch; gap: 0; width: 100%; max-width: 100%; flex: 1; min-height: 0; overflow: hidden; box-sizing: border-box;',
      )}
    >
      {flashLayers}

      {/* Scale only the card stage. Verdict stays outside FitStage on desktop so
          the NEXT IN countdown cannot be clipped by transform scale + overflow. */}
      <div
        style={css(
          'flex: 1 1 0; min-height: 0; width: 100%; overflow: hidden; display: flex; flex-direction: column;',
        )}
      >
      <FitStage width={1000} alwaysScale>
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

          {yourCard}

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

          {oppCard}

          {vm.burst.map((b, i) => (
            <span key={i} style={b.style}>
              {b.emoji}
            </span>
          ))}
        </div>
      </FitStage>
      </div>

      {vm.verdictShown && (
        <div
          style={css(
            'flex: 0 0 auto; width: 100%; max-height: min(38vh, 260px); overflow-x: hidden; overflow-y: auto; display: flex; justify-content: center; align-items: flex-start; padding: 6px 12px 18px; box-sizing: border-box; z-index: 6;',
          )}
        >
          <VerdictBanner vm={vm} />
        </div>
      )}
    </div>
  )
}
