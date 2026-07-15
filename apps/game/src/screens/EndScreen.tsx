import { useView } from '@/store/useGameStore'
import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'

/** Match end (design lines 1151–1188): the win/loss medal and headline, the final score,
 *  a per-round battle recap, and rematch / back-to-lobby actions — with confetti on a win. */
export function EndScreen() {
  const vm = useView()
  return (
    <div
      data-screen-label="Match End"
      style={css('display: flex; flex-direction: column; align-items: center; gap: 13px; position: relative; width: 100%;')}
    >
      {vm.confetti.map((c, i) => (
        <span key={i} style={c.style}>
          {c.emoji}
        </span>
      ))}

      <div style={css('display: flex; flex-direction: column; align-items: center; gap: 12px; animation: riseFade 0.5s ease both;')}>
        <span style={vm.endMedalStyle}>{vm.endMedalEmoji}</span>
        <h1 style={vm.endTitleStyle}>{vm.endTitle}</h1>
        <p style={css('margin: 0; font-size: 18px; font-weight: 700; color: #6b7280;')}>{vm.endSub}</p>
      </div>

      <div style={css('display: flex; align-items: center; gap: 18px; animation: popIn 0.5s ease 0.35s both;')}>
        <span style={css('font-size: 12px; font-weight: 900; letter-spacing: 0.18em; color: #9ca3af; text-transform: uppercase;')}>
          You
        </span>
        <span style={css('font-size: 56px; font-weight: 900; color: #00b8a9; line-height: 1;')}>{vm.youScore}</span>
        <span style={css('font-size: 30px; font-weight: 900; color: #d8cbb8;')}>–</span>
        <span style={css('font-size: 56px; font-weight: 900; color: #e63946; line-height: 1;')}>{vm.oppScore}</span>
        <span style={css('font-size: 12px; font-weight: 900; letter-spacing: 0.18em; color: #9ca3af; text-transform: uppercase;')}>
          Bot
        </span>
      </div>

      <div
        style={css(
          'background: #fffdfa; border: 3px solid #22242a; border-radius: 26px; box-shadow: 6px 9px 0 rgba(34,36,42,0.13); padding: 20px 28px; display: flex; flex-direction: column; gap: 8px; min-width: 560px; animation: riseFade 0.5s ease 0.5s both; position: relative; z-index: 2;',
        )}
      >
        <span style={css('font-size: 11px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #b6a58c; text-align: center;')}>
          Battle recap
        </span>
        {vm.history.map((h, i) => (
          <div
            key={i}
            style={css(
              'display: grid; grid-template-columns: 34px 1fr 34px 1fr; align-items: center; gap: 12px; padding: 8px 4px; border-top: 2px solid #f5e6d3;',
            )}
          >
            <span style={css('font-weight: 900; font-size: 12px; color: #b6a58c;')}>{h.label}</span>
            <span style={h.youStyle}>
              <span style={css('font-size: 19px; margin-right: 8px;')}>{h.youEmoji}</span>
              {h.you}
            </span>
            <span style={h.resultChipStyle}>{h.resultMark}</span>
            <span style={h.oppStyle}>
              {h.opp}
              <span style={css('font-size: 19px; margin-left: 8px;')}>{h.oppEmoji}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={css('display: flex; gap: 16px; animation: riseFade 0.5s ease 0.65s both; position: relative; z-index: 2;')}>
        <Pressable
          as="button"
          onClick={vm.onRematch}
          baseStyle={css(
            "background: linear-gradient(90deg, #ff6b57, #ef4f3c, #e63946); color: #fff; border: none; border-radius: 999px; padding: 17px 52px; font-family: 'Inter', sans-serif; font-size: 19px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; box-shadow: 0 8px 24px rgba(239,79,60,0.45); transition: transform 0.12s ease;",
          )}
          hoverStyle={css('transform: translateY(-3px);')}
          activeStyle={css('transform: scale(0.97);')}
        >
          Rematch
        </Pressable>
        <Pressable
          as="button"
          onClick={vm.onMenu}
          baseStyle={css(
            "background: #fffdfa; color: #22242a; border: none; border-radius: 999px; padding: 17px 40px; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(34,36,42,0.05), 0 12px 28px rgba(34,36,42,0.08); transition: transform 0.12s ease;",
          )}
          hoverStyle={css('transform: translateY(-2px);')}
        >
          Back to Lobby
        </Pressable>
      </div>
    </div>
  )
}
