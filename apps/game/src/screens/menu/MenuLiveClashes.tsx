import { css } from '@/lib/css'
import { Pressable } from '@/lib/Pressable'
import type { ViewModel } from '@rpsa/game-core'

/** Right column: the live clashes ticker — a feed of recent winner-vs-loser matchups
 *  (design lines 690–713). Each row's border/highlight style is computed in the
 *  view-model (`c.rowStyle`), flashing when a fresh clash arrives. */
export function MenuLiveClashes({ vm }: { vm: ViewModel }) {
  return (
    <Pressable
      as="aside"
      baseStyle={css(
        'width: 268px; box-sizing: border-box; flex-shrink: 0; position: relative; background: #fffdfa; border: 3px solid #22242a; border-radius: 26px; padding: 30px 14px 14px; box-shadow: 5px 8px 0 rgba(34,36,42,0.12); display: flex; flex-direction: column; gap: 12px; transition: transform 0.18s ease, box-shadow 0.18s ease; animation: riseFade 0.5s ease 0.18s both;',
      )}
      hoverStyle={css('transform: translateY(-4px); box-shadow: 8px 13px 0 rgba(34,36,42,0.14);')}
    >
      <div
        style={css(
          'position: absolute; top: -19px; left: 50%; transform: translateX(-50%) rotate(2.5deg); z-index: 2; background: #ff4d6d; border: 3px solid #22242a; border-radius: 13px; padding: 7px 16px; box-shadow: 3px 4px 0 rgba(34,36,42,0.16); display: flex; align-items: center; gap: 7px; white-space: nowrap;',
        )}
      >
        <span style={css('font-size: 15px; line-height: 1;')}>⚔️</span>
        <span
          style={css(
            'font-size: 13px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: #fffdfa;',
          )}
        >
          Live Clashes
        </span>
      </div>
      <span
        style={css(
          'display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #2ecc71;',
        )}
      >
        <span
          style={css(
            'width: 7px; height: 7px; border-radius: 999px; background: #2ecc71; animation: pulseDot 1.8s ease-out infinite;',
          )}
        ></span>
        Happening right now
      </span>
      <div style={css('display: flex; flex-direction: column; gap: 7px;')}>
        {vm.clashes.map((c) => (
          <Pressable
            key={c.id}
            as="div"
            baseStyle={c.rowStyle}
            hoverStyle={css('transform: translateX(3px); border-color: rgba(34,36,42,0.2);')}
          >
            <div style={css('position: relative; width: 52px; height: 38px; flex-shrink: 0;')}>
              <span
                style={css(
                  'position: absolute; top: 4px; left: 24px; width: 26px; height: 26px; border-radius: 9px; background: #f1e7d8; border: 2px solid #d8cbb8; display: flex; align-items: center; justify-content: center; font-size: 13px; transform: rotate(9deg); filter: grayscale(0.9); opacity: 0.7;',
                )}
              >
                {c.lEmoji}
              </span>
              <span
                style={css(
                  'position: absolute; top: 1px; left: 0; width: 31px; height: 31px; border-radius: 10px; background: #fffdfa; border: 2.5px solid #22242a; box-shadow: 2px 2.5px 0 rgba(34,36,42,0.16); display: flex; align-items: center; justify-content: center; font-size: 16px; transform: rotate(-8deg); z-index: 1;',
                )}
              >
                {c.wEmoji}
              </span>
              <span style={css('position: absolute; top: -7px; left: 21px; font-size: 12px; z-index: 2;')}>💥</span>
            </div>
            <div style={css('flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;')}>
              <span
                style={css(
                  'font-size: 13px; font-weight: 900; color: #22242a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
                )}
              >
                {c.wWord}
              </span>
              <span
                style={css(
                  'font-size: 10.5px; font-weight: 700; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
                )}
              >
                beat{' '}
                <span style={css('text-decoration: line-through; text-decoration-thickness: 1.5px; color: #b6bcc4;')}>
                  {c.lWord}
                </span>
              </span>
            </div>
            <span style={css('font-size: 10px; font-weight: 800; color: #b6bcc4; flex-shrink: 0;')}>{c.ago}</span>
          </Pressable>
        ))}
      </div>
    </Pressable>
  )
}
