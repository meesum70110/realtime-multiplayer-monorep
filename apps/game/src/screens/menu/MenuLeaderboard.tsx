import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import type { ViewModel } from '@rpsa/game-core'

/** Left column: the "Top Weapons" global-meta leaderboard — champion tile plus the
 *  ranked rest (design lines 588–616). Badge and win-rate chip styles are computed
 *  per row in the view-model (`w.badgeStyle` / `w.wrStyle`). */
export function MenuLeaderboard({ vm }: { vm: ViewModel }) {
  return (
    <Pressable
      as="aside"
      baseStyle={css(
        'width: 268px; box-sizing: border-box; flex-shrink: 0; position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 26px; padding: 30px 16px 16px; box-shadow: 5px 8px 0 rgba(34,36,42,0.12); display: flex; flex-direction: column; gap: 12px; transition: transform 0.18s ease, box-shadow 0.18s ease; animation: riseFade 0.5s ease 0.1s both;',
      )}
      hoverStyle={css('transform: translateY(-4px); box-shadow: 8px 13px 0 rgba(34,36,42,0.14);')}
    >
      <div
        style={css(
          'position: absolute; top: -19px; left: 50%; transform: translateX(-50%) rotate(-2.5deg); z-index: 2; background: #ffd233; border: 3px solid #22242a; border-radius: 13px; padding: 7px 16px; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); display: flex; align-items: center; gap: 7px; white-space: nowrap;',
        )}
      >
        <span style={css('font-size: 15px; line-height: 1;')}>🏆</span>
        <span
          style={css(
            'font-size: 13px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: #22242a;',
          )}
        >
          Top Weapons
        </span>
      </div>
      <span
        style={css(
          'text-align: center; font-size: 9.5px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #b6a58c;',
        )}
      >
        The global meta · this week
      </span>
      <div
        style={css(
          'position: relative; background: rgba(255,210,51,0.16); border: 2.5px solid #22242a; border-radius: 18px; padding: 11px 12px; box-shadow: 3px 4px 0 rgba(34,36,42,0.1); display: flex; align-items: center; gap: 12px;',
        )}
      >
        <span style={css('position: absolute; top: -17px; left: -11px; font-size: 24px; transform: rotate(-26deg);')}>
          👑
        </span>
        <span
          style={css(
            'width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px; background: #ffd233; border: 2.5px solid #22242a; box-shadow: 2px 3px 0 rgba(34,36,42,0.16); display: flex; align-items: center; justify-content: center; font-size: 25px; transform: rotate(-6deg);',
          )}
        >
          {vm.champ.emoji}
        </span>
        <div style={css('flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;')}>
          <span
            style={css(
              'font-size: 16px; font-weight: 900; color: #22242a; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
            )}
          >
            {vm.champ.word}
          </span>
          <span style={css('font-size: 10.5px; font-weight: 800; color: #8f6a00;')}>
            {vm.champ.plays} plays · {vm.champ.wr} wins
          </span>
        </div>
      </div>
      <div style={css('display: flex; flex-direction: column; gap: 4px;')}>
        {vm.topRest.map((w) => (
          <Pressable
            key={w.rank}
            as="div"
            baseStyle={css(
              'display: flex; align-items: center; gap: 10px; padding: 6px 7px; border-radius: 13px; transition: transform 0.14s ease, background 0.15s ease; cursor: default;',
            )}
            hoverStyle={css('background: #fbf5ec; transform: translateX(3px);')}
          >
            <span style={w.badgeStyle}>{w.rank}</span>
            <span style={css('font-size: 19px; line-height: 1; flex-shrink: 0;')}>{w.emoji}</span>
            <div style={css('flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;')}>
              <span
                style={css(
                  'font-size: 13.5px; font-weight: 900; color: #22242a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
                )}
              >
                {w.word}
              </span>
              <span style={css('font-size: 10px; font-weight: 700; color: #9ca3af;')}>{w.plays} plays</span>
            </div>
            <span style={w.wrStyle}>{w.wr} wins</span>
          </Pressable>
        ))}
      </div>
    </Pressable>
  )
}
